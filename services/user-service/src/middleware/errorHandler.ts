import { Request, Response, NextFunction } from 'express';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'error',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: '/app/logs/error.log' }),
    new winston.transports.Console()
  ]
});

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // Log error with context
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    requestId: req.requestId,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id || 'anonymous',
    timestamp: new Date().toISOString()
  });

  // Don't expose internal errors in production
  if (process.env.NODE_ENV === 'production') {
    res.status(500).json({
      error: 'Internal server error',
      requestId: req.requestId
    });
  } else {
    res.status(500).json({
      error: err.message,
      stack: err.stack,
      requestId: req.requestId
    });
  }
};