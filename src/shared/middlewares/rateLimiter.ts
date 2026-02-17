import { Request, Response, NextFunction } from 'express';

// Simple in-memory rate limiter
const requests = new Map<string, { count: number; resetTime: number }>();

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 100;

export const rateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || 'unknown';
  const now = Date.now();
  
  const record = requests.get(ip);
  
  if (!record || now > record.resetTime) {
    requests.set(ip, { count: 1, resetTime: now + WINDOW_MS });
    return next();
  }
  
  if (record.count >= MAX_REQUESTS) {
    return res.status(429).json({
      success: false,
      message: 'Terlalu banyak request, coba lagi nanti',
      error: { code: 'RATE_LIMIT' },
      timestamp: new Date().toISOString(),
    });
  }
  
  record.count++;
  next();
};

// Stricter rate limiter for auth endpoints
const authRequests = new Map<string, { count: number; resetTime: number }>();
const MAX_AUTH_REQUESTS = 5;

export const authRateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || 'unknown';
  const now = Date.now();
  
  const record = authRequests.get(ip);
  
  if (!record || now > record.resetTime) {
    authRequests.set(ip, { count: 1, resetTime: now + WINDOW_MS });
    return next();
  }
  
  if (record.count >= MAX_AUTH_REQUESTS) {
    return res.status(429).json({
      success: false,
      message: 'Terlalu banyak percobaan login, coba lagi nanti',
      error: { code: 'AUTH_RATE_LIMIT' },
      timestamp: new Date().toISOString(),
    });
  }
  
  record.count++;
  next();
};
