export const USER_ROLES = {
    SUPERUSER: "SUPERUSER",
    STAFF: "STAFF",
    DOCTOR: "DOCTOR",
    PATIENT: "PATIENT",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const USER_ROLE_VALUES = Object.values(USER_ROLES);