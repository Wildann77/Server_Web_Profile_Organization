import { Router } from 'express';
import { articleController } from '../controllers/articleController';
import { authenticate, authorize } from '@/features/auth/middlewares/authMiddleware';
import { UserRole } from '@prisma/client';

const router = Router();

// Public routes
router.get('/public', articleController.getPublicArticles.bind(articleController));
router.get('/public/:slug', articleController.getPublicArticleBySlug.bind(articleController));

// Protected routes (Admin & Editor)
router.get(
  '/',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.EDITOR),
  articleController.getAdminArticles.bind(articleController)
);

router.get(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.EDITOR),
  articleController.getArticleById.bind(articleController)
);

router.post(
  '/',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.EDITOR),
  articleController.createArticle.bind(articleController)
);

router.patch(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.EDITOR),
  articleController.updateArticle.bind(articleController)
);

router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  articleController.deleteArticle.bind(articleController)
);

export { router as articleRoutes };
