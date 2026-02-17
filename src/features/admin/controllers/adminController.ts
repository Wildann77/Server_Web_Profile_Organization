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

  // Get all users
  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            avatarUrl: true,
            isActive: true,
            createdAt: true,
            _count: {
              select: {
                articles: true,
              },
            },
          },
        }),
        prisma.user.count(),
      ]);

      res.json(
        createSuccessResponse(
          users,
          'Users berhasil diambil',
          {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          }
        )
      );
    } catch (error) {
      next(error);
    }
  }

  // Update user status
  async updateUserStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { isActive } = req.body;

      const user = await prisma.user.update({
        where: { id },
        data: { isActive },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
        },
      });

      res.json(
        createSuccessResponse(user, 'Status user berhasil diperbarui')
      );
    } catch (error) {
      next(error);
    }
  }

  // Get settings
  async getSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await prisma.setting.findMany({
        orderBy: { key: 'asc' },
      });

      res.json(
        createSuccessResponse(settings, 'Settings berhasil diambil')
      );
    } catch (error) {
      next(error);
    }
  }

  // Update setting
  async updateSetting(req: Request, res: Response, next: NextFunction) {
    try {
      const { key } = req.params;
      const { value } = req.body;

      const setting = await prisma.setting.upsert({
        where: { key },
        update: {
          value,
          updatedBy: req.user?.userId,
        },
        create: {
          key,
          value,
          updatedBy: req.user?.userId,
        },
      });

      res.json(
        createSuccessResponse(setting, 'Setting berhasil diperbarui')
      );
    } catch (error) {
      next(error);
    }
  }
}

export const adminController = new AdminController();
