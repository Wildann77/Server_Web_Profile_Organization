import { z } from 'zod';

export const updateSettingSchema = z.object({
    value: z.string().min(1, 'Nilai tidak boleh kosong'),
});

export const updateBulkSettingsSchema = z.object({
    settings: z.record(z.string(), z.string()),
});

export type UpdateSettingInput = z.infer<typeof updateSettingSchema>;
export type UpdateBulkSettingsInput = z.infer<typeof updateBulkSettingsSchema>;
