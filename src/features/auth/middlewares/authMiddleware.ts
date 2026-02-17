import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';
import { AppError, ErrorCode, UnauthorizedError, ForbiddenError } from '@/shared/errors/AppError';
import { prisma } from '@/shared/lib/prisma';

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: UserRole;
      };
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

// Authenticate JWT
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedError('Token tidak ditemukan');
    }
    
    const token = authHeader.substring(7);
    
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
      role: UserRole;
    };
    
    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true, isActive: true },
    });
    
    if (!user || !user.isActive) {
      throw new UnauthorizedError('User tidak aktif');
    }
    
    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(new AppError('Token expired', 401, ErrorCode.TOKEN_EXPIRED));
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new UnauthorizedError('Token tidak valid'));
    }
    next(error);
  }
};

// Authorize by roles
export const authorize = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError());
    }
    
    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError('Anda tidak memiliki akses'));
    }
    
    next();
  };
};

// Optional auth - doesn't throw error if no token
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader?.startsWith('Bearer ')) {
      return next();
    }
    
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
      role: UserRole;
    };
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true, isActive: true },
    });
    
    if (user && user.isActive) {
      req.user = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };
    }
    
    next();
  } catch {
    // Ignore auth errors for optional auth
    next();
  }
};
