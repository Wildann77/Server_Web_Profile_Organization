import { z } from 'zod';
import { UserRole } from '@prisma/client';

export const createUserSchema = z.object({
    email: z.string().email('Email tidak valid'),
    password: z.string().min(8, 'Password minimal 8 karakter'),
    name: z.string().min(2, 'Nama minimal 2 karakter'),
    role: z.nativeEnum(UserRole).default(UserRole.EDITOR),
});

export const updateUserSchema = z.object({
    email: z.string().email('Email tidak valid').optional(),
    name: z.string().min(2, 'Nama minimal 2 karakter').optional(),
    role: z.nativeEnum(UserRole).optional(),
    password: z.string().min(8, 'Password minimal 8 karakter').optional(),
});

export const updateStatusSchema = z.object({
    isActive: z.boolean(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
