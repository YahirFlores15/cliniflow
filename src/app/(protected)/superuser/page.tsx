import { ArrowRight, CheckCircle2, ShieldCheck, Stethoscope, UserRound, UsersRound, } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { listAdminUsers } from "@/server/modules/superuser/superuser.repository";
import { buttonVariants } from "@/components/ui/button";
import { ROLE_LABELS } from "@/shared/constants/roles";
import { requireRole } from "@/server/auth/session";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";


function formatDate(value: string): string {
    return new Intl.DateTimeFormat("es-MX", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
}

export default async function SuperuserPage() {
    const session = await requireRole(["SUPERUSER"]);
    const users = listAdminUsers();

    const activeUsers = users.filter(
        (user) => user.isActive
    ).length;

    const doctorUsers = users.filter(
        (user) => user.role === "DOCTOR"
    ).length;

    const patientUsers = users.filter(
        (user) => user.role === "PATIENT"
    ).length;

    const recentUsers = users.slice(0, 5);

    const stats = [
        {
            label: "Usuarios registrados",
            value: users.length,
            description: "Cuentas totales del sistema",
            icon: UsersRound,
            iconClassName:
                "border-primary-border bg-primary-soft text-primary",
        },
        {
            label: "Usuarios activos",
            value: activeUsers,
            description: "Cuentas con acceso permitido",
            icon: CheckCircle2,
            iconClassName:
                "border-secondary-border bg-secondary-soft text-secondary",
        },
        {
            label: "Doctores",
            value: doctorUsers,
            description: "Perfiles médicos registrados",
            icon: Stethoscope,
            iconClassName:
                "border-primary-border bg-primary-soft text-primary",
        },
        {
            label: "Pacientes",
            value: patientUsers,
            description: "Cuentas de pacientes",
            icon: UserRound,
            iconClassName:
                "border-warning-border bg-warning-soft text-warning-hover",
        },
    ] as const;

    return (
        <div className="flex flex-col gap-6">
            <section className="overflow-hidden rounded-3xl border border-primary-border bg-primary-soft shadow-[var(--shadow-sm)]">
                <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
                    <div>
                        <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-white shadow-sm">
                            <ShieldCheck
                                className="size-6"
                                strokeWidth={1.9}
                            />
                        </div>

                        <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-primary">
                            Administración general
                        </p>

                        <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                            Hola, {session.user.name}
                        </h2>

                        <p className="mt-3 max-w-2xl text-sm leading-6 text-foreground-muted">
                            Consulta el estado general de las cuentas y
                            administra el acceso de doctores, personal y
                            pacientes.
                        </p>
                    </div>

                    <Link
                        href="/superuser/users"
                        className={cn(
                            buttonVariants({
                                variant: "primary",
                                size: "lg",
                            }),
                            "w-full lg:w-auto"
                        )}
                    >
                        Administrar usuarios
                        <ArrowRight className="size-4" />
                    </Link>
                </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => {
                    const Icon = stat.icon;

                    return (
                        <Card key={stat.label}>
                            <CardContent className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm font-medium text-foreground-muted">
                                        {stat.label}
                                    </p>

                                    <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">
                                        {stat.value}
                                    </p>

                                    <p className="mt-2 text-xs leading-5 text-foreground-muted">
                                        {stat.description}
                                    </p>
                                </div>

                                <div
                                    className={cn(
                                        "flex size-11 shrink-0 items-center justify-center rounded-xl border",
                                        stat.iconClassName
                                    )}
                                >
                                    <Icon
                                        className="size-5"
                                        strokeWidth={1.9}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
                <Card>
                    <CardHeader className="flex-row items-center justify-between gap-4">
                        <div>
                            <CardTitle>
                                Usuarios recientes
                            </CardTitle>

                            <CardDescription>
                                Últimas cuentas registradas en ClinicFlow.
                            </CardDescription>
                        </div>

                        <Link
                            href="/superuser/users"
                            className={buttonVariants({
                                variant: "outline",
                                size: "sm",
                            })}
                        >
                            Ver todos
                        </Link>
                    </CardHeader>

                    <CardContent className="p-0">
                        {recentUsers.length > 0 ? (
                            <div className="divide-y divide-border">
                                {recentUsers.map((user) => (
                                    <div
                                        key={user.id}
                                        className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                                    >
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="truncate text-sm font-semibold text-foreground">
                                                    {user.name}
                                                </p>

                                                {user.id ===
                                                    session.user.id ? (
                                                    <Badge variant="primary">
                                                        Tú
                                                    </Badge>
                                                ) : null}
                                            </div>

                                            <p className="mt-1 truncate text-xs text-foreground-muted">
                                                {user.email}
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                                            <Badge variant="neutral">
                                                {
                                                    ROLE_LABELS[
                                                    user.role
                                                    ]
                                                }
                                            </Badge>

                                            <Badge
                                                variant={
                                                    user.isActive
                                                        ? "success"
                                                        : "danger"
                                                }
                                            >
                                                {user.isActive
                                                    ? "Activo"
                                                    : "Inactivo"}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="px-6 py-12 text-center">
                                <p className="text-sm font-medium text-foreground">
                                    No hay usuarios registrados.
                                </p>

                                <p className="mt-1 text-sm text-foreground-muted">
                                    Las cuentas nuevas aparecerán aquí.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>
                            Estado administrativo
                        </CardTitle>

                        <CardDescription>
                            Resumen del acceso al sistema.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-5">
                        <div>
                            <div className="flex items-center justify-between gap-4 text-sm">
                                <span className="font-medium text-foreground">
                                    Cuentas activas
                                </span>

                                <span className="font-semibold text-secondary">
                                    {activeUsers} de {users.length}
                                </span>
                            </div>

                            <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-muted">
                                <div
                                    className="h-full rounded-full bg-secondary"
                                    style={{
                                        width:
                                            users.length > 0
                                                ? `${Math.round(
                                                    (activeUsers /
                                                        users.length) *
                                                    100
                                                )}%`
                                                : "0%",
                                    }}
                                />
                            </div>
                        </div>

                        <div className="rounded-2xl border border-border bg-surface-muted p-4">
                            <p className="text-xs font-bold uppercase tracking-[0.14em] text-foreground-muted">
                                Última cuenta
                            </p>

                            {users[0] ? (
                                <>
                                    <p className="mt-2 text-sm font-semibold text-foreground">
                                        {users[0].name}
                                    </p>

                                    <p className="mt-1 text-xs leading-5 text-foreground-muted">
                                        Registrada el{" "}
                                        {formatDate(
                                            users[0].createdAt
                                        )}
                                    </p>
                                </>
                            ) : (
                                <p className="mt-2 text-sm text-foreground-muted">
                                    Aún no hay registros.
                                </p>
                            )}
                        </div>

                        <p className="text-xs leading-5 text-foreground-muted">
                            Este módulo administra cuentas y permisos.
                            La información clínica permanece fuera del
                            alcance del superusuario.
                        </p>
                    </CardContent>
                </Card>
            </section>
        </div>
    );
}