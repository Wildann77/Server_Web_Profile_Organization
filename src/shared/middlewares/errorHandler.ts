import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorCode, NotFoundError, ValidationError, UnauthorizedError, ForbiddenError } from '../errors/AppError';
import { createErrorResponse } from '../lib/response';
import { logger } from '../lib/logger';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Log error
  logger.error({
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    requestId: req.headers['x-request-id'],
  });

  // Handle AppError (operational errors)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json(
      createErrorResponse(err.message, err.code, err.details)
    );
  }

  // Handle Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as { code: string; meta?: { target?: string[] } };
    
    if (prismaError.code === 'P2002') {
      return res.status(409).json(
        createErrorResponse(
          'Data sudah ada',
          ErrorCode.ALREADY_EXISTS,
          { unique: prismaError.meta?.target || ['field'] }
        )
      );
    }
    
    if (prismaError.code === 'P2025') {
      return res.status(404).json(
        createErrorResponse('Data tidak ditemukan', ErrorCode.NOT_FOUND)
      );
    }
  }

  // Handle Zod validation errors
  if (err.name === 'ZodError') {
    const zodError = err as { errors: Array<{ path: string[]; message: string }> };
    const details: Record<string, string[]> = {};
    
    zodError.errors.forEach((e) => {
      const key = e.path.join('.');
      if (!details[key]) details[key] = [];
      details[key].push(e.message);
    });
    
    return res.status(400).json(
      createErrorResponse('Validasi gagal', ErrorCode.VALIDATION_ERROR, details)
    );
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json(
      createErrorResponse('Token tidak valid', ErrorCode.UNAUTHORIZED)
    );
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json(
      createErrorResponse('Token sudah expired', ErrorCode.TOKEN_EXPIRED)
    );
  }

  // Default: Internal server error
  const isDev = process.env.NODE_ENV === 'development';
  
  return res.status(500).json(
    createErrorResponse(
      isDev ? err.message : 'Terjadi kesalahan internal server',
      ErrorCode.INTERNAL_ERROR,
      isDev ? { stack: [err.stack || ''] } : undefined
    )
  );
};
