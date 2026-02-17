import { User, UserRole } from '@prisma/client';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl: string | null;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
}

export interface SessionMetadata {
  ip: string | undefined;
  userAgent: string | undefined;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}
