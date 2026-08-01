import { ArrowRight, CalendarCheck2, CalendarClock, Stethoscope, UserPlus, UsersRound, } from "lucide-react";
import { getStaffAppointments, getStaffDoctors, getStaffPatients, } from "@/server/modules/staff/staff.service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { requireRole } from "@/server/auth/session";
import { ROLES } from "@/shared/constants/roles";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";


function getTodayDate(): string {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(
        now.getMonth() + 1
    ).padStart(2, "0");
    const day = String(
        now.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function formatDate(
    value: string
): string {
    const [year, month, day] =
        value.split("-").map(Number);

    if (!year || !month || !day) {
        return value;
    }

    return new Intl.DateTimeFormat(
        "es-MX",
        {
            dateStyle: "medium",
        }
    ).format(
        new Date(year, month - 1, day)
    );
}

export default async function StaffPage() {
    const session = await requireRole([
        ROLES.STAFF,
    ]);

    const patients = getStaffPatients();
    const doctors = getStaffDoctors();
    const appointments =
        getStaffAppointments();

    const today = getTodayDate();

    const activePatients = patients.filter(
        (patient) => patient.isActive
    ).length;

    const todayAppointments =
        appointments.filter(
            (appointment) =>
                appointment.scheduledDate ===
                today &&
                appointment.status ===
                "SCHEDULED"
        );

    const scheduledAppointments =
        appointments.filter(
            (appointment) =>
                appointment.status ===
                "SCHEDULED"
        ).length;

    const upcomingAppointments =
        appointments
            .filter(
                (appointment) =>
                    appointment.status ===
                    "SCHEDULED" &&
                    appointment.scheduledDate >=
                    today
            )
            .slice(0, 5);

    const stats = [
        {
            label: "Pacientes activos",
            value: activePatients,
            description:
                `${patients.length} pacientes registrados`,
            icon: UsersRound,
            iconClassName:
                "border-primary-border bg-primary-soft text-primary",
        },
        {
            label: "Citas para hoy",
            value: todayAppointments.length,
            description:
                "Consultas programadas para hoy",
            icon: CalendarCheck2,
            iconClassName:
                "border-secondary-border bg-secondary-soft text-secondary",
        },
        {
            label: "Citas programadas",
            value: scheduledAppointments,
            description:
                "Citas pendientes en agenda",
            icon: CalendarClock,
            iconClassName:
                "border-warning-border bg-warning-soft text-warning-hover",
        },
        {
            label: "Doctores disponibles",
            value: doctors.length,
            description:
                "Perfiles médicos activos",
            icon: Stethoscope,
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
                            <CalendarCheck2
                                className="size-6"
                                strokeWidth={1.9}
                            />
                        </div>

                        <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-primary">
                            Recepción y operación
                        </p>

                        <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                            Hola, {session.user.name}
                        </h2>

                        <p className="mt-3 max-w-2xl text-sm leading-6 text-foreground-muted">
                            Consulta el estado de la agenda y
                            administra los datos de los pacientes
                            desde módulos separados.
                        </p>
                    </div>

                    <Link
                        href="/staff/patients"
                        className={cn(
                            buttonVariants({
                                variant: "primary",
                                size: "lg",
                            }),
                            "w-full lg:w-auto"
                        )}
                    >
                        Ver pacientes
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

            <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
                <Card>
                    <CardHeader className="flex-row items-center justify-between gap-4">
                        <div>
                            <CardTitle>
                                Próximas citas
                            </CardTitle>

                            <CardDescription>
                                Primeras consultas pendientes en la agenda.
                            </CardDescription>
                        </div>

                        <Badge variant="primary">
                            {upcomingAppointments.length}
                        </Badge>
                    </CardHeader>

                    <CardContent className="p-0">
                        {upcomingAppointments.length >
                            0 ? (
                            <div className="divide-y divide-border">
                                {upcomingAppointments.map(
                                    (appointment) => (
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
                                                    {formatDate(
                                                        appointment.scheduledDate
                                                    )}
                                                    {" · "}
                                                    {
                                                        appointment.startTime
                                                    }
                                                    {" · "}
                                                    {
                                                        appointment.doctorName
                                                    }
                                                </p>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                <Badge variant="success">
                                                    Programada
                                                </Badge>

                                                <Badge variant="neutral">
                                                    {
                                                        appointment.durationMinutes
                                                    }{" "}
                                                    min
                                                </Badge>
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        ) : (
                            <div className="px-6 py-12 text-center">
                                <p className="text-sm font-medium text-foreground">
                                    No hay citas próximas.
                                </p>

                                <p className="mt-1 text-sm text-foreground-muted">
                                    Las citas programadas aparecerán aquí.
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
                            Accesos a las operaciones más frecuentes de recepción.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-3">
                        <Link
                            href="/staff/patients"
                            className={cn(
                                buttonVariants({
                                    variant: "outline",
                                    size: "lg",
                                }),
                                "w-full justify-start"
                            )}
                        >
                            <UsersRound className="size-5" />
                            Consultar pacientes
                        </Link>

                        <Link
                            href="/staff/patients/new"
                            className={cn(
                                buttonVariants({
                                    variant: "outline",
                                    size: "lg",
                                }),
                                "w-full justify-start"
                            )}
                        >
                            <UserPlus className="size-5" />
                            Registrar paciente
                        </Link>

                        <div className="rounded-2xl border border-warning-border bg-warning-soft p-4">
                            <p className="text-xs font-bold uppercase tracking-[0.14em] text-warning-hover">
                                Próximo bloque
                            </p>

                            <p className="mt-2 text-sm leading-6 text-foreground-muted">
                                La agenda será sustituida por un calendario semanal y mensual.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </section>
        </div>
    );
}