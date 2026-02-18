import { UserRole } from '@prisma/client';

export interface UserResponse {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    avatarUrl?: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface UserFilters {
    role?: UserRole;
    isActive?: boolean;
    search?: string;
}
