import { Ban, CalendarDays, CalendarRange, ClipboardList, Clock3, FileHeart, HeartPulse, Pill, LayoutDashboard, ShieldCheck, Stethoscope, UserRound, UsersRound, type LucideIcon, } from "lucide-react";
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
            label:
                "Dashboard",
            description:
                "Resumen administrativo",
            href:
                "/superuser",
            icon:
                LayoutDashboard,
            exact:
                true,
        },
        {
            label:
                "Usuarios",
            description:
                "Cuentas y accesos",
            href:
                "/superuser/users",
            icon:
                UsersRound,
        },
    ],

    [ROLES.STAFF]: [
        {
            label:
                "Dashboard",
            description:
                "Resumen de recepción",
            href:
                "/staff",
            icon:
                LayoutDashboard,
            exact:
                true,
        },
        {
            label:
                "Pacientes",
            description:
                "Registro y datos administrativos",
            href:
                "/staff/patients",
            icon:
                UsersRound,
        },
        {
            label:
                "Citas",
            description:
                "Calendario y agenda clínica",
            href:
                "/staff/appointments",
            icon:
                CalendarRange,
        },
        {
            label:
                "Disponibilidad",
            description:
                "Horarios y bloqueos médicos",
            href:
                "/staff/availability",
            icon:
                CalendarDays,
        },
    ],

    [ROLES.DOCTOR]: [
        {
            label:
                "Dashboard",
            description:
                "Resumen de la jornada",
            href:
                "/doctor",
            icon:
                LayoutDashboard,
            exact:
                true,
        },
        {
            label:
                "Agenda",
            description:
                "Calendario de consultas",
            href:
                "/doctor/agenda",
            icon:
                CalendarRange,
        },
        {
            label:
                "Horarios",
            description:
                "Jornada semanal",
            href:
                "/doctor/schedule",
            icon:
                Clock3,
        },
        {
            label:
                "Bloqueos",
            description:
                "Ausencias y periodos no disponibles",
            href:
                "/doctor/blocks",
            icon:
                Ban,
        },
        {
            label:
                "Pacientes",
            description:
                "Expedientes relacionados",
            href:
                "/doctor/patients",
            icon:
                UsersRound,
        },
    ],

    [ROLES.PATIENT]: [
        {
            label:
                "Inicio",
            description:
                "Resumen de tu portal",
            href:
                "/patient",
            icon:
                LayoutDashboard,
            exact:
                true,
        },
        {
            label:
                "Mis citas",
            description:
                "Calendario personal",
            href:
                "/patient/appointments",
            icon:
                CalendarRange,
        },
        {
            label:
                "Historial",
            description:
                "Consultas anteriores",
            href:
                "/patient/history",
            icon:
                ClipboardList,
        },
        {
            label:
                "Expediente",
            description:
                "Información clínica básica",
            href:
                "/patient/medical-record",
            icon:
                FileHeart,
        },
        {
            label:
                "Mi perfil",
            description:
                "Datos personales y contacto",
            href:
                "/patient/profile",
            icon:
                UserRound,
        },
        {

            label:
                "Recetas",
            description:
                "Tratamientos e indicaciones",
            href:
                "/patient/prescriptions",
            icon:
                Pill,
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