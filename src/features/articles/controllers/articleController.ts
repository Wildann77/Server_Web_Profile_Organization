import { Request, Response, NextFunction } from 'express';
import { articleService } from '../services/articleService';
import {
  createArticleSchema,
  updateArticleSchema,
  articleQuerySchema,
  slugParamSchema,
} from '../schemas/articleSchema';
import { createSuccessResponse } from '@/shared/lib/response';
import { ArticleFilters } from '../types';

export class ArticleController {
  // Get all articles (public)
  async getPublicArticles(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = articleQuerySchema.parse(req.query) as ArticleFilters;
      const result = await articleService.getArticles(filters, false);

      res.json(
        createSuccessResponse(result, 'Artikel berhasil diambil')
      );
    } catch (error) {
      next(error);
    }
  }

  // Get all articles (admin)
  async getAdminArticles(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = articleQuerySchema.parse(req.query) as ArticleFilters;
      const result = await articleService.getArticles(filters, true);

      res.json(
        createSuccessResponse(result, 'Artikel berhasil diambil')
      );
    } catch (error) {
      next(error);
    }
  }

  // Get article by slug (public)
  async getPublicArticleBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = slugParamSchema.parse(req.params);
      const article = await articleService.getArticleBySlug(slug, false);

      res.json(createSuccessResponse(article, 'Artikel berhasil diambil'));
    } catch (error) {
      next(error);
    }
  }

  // Get article by slug (admin)
  async getAdminArticleBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = slugParamSchema.parse(req.params);
      const article = await articleService.getArticleBySlug(slug, true);

      res.json(createSuccessResponse(article, 'Artikel berhasil diambil'));
    } catch (error) {
      next(error);
    }
  }

  // Get article by ID (admin)
  async getArticleById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const article = await articleService.getArticleById(id as string);

      res.json(createSuccessResponse(article, 'Artikel berhasil diambil'));
    } catch (error) {
      next(error);
    }
  }

  // Create article
  async createArticle(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
          error: { code: 'AUTH_001' },
          timestamp: new Date().toISOString(),
        });
      }

      const data = createArticleSchema.parse(req.body);
      const article = await articleService.createArticle(data, req.user.userId);

      res.status(201).json(createSuccessResponse(article, 'Artikel berhasil dibuat'));
    } catch (error) {
      next(error);
    }
  }

  // Update article
  async updateArticle(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = updateArticleSchema.parse(req.body);
      const article = await articleService.updateArticle(id as string, data);

      res.json(createSuccessResponse(article, 'Artikel berhasil diperbarui'));
    } catch (error) {
      next(error);
    }
  }

  // Delete article
  async deleteArticle(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await articleService.deleteArticle(id as string);

      res.json(createSuccessResponse(null, 'Artikel berhasil dihapus'));
    } catch (error) {
      next(error);
    }
  }
}

export const articleController = new ArticleController();
