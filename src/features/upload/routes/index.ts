import { Router } from 'express';
import { uploadController } from '../controllers/uploadController';
import { upload, handleUploadError } from '../middlewares/uploadMiddleware';
import { authenticate, authorize } from '@/features/auth/middlewares/authMiddleware';
import { UserRole } from '@prisma/client';

const router = Router();

// Protected routes - only ADMIN and EDITOR can upload
router.post(
  '/image',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.EDITOR),
  upload.single('image'),
  handleUploadError,
  uploadController.uploadImage.bind(uploadController)
);

router.post(
  '/thumbnail',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.EDITOR),
  upload.single('image'),
  handleUploadError,
  uploadController.uploadThumbnail.bind(uploadController)
);

router.post(
  '/settings',
  authenticate,
  authorize(UserRole.ADMIN),
  upload.single('image'),
  handleUploadError,
  uploadController.uploadSettingImage.bind(uploadController)
);

router.delete(
  '/image/:publicId',
  authenticate,
  authorize(UserRole.ADMIN),
  uploadController.deleteImage.bind(uploadController)
);

export { router as uploadRoutes };
