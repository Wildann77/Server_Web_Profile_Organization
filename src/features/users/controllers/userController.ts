import { Request, Response, NextFunction } from 'express';
import { createSuccessResponse } from '@/shared/lib/response';
import { userService } from '../services/userService';
import { createUserSchema, updateUserSchema, updateStatusSchema } from '../schemas/userSchema';
import { UserRole } from '@prisma/client';

export class UserController {
    // GET /api/v1/users
    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const { role, isActive, search } = req.query;
            const filters = {
                role: role as UserRole,
                isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
                search: search as string,
            };

            const users = await userService.getAll(filters);
            res.json(createSuccessResponse(users, 'Daftar pengguna berhasil diambil'));
        } catch (error) {
            next(error);
        }
    }

    // GET /api/v1/users/:id
    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params as { id: string };
            const user = await userService.getById(id);
            res.json(createSuccessResponse(user, 'Data pengguna berhasil diambil'));
        } catch (error) {
            next(error);
        }
    }

    // POST /api/v1/users
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const data = createUserSchema.parse(req.body);
            const user = await userService.create(data);
            res.status(201).json(createSuccessResponse(user, 'Pengguna berhasil dibuat'));
        } catch (error) {
            next(error);
        }
    }

    // PATCH /api/v1/users/:id
    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params as { id: string };
            const data = updateUserSchema.parse(req.body);
            const user = await userService.update(id, data);
            res.json(createSuccessResponse(user, 'Data pengguna berhasil diperbarui'));
        } catch (error) {
            next(error);
        }
    }

    // PATCH /api/v1/users/:id/status
    async toggleStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params as { id: string };
            const data = updateStatusSchema.parse(req.body);
            const user = await userService.toggleStatus(id, data);
            res.json(createSuccessResponse(user, 'Status pengguna berhasil diperbarui'));
        } catch (error) {
            next(error);
        }
    }

    // DELETE /api/v1/users/:id
    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params as { id: string };
            await userService.delete(id, req.user?.userId);
            res.json(createSuccessResponse(null, 'Pengguna berhasil dihapus'));
        } catch (error) {
            next(error);
        }
    }
}

export const userController = new UserController();
