export const ROLES = {
    SUPERUSER: "SUPERUSER",
    STAFF: "STAFF",
    DOCTOR: "DOCTOR",
    PATIENT: "PATIENT",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_VALUES = [
    ROLES.SUPERUSER,
    ROLES.STAFF,
    ROLES.DOCTOR,
    ROLES.PATIENT,
] as const;

export const ROLE_LABELS: Record<Role, string> = {
    SUPERUSER: "Superusuario",
    STAFF: "Staff",
    DOCTOR: "Doctor",
    PATIENT: "Paciente",
};

export const ROLE_HOME_PATHS: Record<Role, string> = {
    SUPERUSER: "/superuser",
    STAFF: "/staff",
    DOCTOR: "/doctor",
    PATIENT: "/patient",
};