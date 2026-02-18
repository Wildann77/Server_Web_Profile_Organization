import { z } from 'zod';
import { ArticleStatus, ArticleVisibility } from '@prisma/client';

export const createArticleSchema = z.object({
  title: z.string()
    .min(5, 'Judul minimal 5 karakter')
    .max(200, 'Judul maksimal 200 karakter'),
  slug: z.string()
    .min(3, 'Slug minimal 3 karakter')
    .max(200, 'Slug maksimal 200 karakter')
    .regex(/^[a-z0-9-]+$/, 'Slug hanya boleh huruf kecil, angka, dan tanda hubung'),
  content: z.string().min(50, 'Konten minimal 50 karakter'),
  excerpt: z.string().max(500, 'Ringkasan maksimal 500 karakter').optional(),
  thumbnailUrl: z.string().url('URL thumbnail tidak valid').optional().or(z.literal('')),
  status: z.nativeEnum(ArticleStatus).default(ArticleStatus.DRAFT),
  visibility: z.nativeEnum(ArticleVisibility).default(ArticleVisibility.PUBLIC),
  metaTitle: z.string().max(70, 'Meta title maksimal 70 karakter').optional().or(z.literal('')),
  metaDescription: z.string().max(160, 'Meta description maksimal 160 karakter').optional().or(z.literal('')),
  publishedAt: z.preprocess((arg) => {
    if (typeof arg === 'string' && arg.length > 0) {
      return new Date(arg).toISOString();
    }
    return arg;
  }, z.string().datetime().optional().or(z.literal(''))),
});

export const updateArticleSchema = createArticleSchema.partial();

export const articleQuerySchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('10'),
  status: z.nativeEnum(ArticleStatus).optional(),
  visibility: z.nativeEnum(ArticleVisibility).optional(),
  search: z.string().optional(),
  authorId: z.string().uuid().optional(),
});

export const slugParamSchema = z.object({
  slug: z.string(),
});

export type CreateArticleInput = z.infer<typeof createArticleSchema>;
export type UpdateArticleInput = z.infer<typeof updateArticleSchema>;
export type ArticleQueryInput = z.infer<typeof articleQuerySchema>;
