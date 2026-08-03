import {
    ArrowRight,
    CalendarCheck2,
    CalendarDays,
    CheckCircle2,
    ClipboardList,
    FileHeart,
    FileText,
    HeartPulse,
    Stethoscope,
    UserRound,
    XCircle,
} from "lucide-react";
import Link from "next/link";

import {
    Badge,
} from "@/components/ui/badge";
import {
    buttonVariants,
} from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    cn,
} from "@/lib/utils";
import {
    requireRole,
} from "@/server/auth/session";
import {
    getPatientDashboard,
} from "@/server/modules/patient/patient-dashboard.service";
import {
    ROLES,
} from "@/shared/constants/roles";


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
            weekday:
                "long",
            day:
                "numeric",
            month:
                "long",
            year:
                "numeric",
        }
    ).format(
        new Date(
            Number(
                match[1]
            ),
            Number(
                match[2]
            ) - 1,
            Number(
                match[3]
            )
        )
    );
}

function getAppointmentStatusLabel(
    status:
        "SCHEDULED"
        | "CANCELLED"
        | "COMPLETED"
): string {
    if (
        status ===
        "COMPLETED"
    ) {
        return "Completada";
    }

    if (
        status ===
        "CANCELLED"
    ) {
        return "Cancelada";
    }

    return "Programada";
}

function getAppointmentStatusVariant(
    status:
        "SCHEDULED"
        | "CANCELLED"
        | "COMPLETED"
):
    | "primary"
    | "danger"
    | "success" {
    if (
        status ===
        "COMPLETED"
    ) {
        return "success";
    }

    if (
        status ===
        "CANCELLED"
    ) {
        return "danger";
    }

    return "primary";
}

export default async function PatientPage() {
    const session =
        await requireRole([
            ROLES.PATIENT,
        ]);

    const dashboard =
        getPatientDashboard(
            session.user.id
        );

    const stats = [
        {
            label:
                "Próximas citas",
            value:
                dashboard.summary
                    .upcomingAppointments,
            description:
                "Consultas futuras programadas",
            icon:
                CalendarCheck2,
            iconClassName:
                "border-primary-border bg-primary-soft text-primary",
        },
        {
            label:
                "Consultas completadas",
            value:
                dashboard.summary
                    .completedAppointments,
            description:
                "Atenciones registradas",
            icon:
                CheckCircle2,
            iconClassName:
                "border-secondary-border bg-secondary-soft text-secondary",
        },
        {
            label:
                "Citas canceladas",
            value:
                dashboard.summary
                    .cancelledAppointments,
            description:
                "Consultas que no se realizaron",
            icon:
                XCircle,
            iconClassName:
                "border-danger-border bg-danger-soft text-danger",
        },
        {
            label:
                "Notas médicas",
            value:
                dashboard.summary
                    .medicalNotes,
            description:
                "Indicaciones clínicas disponibles",
            icon:
                FileText,
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
                            <HeartPulse
                                className="size-6"
                                strokeWidth={
                                    1.9
                                }
                            />
                        </div>

                        <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-primary">
                            Portal del paciente
                        </p>

                        <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                            Bienvenido,{" "}
                            {
                                dashboard
                                    .profile
                                    .name
                            }
                        </h2>

                        <p className="mt-3 max-w-2xl text-sm leading-6 text-foreground-muted">
                            Consulta tus próximas citas, revisa tu información clínica y administra tus datos personales desde módulos independientes.
                        </p>
                    </div>

                    <Link
                        href="/patient/appointments"
                        className={cn(
                            buttonVariants({
                                variant:
                                    "primary",
                                size:
                                    "lg",
                            }),
                            "w-full lg:w-auto"
                        )}
                    >
                        Ver mis citas

                        <ArrowRight className="size-4" />
                    </Link>
                </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map(
                    (
                        stat
                    ) => {
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

            <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
                <Card>
                    <CardHeader className="flex-row items-start justify-between gap-4">
                        <div>
                            <CardTitle>
                                Próxima consulta
                            </CardTitle>

                            <CardDescription>
                                La siguiente cita programada en tu agenda.
                            </CardDescription>
                        </div>

                        {dashboard.nextAppointment ? (
                            <Badge variant="primary">
                                Programada
                            </Badge>
                        ) : null}
                    </CardHeader>

                    <CardContent>
                        {dashboard.nextAppointment ? (
                            <div className="space-y-5">
                                <div className="flex items-start gap-4">
                                    <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-primary-border bg-primary-soft text-primary">
                                        <Stethoscope className="size-6" />
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-lg font-bold text-foreground">
                                            Dr.{" "}
                                            {
                                                dashboard
                                                    .nextAppointment
                                                    .doctorName
                                            }
                                        </p>

                                        <p className="mt-1 text-sm text-foreground-muted">
                                            {dashboard
                                                .nextAppointment
                                                .specialty ??
                                                "Especialidad no registrada"}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="rounded-xl border border-border bg-surface-muted px-4 py-3">
                                        <p className="text-xs font-bold uppercase tracking-[0.1em] text-foreground-muted">
                                            Fecha
                                        </p>

                                        <p className="mt-2 text-sm font-semibold capitalize text-foreground">
                                            {formatCalendarDate(
                                                dashboard
                                                    .nextAppointment
                                                    .scheduledDate
                                            )}
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-border bg-surface-muted px-4 py-3">
                                        <p className="text-xs font-bold uppercase tracking-[0.1em] text-foreground-muted">
                                            Horario
                                        </p>

                                        <p className="mt-2 text-sm font-semibold text-foreground">
                                            {
                                                dashboard
                                                    .nextAppointment
                                                    .startTime
                                            }
                                            {" – "}
                                            {
                                                dashboard
                                                    .nextAppointment
                                                    .endTime
                                            }
                                        </p>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-border px-4 py-3">
                                    <p className="text-xs font-bold uppercase tracking-[0.1em] text-foreground-muted">
                                        Motivo de consulta
                                    </p>

                                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground">
                                        {dashboard
                                            .nextAppointment
                                            .reason ??
                                            "Sin motivo registrado."}
                                    </p>
                                </div>

                                <Link
                                    href="/patient/appointments"
                                    className={cn(
                                        buttonVariants({
                                            variant:
                                                "outline",
                                            size:
                                                "md",
                                        }),
                                        "w-full sm:w-auto"
                                    )}
                                >
                                    <CalendarDays className="size-4" />
                                    Abrir calendario
                                </Link>
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-dashed border-border bg-surface-muted px-6 py-12 text-center">
                                <CalendarDays className="mx-auto size-9 text-primary" />

                                <p className="mt-4 text-sm font-semibold text-foreground">
                                    No tienes citas próximas
                                </p>

                                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-foreground-muted">
                                    Cuando recepción programe una nueva consulta aparecerá aquí.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>
                            Accesos rápidos
                        </CardTitle>

                        <CardDescription>
                            Consulta cada sección del portal.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-3">
                        <Link
                            href="/patient/appointments"
                            className={cn(
                                buttonVariants({
                                    variant:
                                        "primary",
                                    size:
                                        "lg",
                                }),
                                "w-full justify-start"
                            )}
                        >
                            <CalendarDays className="size-5" />
                            Mis citas
                        </Link>

                        <Link
                            href="/patient/history"
                            className={cn(
                                buttonVariants({
                                    variant:
                                        "outline",
                                    size:
                                        "lg",
                                }),
                                "w-full justify-start"
                            )}
                        >
                            <ClipboardList className="size-5" />
                            Historial de consultas
                        </Link>

                        <Link
                            href="/patient/medical-record"
                            className={cn(
                                buttonVariants({
                                    variant:
                                        "outline",
                                    size:
                                        "lg",
                                }),
                                "w-full justify-start"
                            )}
                        >
                            <FileHeart className="size-5" />
                            Expediente clínico
                        </Link>

                        <Link
                            href="/patient/profile"
                            className={cn(
                                buttonVariants({
                                    variant:
                                        "outline",
                                    size:
                                        "lg",
                                }),
                                "w-full justify-start"
                            )}
                        >
                            <UserRound className="size-5" />
                            Mi perfil
                        </Link>
                    </CardContent>
                </Card>
            </section>

            <Card>
                <CardHeader className="flex-row items-start justify-between gap-4">
                    <div>
                        <CardTitle>
                            Actividad reciente
                        </CardTitle>

                        <CardDescription>
                            Últimas consultas completadas, canceladas o anteriores.
                        </CardDescription>
                    </div>

                    <Badge variant="neutral">
                        {
                            dashboard
                                .recentAppointments
                                .length
                        }
                    </Badge>
                </CardHeader>

                <CardContent className="p-0">
                    {dashboard
                        .recentAppointments
                        .length > 0 ? (
                        <div className="divide-y divide-border">
                            {dashboard.recentAppointments.map(
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
                                                Dr.{" "}
                                                {
                                                    appointment.doctorName
                                                }
                                            </p>

                                            <p className="mt-1 text-xs capitalize text-foreground-muted">
                                                {formatCalendarDate(
                                                    appointment.scheduledDate
                                                )}
                                                {" · "}
                                                {
                                                    appointment.startTime
                                                }
                                            </p>

                                            <p className="mt-1 truncate text-xs text-foreground-muted">
                                                {appointment.reason ??
                                                    "Sin motivo registrado"}
                                            </p>
                                        </div>

                                        <Badge
                                            variant={getAppointmentStatusVariant(
                                                appointment.status
                                            )}
                                        >
                                            {getAppointmentStatusLabel(
                                                appointment.status
                                            )}
                                        </Badge>
                                    </div>
                                )
                            )}
                        </div>
                    ) : (
                        <div className="px-6 py-12 text-center">
                            <ClipboardList className="mx-auto size-9 text-primary" />

                            <p className="mt-4 text-sm font-semibold text-foreground">
                                No existe actividad reciente
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
