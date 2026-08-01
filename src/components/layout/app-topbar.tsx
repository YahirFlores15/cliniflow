"use client";

import {
    Menu,
    PanelLeftClose,
    PanelLeftOpen,
} from "lucide-react";
import { usePathname } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/utils";
import {
    ROLE_LABELS,
    type Role,
} from "@/shared/constants/roles";

type TopbarUser = {
    name: string;
    email: string;
    role: Role;
};

type AppTopbarProps = {
    user: TopbarUser;
    sidebarCollapsed: boolean;
    onOpenMobile: () => void;
    onToggleCollapsed: () => void;
};

type PageInformation = {
    eyebrow: string;
    title: string;
    description: string;
};

function getPageInformation(
    pathname: string,
    role: Role
): PageInformation {
    if (
        pathname.startsWith(
            "/superuser/users/new"
        )
    ) {
        return {
            eyebrow: "Administración",
            title: "Crear usuario",
            description:
                "Registro de una nueva cuenta.",
        };
    }

    if (
        pathname.startsWith(
            "/superuser/users/edit"
        )
    ) {
        return {
            eyebrow: "Administración",
            title: "Editar usuario",
            description:
                "Actualización de datos administrativos.",
        };
    }

    if (
        pathname.startsWith(
            "/superuser/users"
        )
    ) {
        return {
            eyebrow: "Administración",
            title: "Usuarios",
            description:
                "Cuentas, roles y control de acceso.",
        };
    }

    if (pathname === "/superuser") {
        return {
            eyebrow: "Administración",
            title: "Dashboard",
            description:
                "Resumen general de usuarios y accesos.",
        };
    }

    if (
        pathname.startsWith(
            "/staff/patients/new"
        )
    ) {
        return {
            eyebrow: "Recepción",
            title: "Registrar paciente",
            description:
                "Creación de cuenta y perfil administrativo.",
        };
    }

    if (
        pathname.startsWith(
            "/staff/patients/edit"
        )
    ) {
        return {
            eyebrow: "Recepción",
            title: "Editar paciente",
            description:
                "Actualización de datos administrativos.",
        };
    }

    if (
        pathname.startsWith(
            "/staff/patients"
        )
    ) {
        return {
            eyebrow: "Recepción",
            title: "Pacientes",
            description:
                "Registro y administración de pacientes.",
        };
    }

    if (
        pathname.startsWith(
            "/staff/appointments"
        )
    ) {
        return {
            eyebrow: "Recepción",
            title: "Citas",
            description:
                "Calendario semanal y mensual.",
        };
    }

    if (pathname === "/staff") {
        return {
            eyebrow: "Recepción",
            title: "Dashboard",
            description:
                "Resumen operativo de la clínica.",
        };
    }

    if (pathname.startsWith("/staff")) {
        return {
            eyebrow: "Recepción",
            title: "Operación de la clínica",
            description:
                "Pacientes, disponibilidad y gestión de citas.",
        };
    }

    if (pathname.startsWith("/doctor")) {
        return {
            eyebrow: "Área médica",
            title: "Agenda médica",
            description:
                "Consultas, horarios y atención clínica.",
        };
    }

    if (pathname.startsWith("/patient")) {
        return {
            eyebrow: "Portal del paciente",
            title: "Mi información",
            description:
                "Citas, expediente e historial clínico.",
        };
    }

    return {
        eyebrow: ROLE_LABELS[role],
        title: "ClinicFlow",
        description:
            "Sistema de gestión clínica.",
    };
}

export function AppTopbar({
    user,
    sidebarCollapsed,
    onOpenMobile,
    onToggleCollapsed,
}: AppTopbarProps) {
    const pathname = usePathname();

    const pageInformation =
        getPageInformation(
            pathname,
            user.role
        );

    return (
        <header className="sticky top-0 z-20 border-b border-border bg-surface/95 backdrop-blur">
            <div className="flex min-h-20 items-center gap-3 px-4 sm:px-6 lg:px-8">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="lg:hidden"
                    aria-label="Abrir navegación"
                    onClick={onOpenMobile}
                >
                    <Menu className="size-5" />
                </Button>

                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="hidden lg:inline-flex"
                    aria-label={
                        sidebarCollapsed
                            ? "Expandir navegación"
                            : "Contraer navegación"
                    }
                    onClick={onToggleCollapsed}
                >
                    {sidebarCollapsed ? (
                        <PanelLeftOpen className="size-5" />
                    ) : (
                        <PanelLeftClose className="size-5" />
                    )}
                </Button>

                <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold uppercase tracking-[0.16em] text-primary">
                        {pageInformation.eyebrow}
                    </p>

                    <div className="mt-1 flex min-w-0 items-baseline gap-3">
                        <h1 className="truncate text-lg font-bold tracking-tight text-foreground sm:text-xl">
                            {pageInformation.title}
                        </h1>

                        <p className="hidden truncate text-sm text-foreground-muted xl:block">
                            {pageInformation.description}
                        </p>
                    </div>
                </div>

                <div className="hidden items-center gap-3 sm:flex">
                    <Badge variant="primary">
                        {ROLE_LABELS[user.role]}
                    </Badge>

                    <div className="flex size-10 items-center justify-center rounded-xl border border-primary-border bg-primary-soft text-sm font-bold text-primary">
                        {getInitials(user.name)}
                    </div>

                    <div className="hidden min-w-0 xl:block">
                        <p className="max-w-44 truncate text-sm font-semibold text-foreground">
                            {user.name}
                        </p>

                        <p className="max-w-44 truncate text-xs text-foreground-muted">
                            {user.email}
                        </p>
                    </div>
                </div>
            </div>
        </header>
    );
}