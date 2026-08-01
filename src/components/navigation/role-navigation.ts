import { Ban, CalendarDays, CalendarRange, Clock3, HeartPulse, LayoutDashboard, ShieldCheck, Stethoscope, UsersRound, type LucideIcon, } from "lucide-react";
import { ROLES, type Role, } from "@/shared/constants/roles";


export type NavigationItem = {
    label: string;
    description: string;
    href: string;
    icon: LucideIcon;
    exact?: boolean;
};

export const ROLE_NAVIGATION: Record<
    Role,
    NavigationItem[]
> = {
    [ROLES.SUPERUSER]: [
        {
            label: "Dashboard",
            description:
                "Resumen administrativo",
            href: "/superuser",
            icon: LayoutDashboard,
            exact: true,
        },
        {
            label: "Usuarios",
            description:
                "Cuentas y accesos",
            href: "/superuser/users",
            icon: UsersRound,
        },
    ],

    [ROLES.STAFF]: [
        {
            label: "Dashboard",
            description:
                "Resumen de recepción",
            href: "/staff",
            icon: LayoutDashboard,
            exact: true,
        },
        {
            label: "Pacientes",
            description:
                "Registro y datos administrativos",
            href: "/staff/patients",
            icon: UsersRound,
        },
        {
            label: "Citas",
            description:
                "Calendario y agenda clínica",
            href: "/staff/appointments",
            icon: CalendarRange,
        },
        {
            label: "Disponibilidad",
            description:
                "Horarios y bloqueos médicos",
            href: "/staff/availability",
            icon: CalendarDays,
        },
    ],

    [ROLES.DOCTOR]: [
        {
            label: "Dashboard",
            description:
                "Resumen de la jornada",
            href: "/doctor",
            icon: LayoutDashboard,
            exact: true,
        },
        {
            label: "Agenda",
            description:
                "Calendario de consultas",
            href: "/doctor/agenda",
            icon: CalendarRange,
        },
        {
            label: "Horarios",
            description:
                "Jornada semanal",
            href: "/doctor/schedule",
            icon: Clock3,
        },
        {
            label: "Bloqueos",
            description:
                "Ausencias y periodos no disponibles",
            href: "/doctor/blocks",
            icon: Ban,
        },
        {
            label: "Pacientes",
            description:
                "Expedientes relacionados",
            href: "/doctor/patients",
            icon: UsersRound,
        },
    ],

    [ROLES.PATIENT]: [
        {
            label: "Mi portal",
            description:
                "Citas e información clínica",
            href: "/patient",
            icon: HeartPulse,
            exact: true,
        },
    ],
};

export const ROLE_HOME_ICONS: Record<
    Role,
    LucideIcon
> = {
    [ROLES.SUPERUSER]:
        ShieldCheck,
    [ROLES.STAFF]:
        CalendarDays,
    [ROLES.DOCTOR]:
        Stethoscope,
    [ROLES.PATIENT]:
        HeartPulse,
};