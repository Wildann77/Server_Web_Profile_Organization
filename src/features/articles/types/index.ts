import { Article, ArticleStatus, ArticleVisibility, User } from '@prisma/client';

export interface ArticleWithAuthor extends Article {
  author: Pick<User, 'name' | 'avatarUrl'>;
}

export interface ArticleListItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  thumbnailUrl: string | null;
  status: ArticleStatus;
  visibility: ArticleVisibility;
  publishedAt: Date | null;
  viewCount: number;
  createdAt: Date;
  author: {
    name: string;
    avatarUrl: string | null;
  };
}

export interface ArticleDetail extends ArticleListItem {
  content: string;
  metaTitle: string | null;
  metaDescription: string | null;
  updatedAt: Date;
}

export interface ArticleFilters {
  page: number;
  limit: number;
  status?: ArticleStatus;
  visibility?: ArticleVisibility;
  search?: string;
  authorId?: string;
}

export interface PaginatedArticles {
  articles: ArticleListItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
