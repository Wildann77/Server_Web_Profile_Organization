import { Router } from 'express';
import { settingController } from '../controllers/settingController';
import { authenticate, authorize } from '@/features/auth/middlewares/authMiddleware';
import { UserRole } from '@prisma/client';

const router = Router();

// Public: only isPublic settings
router.get('/public', settingController.getPublicSettings.bind(settingController));

// Admin only
router.get(
    '/',
    authenticate,
    authorize(UserRole.ADMIN),
    settingController.getAllSettings.bind(settingController)
);

router.patch(
    '/',
    authenticate,
    authorize(UserRole.ADMIN),
    settingController.updateBulkSettings.bind(settingController)
);

router.patch(
    '/:key',
    authenticate,
    authorize(UserRole.ADMIN),
    settingController.updateSetting.bind(settingController)
);

export { router as settingRoutes };
