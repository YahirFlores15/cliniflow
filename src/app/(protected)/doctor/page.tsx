import { ArrowRight, Ban, CalendarCheck2, CalendarDays, CheckCircle2, Clock3, FileHeart, Stethoscope, UsersRound, } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { getDoctorDashboard } from "@/server/modules/doctor/doctor.service";
import { buttonVariants, } from "@/components/ui/button";
import { requireRole } from "@/server/auth/session";
import { ROLES } from "@/shared/constants/roles";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";


function formatCalendarDate(
    value: string
): string {
    const match =
        /^(\d{4})-(\d{2})-(\d{2})$/.exec(
            value
        );

    if (!match) {
        return value;
    }

    return new Intl.DateTimeFormat(
        "es-MX",
        {
            dateStyle: "medium",
        }
    ).format(
        new Date(
            Number(match[1]),
            Number(match[2]) - 1,
            Number(match[3])
        )
    );
}

function formatDateTime(
    value: string
): string {
    const normalizedValue =
        value.includes(" ")
            ? value.replace(
                " ",
                "T"
            )
            : value;

    const parsedDate =
        new Date(
            normalizedValue
        );

    if (
        Number.isNaN(
            parsedDate.getTime()
        )
    ) {
        return value;
    }

    return new Intl.DateTimeFormat(
        "es-MX",
        {
            dateStyle: "medium",
            timeStyle: "short",
        }
    ).format(parsedDate);
}

export default async function DoctorPage() {
    const session =
        await requireRole([
            ROLES.DOCTOR,
        ]);

    const dashboard =
        getDoctorDashboard(
            session.user.id
        );

    const stats = [
        {
            label:
                "Citas para hoy",
            value:
                dashboard.summary
                    .todayScheduled,
            description:
                "Consultas pendientes de la jornada",
            icon:
                CalendarCheck2,
            iconClassName:
                "border-primary-border bg-primary-soft text-primary",
        },
        {
            label:
                "Próximas citas",
            value:
                dashboard.summary
                    .upcomingScheduled,
            description:
                "Consultas futuras programadas",
            icon:
                Clock3,
            iconClassName:
                "border-warning-border bg-warning-soft text-warning-hover",
        },
        {
            label:
                "Citas completadas",
            value:
                dashboard.summary
                    .completed,
            description:
                "Consultas registradas como completadas",
            icon:
                CheckCircle2,
            iconClassName:
                "border-secondary-border bg-secondary-soft text-secondary",
        },
        {
            label:
                "Pacientes relacionados",
            value:
                dashboard.relatedPatientsCount,
            description:
                "Pacientes vinculados mediante citas",
            icon:
                UsersRound,
            iconClassName:
                "border-primary-border bg-primary-soft text-primary",
        },
    ] as const;

    return (
        <div className="flex flex-col gap-6">
            <section className="overflow-hidden rounded-3xl border border-primary-border bg-primary-soft shadow-[var(--shadow-sm)]">
                <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
                    <div>
                        <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-white shadow-sm">
                            <Stethoscope
                                className="size-6"
                                strokeWidth={1.9}
                            />
                        </div>

                        <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-primary">
                            Área médica
                        </p>

                        <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                            Bienvenido, Dr.{" "}
                            {
                                dashboard.doctor
                                    .name
                            }
                        </h2>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                            <Badge variant="primary">
                                {dashboard.doctor
                                    .specialty ??
                                    "Especialidad no registrada"}
                            </Badge>

                            {dashboard.doctor
                                .licenseNumber ? (
                                <Badge variant="neutral">
                                    Cédula{" "}
                                    {
                                        dashboard
                                            .doctor
                                            .licenseNumber
                                    }
                                </Badge>
                            ) : null}

                            <Badge variant="success">
                                {
                                    dashboard
                                        .doctor
                                        .defaultAppointmentDurationMinutes
                                }{" "}
                                min por cita
                            </Badge>
                        </div>

                        <p className="mt-4 max-w-2xl text-sm leading-6 text-foreground-muted">
                            Consulta tu jornada, administra horarios y bloqueos, y accede a la atención clínica desde módulos independientes.
                        </p>
                    </div>

                    <Link
                        href="/doctor/agenda"
                        className={cn(
                            buttonVariants({
                                variant:
                                    "primary",
                                size: "lg",
                            }),
                            "w-full lg:w-auto"
                        )}
                    >
                        Abrir agenda
                        <ArrowRight className="size-4" />
                    </Link>
                </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map(
                    (stat) => {
                        const Icon =
                            stat.icon;

                        return (
                            <Card
                                key={
                                    stat.label
                                }
                            >
                                <CardContent className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-foreground-muted">
                                            {
                                                stat.label
                                            }
                                        </p>

                                        <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">
                                            {
                                                stat.value
                                            }
                                        </p>

                                        <p className="mt-2 text-xs leading-5 text-foreground-muted">
                                            {
                                                stat.description
                                            }
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
                                            strokeWidth={
                                                1.9
                                            }
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    }
                )}
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
                <Card>
                    <CardHeader className="flex-row items-center justify-between gap-4">
                        <div>
                            <CardTitle>
                                Próximas consultas
                            </CardTitle>

                            <CardDescription>
                                Primeras citas programadas de tu agenda.
                            </CardDescription>
                        </div>

                        <Badge variant="primary">
                            {
                                dashboard
                                    .upcomingAppointments
                                    .length
                            }
                        </Badge>
                    </CardHeader>

                    <CardContent className="p-0">
                        {dashboard
                            .upcomingAppointments
                            .length > 0 ? (
                            <div className="divide-y divide-border">
                                {dashboard.upcomingAppointments.map(
                                    (
                                        appointment
                                    ) => (
                                        <div
                                            key={
                                                appointment.id
                                            }
                                            className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                                        >
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-semibold text-foreground">
                                                    {
                                                        appointment.patientName
                                                    }
                                                </p>

                                                <p className="mt-1 text-xs text-foreground-muted">
                                                    {formatCalendarDate(
                                                        appointment.scheduledDate
                                                    )}
                                                    {
                                                        " · "
                                                    }
                                                    {
                                                        appointment.startTime
                                                    }
                                                    {
                                                        " – "
                                                    }
                                                    {
                                                        appointment.endTime
                                                    }
                                                </p>

                                                <p className="mt-1 truncate text-xs text-foreground-muted">
                                                    {appointment.reason ??
                                                        "Sin motivo registrado"}
                                                </p>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                <Badge variant="success">
                                                    Programada
                                                </Badge>

                                                {appointment.hasMedicalNote ? (
                                                    <Badge variant="primary">
                                                        Con nota
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="neutral">
                                                        Sin nota
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        ) : (
                            <div className="px-6 py-12 text-center">
                                <CalendarDays className="mx-auto size-9 text-primary" />

                                <p className="mt-4 text-sm font-semibold text-foreground">
                                    No hay citas próximas.
                                </p>

                                <p className="mt-1 text-sm text-foreground-muted">
                                    Las consultas futuras aparecerán aquí.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>
                            Acciones rápidas
                        </CardTitle>

                        <CardDescription>
                            Accesos frecuentes del módulo médico.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-3">
                        <Link
                            href="/doctor/agenda"
                            className={cn(
                                buttonVariants({
                                    variant:
                                        "primary",
                                    size: "lg",
                                }),
                                "w-full justify-start"
                            )}
                        >
                            <CalendarDays className="size-5" />
                            Consultar agenda
                        </Link>

                        <Link
                            href="/doctor/schedule"
                            className={cn(
                                buttonVariants({
                                    variant:
                                        "outline",
                                    size: "lg",
                                }),
                                "w-full justify-start"
                            )}
                        >
                            <Clock3 className="size-5" />
                            Configurar horarios
                        </Link>

                        <Link
                            href="/doctor/blocks"
                            className={cn(
                                buttonVariants({
                                    variant:
                                        "outline",
                                    size: "lg",
                                }),
                                "w-full justify-start"
                            )}
                        >
                            <Ban className="size-5" />
                            Administrar bloqueos
                        </Link>

                        <Link
                            href="/doctor/patients"
                            className={cn(
                                buttonVariants({
                                    variant:
                                        "outline",
                                    size: "lg",
                                }),
                                "w-full justify-start"
                            )}
                        >
                            <FileHeart className="size-5" />
                            Consultar pacientes
                        </Link>
                    </CardContent>
                </Card>
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader className="flex-row items-start justify-between gap-4">
                        <div>
                            <CardTitle>
                                Horario semanal
                            </CardTitle>

                            <CardDescription>
                                Jornadas activas configuradas actualmente.
                            </CardDescription>
                        </div>

                        <Badge variant="success">
                            {
                                dashboard
                                    .activeSchedules
                                    .length
                            }
                        </Badge>
                    </CardHeader>

                    <CardContent>
                        {dashboard
                            .activeSchedules
                            .length > 0 ? (
                            <div className="space-y-3">
                                {dashboard.activeSchedules.map(
                                    (
                                        schedule
                                    ) => (
                                        <div
                                            key={
                                                schedule.id
                                            }
                                            className="flex items-center justify-between gap-4 rounded-xl border border-border bg-surface-muted px-4 py-3"
                                        >
                                            <div>
                                                <p className="text-sm font-semibold text-foreground">
                                                    Día{" "}
                                                    {
                                                        schedule.weekday
                                                    }
                                                </p>

                                                <p className="mt-1 text-xs text-foreground-muted">
                                                    {
                                                        schedule.startTime
                                                    }
                                                    {
                                                        " – "
                                                    }
                                                    {
                                                        schedule.endTime
                                                    }
                                                </p>
                                            </div>

                                            <Badge variant="neutral">
                                                {
                                                    schedule.appointmentDurationMinutes
                                                }{" "}
                                                min
                                            </Badge>
                                        </div>
                                    )
                                )}
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-dashed border-border bg-surface-muted px-5 py-10 text-center">
                                <Clock3 className="mx-auto size-8 text-primary" />

                                <p className="mt-3 text-sm font-semibold text-foreground">
                                    Sin horarios activos
                                </p>

                                <p className="mt-1 text-xs text-foreground-muted">
                                    Configura al menos un día de atención.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex-row items-start justify-between gap-4">
                        <div>
                            <CardTitle>
                                Bloqueos próximos
                            </CardTitle>

                            <CardDescription>
                                Periodos futuros en los que no atenderás.
                            </CardDescription>
                        </div>

                        <Badge variant="warning">
                            {
                                dashboard
                                    .upcomingBlocks
                                    .length
                            }
                        </Badge>
                    </CardHeader>

                    <CardContent>
                        {dashboard
                            .upcomingBlocks
                            .length > 0 ? (
                            <div className="space-y-3">
                                {dashboard.upcomingBlocks.map(
                                    (
                                        block
                                    ) => (
                                        <div
                                            key={
                                                block.id
                                            }
                                            className="rounded-xl border border-warning-border bg-warning-soft px-4 py-3"
                                        >
                                            <p className="text-sm font-semibold text-foreground">
                                                {formatDateTime(
                                                    block.startDateTime
                                                )}
                                            </p>

                                            <p className="mt-1 text-xs text-foreground-muted">
                                                Hasta{" "}
                                                {formatDateTime(
                                                    block.endDateTime
                                                )}
                                            </p>

                                            <p className="mt-2 line-clamp-2 text-xs leading-5 text-foreground">
                                                {block.reason ??
                                                    "Sin motivo registrado."}
                                            </p>
                                        </div>
                                    )
                                )}
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-dashed border-border bg-surface-muted px-5 py-10 text-center">
                                <Ban className="mx-auto size-8 text-warning-hover" />

                                <p className="mt-3 text-sm font-semibold text-foreground">
                                    Sin bloqueos próximos
                                </p>

                                <p className="mt-1 text-xs text-foreground-muted">
                                    Tu disponibilidad no tiene periodos futuros bloqueados.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </section>
        </div>
    );
}