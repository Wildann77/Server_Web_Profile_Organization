import { Request, Response, NextFunction } from 'express';
import { createSuccessResponse } from '@/shared/lib/response';
import { settingService } from '../services/settingService';
import { updateSettingSchema, updateBulkSettingsSchema } from '../schemas/settingSchema';

export class SettingController {
    // GET /api/v1/settings (public: only isPublic=true)
    async getPublicSettings(req: Request, res: Response, next: NextFunction) {
        try {
            const settings = await settingService.getAll(false);
            res.json(createSuccessResponse(settings, 'Settings berhasil diambil'));
        } catch (error) {
            next(error);
        }
    }

    // GET /api/v1/admin/settings (admin: all settings)
    async getAllSettings(req: Request, res: Response, next: NextFunction) {
        try {
            const settings = await settingService.getAll(true);
            res.json(createSuccessResponse(settings, 'Settings berhasil diambil'));
        } catch (error) {
            next(error);
        }
    }

    // PATCH /api/v1/admin/settings/:key
    async updateSetting(req: Request, res: Response, next: NextFunction) {
        try {
            const { key } = req.params as { key: string };
            const data = updateSettingSchema.parse(req.body);
            const setting = await settingService.update(key, data, req.user?.userId);
            res.json(createSuccessResponse(setting, 'Setting berhasil diperbarui'));
        } catch (error) {
            next(error);
        }
    }

    // PATCH /api/v1/admin/settings (bulk update)
    async updateBulkSettings(req: Request, res: Response, next: NextFunction) {
        try {
            const data = updateBulkSettingsSchema.parse(req.body);
            const settings = await settingService.updateBulk(data, req.user?.userId);
            res.json(createSuccessResponse(settings, 'Settings berhasil diperbarui'));
        } catch (error) {
            next(error);
        }
    }
}

export const settingController = new SettingController();
