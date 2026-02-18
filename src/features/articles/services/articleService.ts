import { prisma } from '@/shared/lib/prisma';
import { AppError, ErrorCode } from '@/shared/errors/AppError';
import { ArticleStatus, ArticleVisibility } from '@prisma/client';
import {
  ArticleFilters,
  ArticleListItem,
  ArticleDetail,
  PaginatedArticles,
} from '../types';
import { CreateArticleInput, UpdateArticleInput } from '../schemas/articleSchema';

export class ArticleService {
  // Get all articles with pagination and filters
  async getArticles(filters: ArticleFilters, isAdmin: boolean = false): Promise<PaginatedArticles> {
    const { page, limit, status, visibility, search, authorId } = filters;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    const andFilters: any[] = [];

    // For public access, only show published and public articles
    if (!isAdmin) {
      andFilters.push({ status: ArticleStatus.PUBLISHED });
      andFilters.push({ visibility: ArticleVisibility.PUBLIC });
      // Show articles published now or in the past, or those without explicit publishedAt date
      andFilters.push({
        OR: [
          { publishedAt: { lte: new Date() } },
          { publishedAt: null },
        ],
      });
    } else {
      // Admin can filter by status and visibility
      if (status) andFilters.push({ status });
      if (visibility) andFilters.push({ visibility });
    }

    // Search by title or content
    if (search) {
      andFilters.push({
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    // Filter by author
    if (authorId) {
      andFilters.push({ authorId });
    }

    if (andFilters.length > 0) {
      where.AND = andFilters;
    }

    // Get total count
    const total = await prisma.article.count({ where });

    // Get articles
    const articles = await prisma.article.findMany({
      where,
      skip,
      take: limit,
      orderBy: [
        { publishedAt: 'desc' },
        { createdAt: 'desc' },
      ],
      include: {
        author: {
          select: {
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    return {
      articles: articles.map(this.mapToListItem.bind(this)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get article by slug
  async getArticleBySlug(slug: string, isAdmin: boolean = false): Promise<ArticleDetail> {
    const article = await prisma.article.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!article) {
      throw new AppError('Artikel tidak ditemukan', 404, ErrorCode.NOT_FOUND);
    }

    // Check if article is accessible
    if (!isAdmin) {
      if (article.status !== ArticleStatus.PUBLISHED) {
        throw new AppError('Artikel tidak ditemukan', 404, ErrorCode.NOT_FOUND);
      }
      if (article.visibility !== ArticleVisibility.PUBLIC) {
        throw new AppError('Artikel tidak ditemukan', 404, ErrorCode.NOT_FOUND);
      }
      if (article.publishedAt && article.publishedAt > new Date()) {
        throw new AppError('Artikel tidak ditemukan', 404, ErrorCode.NOT_FOUND);
      }
    }

    // Increment view count
    await prisma.article.update({
      where: { id: article.id },
      data: { viewCount: { increment: 1 } },
    });

    return this.mapToDetail(article);
  }

  // Get article by ID (for admin)
  async getArticleById(id: string): Promise<ArticleDetail> {
    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!article) {
      throw new AppError('Artikel tidak ditemukan', 404, ErrorCode.NOT_FOUND);
    }

    return this.mapToDetail(article);
  }

  // Create article
  async createArticle(data: CreateArticleInput, authorId: string): Promise<ArticleDetail> {
    // Check if slug already exists
    const existingArticle = await prisma.article.findUnique({
      where: { slug: data.slug },
    });

    if (existingArticle) {
      throw new AppError('Slug sudah digunakan', 409, ErrorCode.ALREADY_EXISTS, {
        slug: ['Slug sudah digunakan oleh artikel lain'],
      });
    }

    const article = await prisma.article.create({
      data: {
        title: data.title,
        slug: data.slug,
        content: data.content,
        excerpt: data.excerpt,
        thumbnailUrl: data.thumbnailUrl || null,
        status: data.status,
        visibility: data.visibility,
        metaTitle: data.metaTitle || null,
        metaDescription: data.metaDescription || null,
        publishedAt: (data.publishedAt && (data.publishedAt as any).trim() !== '') ? new Date(data.publishedAt as any) : null,
        authorId,
      },
      include: {
        author: {
          select: {
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    return this.mapToDetail(article);
  }

  // Update article
  async updateArticle(id: string, data: UpdateArticleInput): Promise<ArticleDetail> {
    const article = await prisma.article.findUnique({
      where: { id },
    });

    if (!article) {
      throw new AppError('Artikel tidak ditemukan', 404, ErrorCode.NOT_FOUND);
    }

    // Check if slug is being changed and if it's already taken
    if (data.slug && data.slug !== article.slug) {
      const existingArticle = await prisma.article.findUnique({
        where: { slug: data.slug },
      });

      if (existingArticle) {
        throw new AppError('Slug sudah digunakan', 409, ErrorCode.ALREADY_EXISTS, {
          slug: ['Slug sudah digunakan oleh artikel lain'],
        });
      }
    }

    const updatedArticle = await prisma.article.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        content: data.content,
        excerpt: data.excerpt,
        thumbnailUrl: data.thumbnailUrl,
        status: data.status,
        visibility: data.visibility,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        publishedAt: (data.publishedAt && (data.publishedAt as any).trim() !== '') ? new Date(data.publishedAt as any) : (data.publishedAt === '' ? null : undefined),
      },
      include: {
        author: {
          select: {
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    return this.mapToDetail(updatedArticle);
  }

  // Delete article
  async deleteArticle(id: string): Promise<void> {
    const article = await prisma.article.findUnique({
      where: { id },
    });

    if (!article) {
      throw new AppError('Artikel tidak ditemukan', 404, ErrorCode.NOT_FOUND);
    }

    await prisma.article.delete({
      where: { id },
    });
  }

  // Map article to list item
  private mapToListItem(article: any): ArticleListItem {
    return {
      id: article.id,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      thumbnailUrl: article.thumbnailUrl,
      status: article.status,
      visibility: article.visibility,
      publishedAt: article.publishedAt,
      viewCount: article.viewCount,
      createdAt: article.createdAt,
      author: article.author,
    };
  }

  // Map article to detail
  private mapToDetail(article: any): ArticleDetail {
    return {
      ...this.mapToListItem(article),
      content: article.content,
      metaTitle: article.metaTitle,
      metaDescription: article.metaDescription,
      updatedAt: article.updatedAt,
    };
  }
}

export const articleService = new ArticleService();
