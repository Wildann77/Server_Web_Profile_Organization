import { prisma } from '@/shared/lib/prisma';
import { AppError, ErrorCode } from '@/shared/errors/AppError';
import bcrypt from 'bcryptjs';
import { CreateUserInput, UpdateUserInput, UpdateStatusInput } from '../schemas/userSchema';
import { UserFilters } from '../types';

export class UserService {
    // Get all users
    async getAll(filters: UserFilters = {}) {
        const { role, isActive, search } = filters;

        const where: any = {};
        if (role) where.role = role;
        if (typeof isActive === 'boolean') where.isActive = isActive;
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }

        return prisma.user.findMany({
            where,
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                avatarUrl: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    // Get user by ID
    async getById(id: string) {
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                avatarUrl: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!user) {
            throw new AppError('Pengguna tidak ditemukan', 404, ErrorCode.NOT_FOUND);
        }

        return user;
    }

    // Create user
    async create(data: CreateUserInput) {
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (existingUser) {
            throw new AppError('Email sudah terdaftar', 400, ErrorCode.VALIDATION_ERROR);
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);

        return prisma.user.create({
            data: {
                ...data,
                password: hashedPassword,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isActive: true,
                createdAt: true,
            },
        });
    }

    // Update user
    async update(id: string, data: UpdateUserInput) {
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
            throw new AppError('Pengguna tidak ditemukan', 404, ErrorCode.NOT_FOUND);
        }

        if (data.email && data.email !== user.email) {
            const emailExists = await prisma.user.findUnique({ where: { email: data.email } });
            if (emailExists) {
                throw new AppError('Email sudah digunakan oleh pengguna lain', 400, ErrorCode.VALIDATION_ERROR);
            }
        }

        const updateData: any = { ...data };
        if (data.password) {
            updateData.password = await bcrypt.hash(data.password, 10);
        }

        return prisma.user.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isActive: true,
                updatedAt: true,
            },
        });
    }

    // Toggle status
    async toggleStatus(id: string, data: UpdateStatusInput) {
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
            throw new AppError('Pengguna tidak ditemukan', 404, ErrorCode.NOT_FOUND);
        }

        return prisma.user.update({
            where: { id },
            data: { isActive: data.isActive },
            select: {
                id: true,
                email: true,
                isActive: true,
            },
        });
    }

    // Delete user
    async delete(id: string, requesterId?: string) {
        if (id === requesterId) {
            throw new AppError('Anda tidak dapat menghapus akun Anda sendiri', 400, ErrorCode.VALIDATION_ERROR);
        }

        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
            throw new AppError('Pengguna tidak ditemukan', 404, ErrorCode.NOT_FOUND);
        }

        return prisma.user.delete({ where: { id } });
    }
}

export const userService = new UserService();
