import { prisma } from '@/shared/lib/prisma';
import { AppError, ErrorCode } from '@/shared/errors/AppError';
import { UpdateSettingInput, UpdateBulkSettingsInput } from '../schemas/settingSchema';

export class SettingService {
    // Get all settings (admin: all, public: isPublic only)
    async getAll(isAdmin: boolean = false) {
        return prisma.setting.findMany({
            where: isAdmin ? undefined : { isPublic: true },
            orderBy: { key: 'asc' },
        });
    }

    // Get single setting by key
    async getByKey(key: string) {
        const setting = await prisma.setting.findUnique({ where: { key } });
        if (!setting) {
            throw new AppError(`Setting '${key}' tidak ditemukan`, 404, ErrorCode.NOT_FOUND);
        }
        return setting;
    }

    // Update single setting
    async update(key: string, data: UpdateSettingInput, userId?: string) {
        const existing = await prisma.setting.findUnique({ where: { key } });
        if (!existing) {
            throw new AppError(`Setting '${key}' tidak ditemukan`, 404, ErrorCode.NOT_FOUND);
        }

        return prisma.setting.update({
            where: { key },
            data: {
                value: data.value,
                updatedBy: userId,
            },
        });
    }

    // Update multiple settings at once
    async updateBulk(data: UpdateBulkSettingsInput, userId?: string) {
        const updates = Object.entries(data.settings).map(([key, value]) =>
            prisma.setting.upsert({
                where: { key },
                update: { value, updatedBy: userId },
                create: { key, value, isPublic: true, updatedBy: userId },
            })
        );

        return prisma.$transaction(updates);
    }
}

export const settingService = new SettingService();
