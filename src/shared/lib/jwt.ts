import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface RefreshTokenPayload extends TokenPayload {
  type: 'refresh';
}

export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(
    { ...payload, type: 'refresh' },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  return jwt.verify(token, JWT_SECRET) as RefreshTokenPayload;
};
