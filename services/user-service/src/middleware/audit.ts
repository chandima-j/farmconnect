import { Request, Response, NextFunction } from 'express';
import winston from 'winston';
import crypto from 'crypto';

// Audit logger configuration (ISO 27001 A.12.4.1)
const auditLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ 
      filename: '/app/logs/audit.log',
      maxsize: 10485760, // 10MB
      maxFiles: 50 // Keep 50 files (ISO 27001 retention requirement)
    })
  ]
});

// Audit logging middleware
export const auditLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();
  
  // Add request ID to request object
  req.requestId = requestId;

  // Log request
  auditLogger.info('Request received', {
    requestId,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
    userId: req.user?.id || 'anonymous',
    sessionId: req.sessionID || 'none'
  });

  // Override res.json to log response
  const originalJson = res.json;
  res.json = function(body: any) {
    const duration = Date.now() - startTime;
    
    // Log response (excluding sensitive data)
    const logData = {
      requestId,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration,
      timestamp: new Date().toISOString(),
      userId: req.user?.id || 'anonymous',
      success: res.statusCode < 400
    };

    // Log different levels based on status code
    if (res.statusCode >= 500) {
      auditLogger.error('Server error response', logData);
    } else if (res.statusCode >= 400) {
      auditLogger.warn('Client error response', logData);
    } else {
      auditLogger.info('Successful response', logData);
    }

    return originalJson.call(this, body);
  };

  next();
};

// Security event logger
export const logSecurityEvent = (event: string, details: any, severity: 'low' | 'medium' | 'high' | 'critical' = 'medium') => {
  auditLogger.warn('Security event', {
    event,
    severity,
    details,
    timestamp: new Date().toISOString()
  });
};

export { auditLogger };