import { CalendarDays, CalendarRange, HeartPulse, LayoutDashboard, ShieldCheck, Stethoscope, UsersRound, type LucideIcon, } from "lucide-react";
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
    ],

    [ROLES.DOCTOR]: [
        {
            label: "Agenda médica",
            description:
                "Consultas y atención clínica",
            href: "/doctor",
            icon: Stethoscope,
            exact: true,
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
    [ROLES.SUPERUSER]: ShieldCheck,
    [ROLES.STAFF]: CalendarDays,
    [ROLES.DOCTOR]: CalendarDays,
    [ROLES.PATIENT]: HeartPulse,
};