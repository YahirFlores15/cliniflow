"use client";

import {
    CalendarClock,
    CalendarX2,
    Clock3,
    Mail,
    Pencil,
    Stethoscope,
    UserRound,
} from "lucide-react";
import {
    useState,
} from "react";

import type {
    CalendarAppointment,
    CalendarDoctorOption,
} from "@/components/calendar/calendar.types";
import {
    formatFullDate,
} from "@/components/calendar/calendar.utils";
import { AppointmentCalendar } from "@/components/calendar/appointment-calendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";

type StaffAppointmentsCalendarProps = {
    appointments: CalendarAppointment[];
    doctors: CalendarDoctorOption[];
};

function getStatusLabel(
    status: CalendarAppointment["status"]
): string {
    if (status === "COMPLETED") {
        return "Completada";
    }

    if (status === "CANCELLED") {
        return "Cancelada";
    }

    return "Programada";
}

function getStatusVariant(
    status: CalendarAppointment["status"]
):
    | "success"
    | "danger"
    | "primary" {
    if (status === "COMPLETED") {
        return "success";
    }

    if (status === "CANCELLED") {
        return "danger";
    }

    return "primary";
}

export function StaffAppointmentsCalendar({
    appointments,
    doctors,
}: StaffAppointmentsCalendarProps) {
    const [
        selectedAppointment,
        setSelectedAppointment,
    ] =
        useState<CalendarAppointment | null>(
            null
        );

    const canModify =
        selectedAppointment?.status ===
        "SCHEDULED";

    return (
        <>
            <AppointmentCalendar
                appointments={appointments}
                doctors={doctors}
                onAppointmentSelect={
                    setSelectedAppointment
                }
            />

            <Drawer
                open={Boolean(
                    selectedAppointment
                )}
                title="Detalle de la cita"
                description="Información administrativa de la consulta seleccionada."
                onClose={() =>
                    setSelectedAppointment(null)
                }
                footer={
                    selectedAppointment ? (
                        <div className="grid gap-3 sm:grid-cols-2">
                            <Button
                                type="button"
                                variant="outline"
                                disabled={!canModify}
                                title={
                                    canModify
                                        ? "Disponible en el siguiente bloque"
                                        : "Solo las citas programadas pueden reagendarse"
                                }
                            >
                                <Pencil className="size-4" />
                                Reagendar
                            </Button>

                            <Button
                                type="button"
                                variant="danger"
                                disabled={!canModify}
                                title={
                                    canModify
                                        ? "Disponible en el siguiente bloque"
                                        : "Solo las citas programadas pueden cancelarse"
                                }
                            >
                                <CalendarX2 className="size-4" />
                                Cancelar cita
                            </Button>
                        </div>
                    ) : null
                }
            >
                {selectedAppointment ? (
                    <div className="space-y-6">
                        <section className="rounded-2xl border border-primary-border bg-primary-soft p-5">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.15em] text-primary">
                                        Consulta
                                    </p>

                                    <h3 className="mt-2 text-xl font-bold tracking-tight text-foreground">
                                        {
                                            selectedAppointment.patientName
                                        }
                                    </h3>

                                    <p className="mt-1 text-sm text-foreground-muted">
                                        {
                                            selectedAppointment.doctorName
                                        }
                                    </p>
                                </div>

                                <Badge
                                    variant={getStatusVariant(
                                        selectedAppointment.status
                                    )}
                                >
                                    {getStatusLabel(
                                        selectedAppointment.status
                                    )}
                                </Badge>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-sm font-semibold text-foreground">
                                Fecha y horario
                            </h3>

                            <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                <div className="rounded-2xl border border-border bg-surface-muted p-4">
                                    <CalendarClock className="size-5 text-primary" />

                                    <p className="mt-3 text-xs font-bold uppercase tracking-[0.12em] text-foreground-muted">
                                        Fecha
                                    </p>

                                    <p className="mt-1 text-sm font-semibold text-foreground">
                                        {formatFullDate(
                                            selectedAppointment.scheduledDate
                                        )}
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-border bg-surface-muted p-4">
                                    <Clock3 className="size-5 text-secondary" />

                                    <p className="mt-3 text-xs font-bold uppercase tracking-[0.12em] text-foreground-muted">
                                        Horario
                                    </p>

                                    <p className="mt-1 text-sm font-semibold text-foreground">
                                        {
                                            selectedAppointment.startTime
                                        }
                                        {" – "}
                                        {
                                            selectedAppointment.endTime
                                        }
                                    </p>

                                    <p className="mt-1 text-xs text-foreground-muted">
                                        {
                                            selectedAppointment.durationMinutes
                                        }{" "}
                                        minutos
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-sm font-semibold text-foreground">
                                Paciente
                            </h3>

                            <div className="mt-3 rounded-2xl border border-border bg-surface p-4 shadow-[var(--shadow-sm)]">
                                <div className="flex items-start gap-3">
                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary-border bg-primary-soft text-primary">
                                        <UserRound
                                            className="size-5"
                                            strokeWidth={1.9}
                                        />
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-foreground">
                                            {
                                                selectedAppointment.patientName
                                            }
                                        </p>

                                        <p className="mt-1 flex items-center gap-2 text-xs text-foreground-muted">
                                            <Mail className="size-3.5 shrink-0" />

                                            <span className="truncate">
                                                {
                                                    selectedAppointment.patientEmail
                                                }
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-sm font-semibold text-foreground">
                                Médico
                            </h3>

                            <div className="mt-3 rounded-2xl border border-border bg-surface p-4 shadow-[var(--shadow-sm)]">
                                <div className="flex items-start gap-3">
                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-secondary-border bg-secondary-soft text-secondary">
                                        <Stethoscope
                                            className="size-5"
                                            strokeWidth={1.9}
                                        />
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-foreground">
                                            {
                                                selectedAppointment.doctorName
                                            }
                                        </p>

                                        <p className="mt-1 text-xs text-foreground-muted">
                                            {selectedAppointment.doctorSpecialty ??
                                                "Sin especialidad registrada"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-sm font-semibold text-foreground">
                                Motivo de consulta
                            </h3>

                            <div className="mt-3 rounded-2xl border border-border bg-surface-muted p-4">
                                <p className="whitespace-pre-wrap text-sm leading-6 text-foreground">
                                    {selectedAppointment.reason ??
                                        "Sin motivo registrado."}
                                </p>
                            </div>
                        </section>

                        {selectedAppointment.status ===
                            "CANCELLED" &&
                            selectedAppointment.cancellationReason ? (
                            <section>
                                <h3 className="text-sm font-semibold text-danger">
                                    Motivo de cancelación
                                </h3>

                                <div className="mt-3 rounded-2xl border border-danger-border bg-danger-soft p-4">
                                    <p className="whitespace-pre-wrap text-sm leading-6 text-danger">
                                        {
                                            selectedAppointment.cancellationReason
                                        }
                                    </p>
                                </div>
                            </section>
                        ) : null}

                        <p className="text-xs leading-5 text-foreground-muted">
                            Esta vista contiene únicamente información administrativa. El personal de recepción no puede consultar expediente, diagnósticos, recetas ni notas médicas.
                        </p>
                    </div>
                ) : null}
            </Drawer>
        </>
    );
}