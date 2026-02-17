import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authRateLimiter } from '@/shared/middlewares/rateLimiter';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

// Public routes
router.post('/login', authRateLimiter, authController.login.bind(authController));
router.post('/register', authController.register.bind(authController));
router.post('/refresh', authController.refresh.bind(authController));

// Protected routes
router.post('/logout', authenticate, authController.logout.bind(authController));
router.post('/logout-all', authenticate, authController.logoutAll.bind(authController));
router.get('/me', authenticate, authController.me.bind(authController));
router.post('/change-password', authenticate, authController.changePassword.bind(authController));

export { router as authRoutes };
