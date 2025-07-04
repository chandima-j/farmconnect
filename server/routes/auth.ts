import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { 
  authRateLimit, 
  validateInput, 
  validatePasswordStrength, 
  validateEmail 
} from '../middleware/security.js';

const router = express.Router();
const prisma = new PrismaClient();

// Enhanced validation schemas with ISO/IEC 27002 compliance
const registerSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .min(5, 'Email must be at least 5 characters')
    .max(254, 'Email must be less than 254 characters')
    .refine(validateEmail, 'Invalid email format'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters')
    .refine((password) => {
      const validation = validatePasswordStrength(password);
      return validation.isValid;
    }, (password) => {
      const validation = validatePasswordStrength(password);
      return { message: validation.errors.join(', ') };
    }),
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  userType: z.enum(['FARMER', 'BUYER', 'ADMIN'], {
    errorMap: () => ({ message: 'Invalid user type' })
  }),
  farmName: z.string().max(200).optional(),
  location: z.string().max(200).optional(),
  description: z.string().max(1000).optional(),
  address: z.string().max(500).optional(),
  phone: z.string()
    .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number format')
    .optional(),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'MODERATOR']).optional(),
});

const loginSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .refine(validateEmail, 'Invalid email format'),
  password: z.string()
    .min(1, 'Password is required')
    .max(128, 'Password too long'),
});

// Secure registration with rate limiting and enhanced validation
router.post('/register', 
  authRateLimit,
  validateInput(registerSchema),
  async (req, res) => {
  try {
      const validatedData = req.body;
      
      // Additional server-side validation
      if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'fallback-secret') {
        console.error('Critical: JWT_SECRET not properly configured');
        return res.status(500).json({ error: 'Server configuration error' });
      }
    
      // Check if user already exists (case-insensitive)
      const existingUser = await prisma.user.findFirst({
        where: { 
          email: validatedData.email.toLowerCase()
        }
    });

    if (existingUser) {
        return res.status(409).json({ 
          error: 'User already exists with this email',
          code: 'EMAIL_EXISTS'
        });
    }

      // Enhanced password hashing with higher cost factor
      const saltRounds = 14; // Increased from 12 for better security
      const hashedPassword = await bcrypt.hash(validatedData.password, saltRounds);

      // Create user in transaction with enhanced error handling
    const result = await prisma.$transaction(async (tx) => {
      // Create base user
      const user = await tx.user.create({
        data: {
            email: validatedData.email.toLowerCase().trim(),
          password: hashedPassword,
            name: validatedData.name.trim(),
          userType: validatedData.userType,
          status: validatedData.userType === 'FARMER' ? 'PENDING' : 'ACTIVE',
        }
      });

        // Create type-specific profile with sanitized data
      if (validatedData.userType === 'FARMER') {
        await tx.farmer.create({
          data: {
            userId: user.id,
              farmName: validatedData.farmName?.trim() || '',
              location: validatedData.location?.trim() || '',
              description: validatedData.description?.trim() || '',
            status: 'PENDING',
          }
        });
      } else if (validatedData.userType === 'BUYER') {
        await tx.buyer.create({
          data: {
            userId: user.id,
              address: validatedData.address?.trim() || '',
              phone: validatedData.phone?.trim() || '',
            status: 'ACTIVE',
          }
        });
      } else if (validatedData.userType === 'ADMIN') {
        await tx.admin.create({
          data: {
            userId: user.id,
            role: validatedData.role || 'MODERATOR',
            permissions: '[]',
          }
        });
      }

      return user;
    });

      // Generate secure JWT token with shorter expiration
      const token = jwt.sign(
        { 
          userId: result.id, 
          email: result.email, 
          userType: result.userType,
          iat: Math.floor(Date.now() / 1000)
        },
        process.env.JWT_SECRET,
        { 
          expiresIn: '24h', // Reduced from 7d for better security
          issuer: 'farmconnect',
          audience: 'farmconnect-users'
        }
      );

      // Set secure HTTP-only cookie
      res.cookie('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        path: '/'
      });

    res.status(201).json({ 
      message: 'User registered successfully',
      user: {
        id: result.id,
        email: result.email,
        name: result.name,
        userType: result.userType
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
      
      // Don't expose internal errors to client
    if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: 'Invalid input data', 
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
    }
      
      res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
  }
);

// Secure login with rate limiting and enhanced validation
router.post('/login', 
  authRateLimit,
  validateInput(loginSchema),
  async (req, res) => {
  try {
      const { email, password } = req.body;

      // Find user with related data (case-insensitive email)
      const user = await prisma.user.findFirst({
        where: { 
          email: email.toLowerCase()
        },
      include: {
        farmer: true,
        buyer: true,
        admin: true,
      }
    });

      // Use consistent error message for security (prevents user enumeration)
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

      // Check password with timing attack protection
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user is suspended
    if (user.status === 'SUSPENDED') {
        return res.status(403).json({ 
          error: 'Account suspended. Please contact support.',
          code: 'ACCOUNT_SUSPENDED'
        });
    }

      // Generate secure JWT token
    const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email, 
          userType: user.userType,
          iat: Math.floor(Date.now() / 1000)
        },
        process.env.JWT_SECRET!,
        { 
          expiresIn: '24h',
          issuer: 'farmconnect',
          audience: 'farmconnect-users'
        }
      );

      // Set secure HTTP-only cookie
      res.cookie('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        path: '/'
      });

      // Prepare user data (exclude sensitive information)
    let userData: any = {
      id: user.id,
      email: user.email,
      name: user.name,
      type: user.userType.toLowerCase(),
      avatar: user.avatarUrl,
      createdAt: user.createdAt,
    };

    if (user.userType === 'FARMER' && user.farmer) {
      userData = {
        ...userData,
        farmName: user.farmer.farmName,
        location: user.farmer.location,
        description: user.farmer.description,
        rating: user.farmer.rating,
        totalSales: user.farmer.totalSales,
        verified: user.farmer.verified,
        status: user.farmer.status.toLowerCase(),
      };
    } else if (user.userType === 'BUYER' && user.buyer) {
      userData = {
        ...userData,
        address: user.buyer.address,
        phone: user.buyer.phone,
        status: user.buyer.status.toLowerCase(),
      };
    } else if (user.userType === 'ADMIN' && user.admin) {
      userData = {
        ...userData,
        role: user.admin.role.toLowerCase(),
        permissions: JSON.parse(user.admin.permissions),
      };
    }

    res.json({
        message: 'Login successful',
      user: userData
    });
  } catch (error) {
    console.error('Login error:', error);
      
      // Don't expose internal errors to client
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input data' });
    }
      
      res.status(500).json({ error: 'Login failed. Please try again.' });
    }
  }
);

// Get current user
router.get('/me', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        farmer: true,
        buyer: true,
        admin: true,
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prepare user data based on type (same logic as login)
    let userData: any = {
      id: user.id,
      email: user.email,
      name: user.name,
      type: user.userType.toLowerCase(),
      avatar: user.avatarUrl,
      createdAt: user.createdAt,
    };

    if (user.userType === 'FARMER' && user.farmer) {
      userData = {
        ...userData,
        farmName: user.farmer.farmName,
        location: user.farmer.location,
        description: user.farmer.description,
        rating: user.farmer.rating,
        totalSales: user.farmer.totalSales,
        verified: user.farmer.verified,
        status: user.farmer.status.toLowerCase(),
      };
    } else if (user.userType === 'BUYER' && user.buyer) {
      userData = {
        ...userData,
        address: user.buyer.address,
        phone: user.buyer.phone,
        status: user.buyer.status.toLowerCase(),
      };
    } else if (user.userType === 'ADMIN' && user.admin) {
      userData = {
        ...userData,
        role: user.admin.role.toLowerCase(),
        permissions: JSON.parse(user.admin.permissions),
      };
    }

    res.json({ user: userData });
  } catch (error) {
    res.status(403).json({ error: 'Invalid token' });
  }
});

export default router;