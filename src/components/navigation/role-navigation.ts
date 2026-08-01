import { CalendarDays, HeartPulse, LayoutDashboard, ShieldCheck, Stethoscope, UsersRound, type LucideIcon, } from "lucide-react";
import { ROLES, type Role, } from "@/shared/constants/roles";


export type NavigationItem = {
    label: string;
    description: string;
    href: string;
    icon: LucideIcon;
};

export const ROLE_NAVIGATION: Record<Role, NavigationItem[]> = {
    [ROLES.SUPERUSER]: [
        {
            label: "Administración",
            description: "Gestión general de usuarios",
            href: "/superuser",
            icon: ShieldCheck,
        },
    ],

    [ROLES.STAFF]: [
        {
            label: "Recepción",
            description: "Pacientes y gestión de citas",
            href: "/staff",
            icon: UsersRound,
        },
    ],

    [ROLES.DOCTOR]: [
        {
            label: "Agenda médica",
            description: "Consultas y atención clínica",
            href: "/doctor",
            icon: Stethoscope,
        },
    ],

    [ROLES.PATIENT]: [
        {
            label: "Mi portal",
            description: "Citas e información clínica",
            href: "/patient",
            icon: HeartPulse,
        },
    ],
};

export const ROLE_HOME_ICONS: Record<Role, LucideIcon> = {
    [ROLES.SUPERUSER]: LayoutDashboard,
    [ROLES.STAFF]: CalendarDays,
    [ROLES.DOCTOR]: CalendarDays,
    [ROLES.PATIENT]: HeartPulse,
};