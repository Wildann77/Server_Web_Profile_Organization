# AGENTS.md - Backend Web Profil Organisasi

This document provides guidance for AI coding agents working in this repository.

## Project Overview

Backend API for organizational profile website (Muhammadiyah). Built with:
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js 5.x
- **Database**: PostgreSQL with Prisma ORM
- **Validation**: Zod
- **Auth**: JWT with bcryptjs
- **File Storage**: Cloudinary

## Build/Lint/Test Commands

```bash
# Development
npm run dev              # Start dev server with hot reload (ts-node-dev)

# Build
npm run build            # Compile TypeScript to dist/
npm run start            # Run production server from dist/

# Database (Prisma)
npm run db:generate      # Generate Prisma client
npm run db:migrate       # Run migrations (development)
npm run db:deploy        # Deploy migrations (production)
npm run db:studio        # Open Prisma Studio GUI
npm run db:seed          # Seed database
npm run db:reset         # Reset database (warning: destructive)

# No test/lint commands currently defined
```

## Environment Setup

Copy `.env.example` to `.env` and configure:
- `DATABASE_URL` - PostgreSQL connection string
- `DIRECT_URL` - Direct connection for migrations (Neon/Supabase)
- `JWT_SECRET` - Minimum 32 characters
- `CLOUDINARY_*` - Cloudinary credentials
- `FRONTEND_URL` - CORS origin

## Project Structure

```
src/
├── app.ts                    # Express app factory
├── server.ts                 # Server entry point
├── features/                 # Feature modules
│   ├── auth/
│   │   ├── controllers/      # Request handlers
│   │   ├── services/         # Business logic
│   │   ├── routes/           # Route definitions
│   │   ├── schemas/          # Zod validation schemas
│   │   ├── middlewares/      # Feature-specific middleware
│   │   └── types/            # TypeScript types
│   ├── articles/
│   ├── upload/
│   └── admin/
└── shared/                   # Shared utilities
    ├── errors/               # AppError classes
    ├── lib/                  # Utilities (prisma, jwt, logger)
    ├── middlewares/          # Global middleware
    └── types/                # Shared types
```

## Code Style Guidelines

### Imports

Order imports as follows:
1. Node built-ins / dotenv
2. External packages (express, zod, prisma)
3. Internal aliases (`@/shared/...`, `@/features/...`)
4. Relative imports (same feature)

```typescript
import 'dotenv/config';
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '@/shared/lib/prisma';
import { AppError, ErrorCode } from '@/shared/errors/AppError';
import { createSuccessResponse } from '@/shared/lib/response';
import { articleService } from '../services/articleService';
```

### TypeScript

- **Strict mode enabled** - all code must pass strict type checking
- Use explicit return types for functions
- Avoid `any` - use `unknown` or specific types
- Use path aliases: `@/shared/lib/prisma` instead of relative paths

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files | camelCase | `articleService.ts` |
| Classes | PascalCase | `ArticleService`, `AppError` |
| Interfaces | PascalCase | `ArticleFilters` |
| Functions | camelCase | `getArticleBySlug` |
| Constants | UPPER_SNAKE | `JWT_SECRET`, `COOKIE_MAX_AGE` |
| Variables | camelCase | `article`, `userId` |
| Zod schemas | camelCase + Schema | `createArticleSchema` |
| Types from Zod | Input/Output suffix | `CreateArticleInput` |

### Controllers

Controllers are classes with async methods:
```typescript
export class ArticleController {
  async getArticles(req: Request, res: Response, next: NextFunction) {
    try {
      const data = schema.parse(req.body);
      const result = await service.method(data);
      res.json(createSuccessResponse(result, 'Message'));
    } catch (error) {
      next(error);
    }
  }
}

export const articleController = new ArticleController();
```

### Services

Services are singleton classes with private helper methods:
```typescript
export class ArticleService {
  async getArticles(filters: Filters): Promise<Result> {
    // Business logic here
  }

  private mapToDTO(entity: Entity): DTO {
    // Transform database entity to DTO
  }
}

export const articleService = new ArticleService();
```

### Routes

Use Router with middleware chain:
```typescript
const router = Router();

// Public routes
router.get('/public', controller.method.bind(controller));

// Protected routes
router.get(
  '/',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.EDITOR),
  controller.method.bind(controller)
);

export { router as articleRoutes };
```

### Error Handling

Use AppError classes, never throw generic Error:
```typescript
import { AppError, ErrorCode, NotFoundError, ValidationError } from '@/shared/errors/AppError';

// Specific errors
throw new NotFoundError('Artikel', slug);
throw new ValidationError({ title: ['Judul wajib diisi'] });

// Generic AppError
throw new AppError('Message', 404, ErrorCode.NOT_FOUND);
```

Error codes are defined in `src/shared/errors/AppError.ts`:
- `AUTH_*` - Authentication errors
- `VAL_*` - Validation errors
- `RES_*` - Resource errors (not found, already exists)
- `SRV_*` - Server errors

### Response Format

All responses use standardized format:
```typescript
// Success
createSuccessResponse(data, 'Message', meta);

// Error (handled by error middleware)
createErrorResponse('Message', ErrorCode.VALIDATION_ERROR, details);
```

Response shape:
```typescript
{
  success: boolean;
  message: string;
  data?: T;
  meta?: { page, limit, total, totalPages };
  error?: { code: string; details?: Record<string, string[]> };
  timestamp: string;
}
```

### Validation (Zod)

Define schemas in `schemas/` folder:
```typescript
export const createArticleSchema = z.object({
  title: z.string().min(5, 'Judul minimal 5 karakter'),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug format invalid'),
});

export type CreateArticleInput = z.infer<typeof createArticleSchema>;
```

### User Messages

Use Indonesian language for user-facing messages:
- "Artikel berhasil diambil"
- "Validasi gagal"
- "User tidak ditemukan"

### Database (Prisma)

Import singleton client:
```typescript
import { prisma } from '@/shared/lib/prisma';

// Queries
const user = await prisma.user.findUnique({ where: { id } });
await prisma.article.create({ data: { ... } });
```

## Adding a New Feature

1. Create folder in `src/features/{feature}/`
2. Create files: `types/index.ts`, `schemas/{feature}Schema.ts`, `services/{feature}Service.ts`, `controllers/{feature}Controller.ts`, `routes/index.ts`
3. Define Zod schemas and export types
4. Implement service class with business logic
5. Implement controller with try/catch passing errors to next()
6. Define routes with appropriate middleware
7. Import routes in `src/app.ts`

## API Versioning

All API routes are prefixed with `/api/v1/`:
```typescript
app.use('/api/v1/articles', articleRoutes);
```

## Authentication

Protected routes use middleware:
- `authenticate` - Validates JWT, populates `req.user`
- `authorize(...roles)` - Checks user role
- `optionalAuth` - Sets `req.user` if token present, no error if absent

User roles: `ADMIN`, `EDITOR`, `VIEWER` (from Prisma enum)
