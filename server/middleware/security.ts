import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import { z } from 'zod';
import csurf from 'csurf';

// Rate limiting configuration (ISO/IEC 27002 A.9.4.1)
export const createRateLimit = (windowMs: number, max: number, message: string) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        error: 'Too many requests',
        message: 'Please try again later',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
  });
};

// Specific rate limits for different endpoints
export const authRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  15, // 15 attempts
  'Too many authentication attempts. Please try again later.'
);

export const generalRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  100, // 100 requests
  'Too many requests. Please try again later.'
);

// Security headers middleware (ISO/IEC 27002 A.12.2.1)
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "http://localhost:3001", "http://localhost:5173"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true,
  frameguard: { action: 'deny' }
});

// CORS configuration (ISO/IEC 27002 A.9.4.1)
export const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count'],
  maxAge: 86400 // 24 hours
};

// Input validation and sanitization (ISO/IEC 27002 A.12.2.1)
export const validateInput = (schema: z.ZodSchema) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Invalid input data',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      res.status(500).json({ error: 'Validation error' });
    }
  };
};

// Password strength validation (ISO/IEC 27002 A.9.3.1)
export const validatePasswordStrength = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Email validation (ISO/IEC 27002 A.12.2.1)
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

// Request logging for security monitoring (ISO/IEC 27002 A.12.4.1)
export const securityLogger = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logEntry = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
      userId: (req as any).user?.id || 'anonymous'
    };
    
    // Log security-relevant events
    if (res.statusCode >= 400) {
      console.warn('Security Event:', logEntry);
    }
  });
  
  next();
};

// Prevent sensitive data logging (ISO/IEC 27002 A.12.2.1)
export const sanitizeLogs = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // Remove sensitive data from logs
    if (req.body && (req.body.password || req.body.token)) {
      const sanitizedBody = { ...req.body };
      delete sanitizedBody.password;
      delete sanitizedBody.token;
      req.body = sanitizedBody;
    }
    
    return originalSend.call(this, data);
  };
  
  next();
};

// CSRF protection middleware (cookie-based)
export const csrfProtection = csurf({ cookie: true });

// CSRF error handler
export const csrfErrorHandler = (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err.code !== 'EBADCSRFTOKEN') return next(err);
  // CSRF token errors
  res.status(403).json({ error: 'Invalid CSRF token' });
};

// Apply all security middleware
export const applySecurityMiddleware = (app: express.Application) => {
  // Disable X-Powered-By header
  app.disable('x-powered-by');

  // Security headers
  app.use(securityHeaders);
  
  // CORS
  app.use(cors(corsOptions));
  
  // Rate limiting
  app.use(generalRateLimit);
  
  // Security logging
  app.use(securityLogger);
  
  // Sanitize logs
  app.use(sanitizeLogs);
  
  // Trust proxy for accurate IP addresses
  app.set('trust proxy', 1);
}; 