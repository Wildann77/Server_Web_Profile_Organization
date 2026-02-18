export interface Setting {
    id: string;
    key: string;
    value: string;
    description: string | null;
    isPublic: boolean;
    updatedAt: Date;
    updatedBy: string | null;
}

export interface SettingPublic {
    key: string;
    value: string;
}
