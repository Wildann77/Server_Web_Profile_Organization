import { Router } from 'express';
import { userController } from '../controllers/userController';
import { authenticate, authorize } from '@/features/auth/middlewares/authMiddleware';
import { UserRole } from '@prisma/client';

const router = Router();

// Semua route di sini diproteksi: Harus login dan harus role ADMIN
router.use(authenticate, authorize(UserRole.ADMIN));

router.get('/', userController.getAll.bind(userController));
router.get('/:id', userController.getById.bind(userController));
router.post('/', userController.create.bind(userController));
router.patch('/:id', userController.update.bind(userController));
router.patch('/:id/status', userController.toggleStatus.bind(userController));
router.delete('/:id', userController.delete.bind(userController));

export { router as userRoutes };
