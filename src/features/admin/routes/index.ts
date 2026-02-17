import { Router } from 'express';
import { adminController } from '../controllers/adminController';
import { authenticate, authorize } from '@/features/auth/middlewares/authMiddleware';
import { UserRole } from '@prisma/client';

const router = Router();

// All routes require ADMIN role
router.use(authenticate, authorize(UserRole.ADMIN));

// Dashboard
router.get('/dashboard', adminController.getDashboardStats.bind(adminController));

// Users
router.get('/users', adminController.getUsers.bind(adminController));
router.patch('/users/:id/status', adminController.updateUserStatus.bind(adminController));

// Settings
router.get('/settings', adminController.getSettings.bind(adminController));
router.patch('/settings/:key', adminController.updateSetting.bind(adminController));

export { router as adminRoutes };
