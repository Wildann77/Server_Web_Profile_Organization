import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService';
import { loginSchema, registerSchema, changePasswordSchema } from '../schemas/authSchema';
import { createSuccessResponse } from '@/shared/lib/response';
import { SessionMetadata } from '../types';

const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

export class AuthController {
  // Login
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const data = loginSchema.parse(req.body);
      
      const metadata: SessionMetadata = {
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      };

      const result = await authService.login(data, metadata);

      // Set refresh token in HttpOnly cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: COOKIE_MAX_AGE,
        path: '/api/v1/auth',
      });

      res.json(
        createSuccessResponse(
          {
            user: result.user,
            accessToken: result.accessToken,
          },
          'Login berhasil'
        )
      );
    } catch (error) {
      next(error);
    }
  }

  // Register
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const data = registerSchema.parse(req.body);
      const user = await authService.register(data);

      res.status(201).json(
        createSuccessResponse(user, 'Registrasi berhasil')
      );
    } catch (error) {
      next(error);
    }
  }

  // Refresh token
  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token tidak ditemukan',
          error: { code: 'TOKEN_EXPIRED' },
          timestamp: new Date().toISOString(),
        });
      }

      const result = await authService.refreshAccessToken(refreshToken);

      res.json(
        createSuccessResponse(result, 'Token berhasil diperbarui')
      );
    } catch (error) {
      next(error);
    }
  }

  // Logout
  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (refreshToken) {
        await authService.logout(refreshToken);
      }

      // Clear cookie
      res.clearCookie('refreshToken', { path: '/api/v1/auth' });

      res.json(createSuccessResponse(null, 'Logout berhasil'));
    } catch (error) {
      next(error);
    }
  }

  // Logout all sessions
  async logoutAll(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
          error: { code: 'AUTH_001' },
          timestamp: new Date().toISOString(),
        });
      }

      await authService.logoutAll(req.user.userId);

      // Clear cookie
      res.clearCookie('refreshToken', { path: '/api/v1/auth' });

      res.json(createSuccessResponse(null, 'Semua session berhasil dihapus'));
    } catch (error) {
      next(error);
    }
  }

  // Get current user
  async me(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
          error: { code: 'AUTH_001' },
          timestamp: new Date().toISOString(),
        });
      }

      const user = await authService.getCurrentUser(req.user.userId);

      res.json(createSuccessResponse(user, 'User berhasil diambil'));
    } catch (error) {
      next(error);
    }
  }

  // Change password
  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
          error: { code: 'AUTH_001' },
          timestamp: new Date().toISOString(),
        });
      }

      const data = changePasswordSchema.parse(req.body);
      await authService.changePassword(
        req.user.userId,
        data.currentPassword,
        data.newPassword
      );

      res.json(createSuccessResponse(null, 'Password berhasil diubah'));
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
