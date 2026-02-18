import { Request, Response, NextFunction } from 'express';
import { prisma } from '@/shared/lib/prisma';
import { createSuccessResponse } from '@/shared/lib/response';
import { ArticleStatus } from '@prisma/client';

export class AdminController {
  // Get dashboard stats
  async getDashboardStats(req: Request, res: Response, next: NextFunction) {
    try {
      // Get article counts
      const totalArticles = await prisma.article.count();
      const publishedArticles = await prisma.article.count({
        where: { status: ArticleStatus.PUBLISHED },
      });
      const draftArticles = await prisma.article.count({
        where: { status: ArticleStatus.DRAFT },
      });

      // Get user counts
      const totalUsers = await prisma.user.count();

      // Get recent articles
      const recentArticles = await prisma.article.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              name: true,
              avatarUrl: true,
            },
          },
        },
      });

      // Get total views
      const viewsResult = await prisma.article.aggregate({
        _sum: {
          viewCount: true,
        },
      });

      res.json(
        createSuccessResponse({
          stats: {
            totalArticles,
            publishedArticles,
            draftArticles,
            totalUsers,
            totalViews: viewsResult._sum.viewCount || 0,
          },
          recentArticles,
        }, 'Dashboard stats berhasil diambil')
      );
    } catch (error) {
      next(error);
    }
  }
}

export const adminController = new AdminController();
