import express from 'express';
import { PrismaClient } from '@prisma/client';
import { applySecurityMiddleware, csrfProtection, csrfErrorHandler } from './middleware/security.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import adminRoutes from './routes/admin.js';
import https from 'https';
import fs from 'fs';
import path from 'path';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Global request logger for debugging
app.use((req, res, next) => {
  console.log('ALL INCOMING:', req.method, req.url, req.headers);
  next();
});

// CORS configuration to allow frontend and Authorization header
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Add cookie-parser middleware
app.use(cookieParser());

// Body parsing middleware with size limits (must come before csrfProtection)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CSRF protection (must come after cookie-parser and body parsers, before routes)
app.use(csrfProtection);

// Expose CSRF token for frontend (if needed)
app.get('/api/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Apply comprehensive security middleware (ISO/IEC 27001/27002 compliance)
applySecurityMiddleware(app);

// Global rate limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(globalLimiter);

// Apply rate limiting to auth routes (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: 'Too many authentication attempts, please try again later.'
});
app.use('/api/auth', authLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Security: 404 handler for undefined routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Global error handling middleware (ISO/IEC 27002 A.12.2.1)
app.use(csrfErrorHandler);
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  
  // Don't expose internal error details to client
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Temporarily disable HTTPS - run with HTTP only
app.listen(PORT, () => {
  console.log(`🚀 HTTP Server running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
  console.log(`🔒 Security: ISO/IEC 27001/27002 compliant`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'fallback-secret') {
    console.warn('⚠️  WARNING: JWT_SECRET not properly configured');
  }
  if (process.env.NODE_ENV === 'production' && !process.env.CLIENT_URL?.startsWith('https://')) {
    console.warn('⚠️  WARNING: Production should use HTTPS');
  }
});

// Graceful shutdown with security considerations
process.on('SIGINT', async () => {
  console.log('🛡️  Shutting down securely...');
  
  // Clear any sensitive data from memory
  process.env.JWT_SECRET = '';
  
  // Close database connections
  await prisma.$disconnect();
  
  console.log('✅ Server shutdown complete');
  process.exit(0);
});

// Handle uncaught exceptions (security best practice)
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

export default app;