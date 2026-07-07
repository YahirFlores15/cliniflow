import type { Role } from "@/shared/constants/roles";


export type AuthUserDTO = {
    id: string;
    name: string;
    email: string;
    role: Role;
    isActive: boolean;
};

export type SessionDTO = {
    id: string;
    userId: string;
    expiresAt: string;
    createdAt: string;
    revokedAt: string | null;
};

export type CurrentSessionDTO = {
    sessionId: string;
    user: AuthUserDTO;
};

export type AdminUserDTO = {
    id: string;
    name: string;
    email: string;
    role: Role;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
};