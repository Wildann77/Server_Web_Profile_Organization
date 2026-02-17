export enum ErrorCode {
  // Auth errors
  UNAUTHORIZED = 'AUTH_001',
  FORBIDDEN = 'AUTH_002',
  INVALID_CREDENTIALS = 'AUTH_003',
  TOKEN_EXPIRED = 'AUTH_004',
  
  // Validation errors
  VALIDATION_ERROR = 'VAL_001',
  INVALID_INPUT = 'VAL_002',
  
  // Resource errors
  NOT_FOUND = 'RES_001',
  ALREADY_EXISTS = 'RES_002',
  
  // Server errors
  INTERNAL_ERROR = 'SRV_001',
  DATABASE_ERROR = 'SRV_002',
  EXTERNAL_SERVICE_ERROR = 'SRV_003',
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;
  public readonly details?: Record<string, string[]>;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number,
    code: ErrorCode,
    details?: Record<string, string[]>,
    isOperational = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = isOperational;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

// Specific error classes
export class NotFoundError extends AppError {
  constructor(resource: string, identifier?: string) {
    super(
      `${resource}${identifier ? ` dengan identifier "${identifier}"` : ''} tidak ditemukan`,
      404,
      ErrorCode.NOT_FOUND
    );
  }
}

export class ValidationError extends AppError {
  constructor(details: Record<string, string[]>) {
    super('Validasi gagal', 400, ErrorCode.VALIDATION_ERROR, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, ErrorCode.UNAUTHORIZED);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403, ErrorCode.FORBIDDEN);
  }
}
