import bcrypt from 'bcryptjs';
import { prisma } from '@/shared/lib/prisma';
import { AppError, ErrorCode } from '@/shared/errors/AppError';
import { generateAccessToken, generateRefreshToken } from '@/shared/lib/jwt';
import { AuthResponse, AuthUser, SessionMetadata } from '../types';
import { LoginInput, RegisterInput } from '../schemas/authSchema';
import { UserRole } from '@prisma/client';

const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

export class AuthService {
  // Login user
  async login(data: LoginInput, metadata: SessionMetadata): Promise<AuthResponse & { refreshToken: string }> {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user || !user.isActive) {
      throw new AppError('Email atau password salah', 401, ErrorCode.INVALID_CREDENTIALS);
    }

    // Verify password
    const isValid = await bcrypt.compare(data.password, user.password);

    if (!isValid) {
      throw new AppError('Email atau password salah', 401, ErrorCode.INVALID_CREDENTIALS);
    }

    // Generate tokens
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Save refresh token to database
    await prisma.session.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + COOKIE_MAX_AGE),
        ipAddress: metadata.ip,
        userAgent: metadata.userAgent,
      },
    });

    return {
      user: this.mapToAuthUser(user),
      accessToken,
      refreshToken,
    };
  }

  // Register user
  async register(data: RegisterInput): Promise<AuthUser> {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError('Email sudah terdaftar', 409, ErrorCode.ALREADY_EXISTS);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password as string, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role: data.role || UserRole.EDITOR,
      },
    });

    return this.mapToAuthUser(user);
  }

  // Refresh access token
  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
    // Check if session exists and is active
    const session = await prisma.session.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!session || session.status !== 'ACTIVE' || session.expiresAt < new Date()) {
      throw new AppError('Session expired', 401, ErrorCode.TOKEN_EXPIRED);
    }

    // Check if user is still active
    if (!session.user.isActive) {
      throw new AppError('User tidak aktif', 401, ErrorCode.UNAUTHORIZED);
    }

    // Generate new access token
    const accessToken = generateAccessToken({
      userId: session.user.id,
      email: session.user.email,
      role: session.user.role,
    });

    return { accessToken };
  }

  // Logout - revoke session
  async logout(refreshToken: string): Promise<void> {
    await prisma.session.updateMany({
      where: { token: refreshToken },
      data: { status: 'REVOKED' },
    });
  }

  // Logout all sessions for user
  async logoutAll(userId: string): Promise<void> {
    await prisma.session.updateMany({
      where: { userId, status: 'ACTIVE' },
      data: { status: 'REVOKED' },
    });
  }

  // Get current user
  async getCurrentUser(userId: string): Promise<AuthUser> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('User tidak ditemukan', 404, ErrorCode.NOT_FOUND);
    }

    return this.mapToAuthUser(user);
  }

  // Change password
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('User tidak ditemukan', 404, ErrorCode.NOT_FOUND);
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password);

    if (!isValid) {
      throw new AppError('Password saat ini tidak benar', 400, ErrorCode.INVALID_CREDENTIALS);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }

  // Map user to AuthUser
  private mapToAuthUser(user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    avatarUrl: string | null;
  }): AuthUser {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatarUrl: user.avatarUrl,
    };
  }
}

export const authService = new AuthService();
