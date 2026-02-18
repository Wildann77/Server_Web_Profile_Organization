import { Router } from 'express';
import { adminController } from '../controllers/adminController';
import { authenticate, authorize } from '@/features/auth/middlewares/authMiddleware';
import { UserRole } from '@prisma/client';

const router = Router();

// All routes require ADMIN role
router.use(authenticate, authorize(UserRole.ADMIN));

// Dashboard
router.get('/dashboard', adminController.getDashboardStats.bind(adminController));

export { router as adminRoutes };
