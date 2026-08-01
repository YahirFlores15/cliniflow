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
    useMemo,
    useState,
} from "react";
import { useRouter } from "next/navigation";

import { CancelAppointmentForm } from "@/app/(protected)/staff/appointments/cancel-appointment-form";
import { RescheduleAppointmentForm } from "@/app/(protected)/staff/appointments/reschedule-appointment-form";
import { AppointmentCalendar } from "@/components/calendar/appointment-calendar";
import type {
    CalendarAppointment,
    CalendarDoctorBlock,
    CalendarDoctorOption,
    CalendarDoctorSchedule,
    CalendarSlotSelection,
} from "@/components/calendar/calendar.types";
import { formatFullDate } from "@/components/calendar/calendar.utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";

type StaffAppointmentsCalendarProps = {
    appointments: CalendarAppointment[];
    doctors: CalendarDoctorOption[];
    schedules: CalendarDoctorSchedule[];
    blocks: CalendarDoctorBlock[];
};

type DrawerMode =
    | "DETAIL"
    | "RESCHEDULE"
    | "CANCEL";

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

function getDrawerTitle(
    mode: DrawerMode
): string {
    if (mode === "RESCHEDULE") {
        return "Reagendar cita";
    }

    if (mode === "CANCEL") {
        return "Cancelar cita";
    }

    return "Detalle de la cita";
}

function getDrawerDescription(
    mode: DrawerMode
): string {
    if (mode === "RESCHEDULE") {
        return "Selecciona una nueva fecha y hora para la consulta.";
    }

    if (mode === "CANCEL") {
        return "Confirma la cancelación de la cita seleccionada.";
    }

    return "Información administrativa de la consulta seleccionada.";
}

export function StaffAppointmentsCalendar({
    appointments,
    doctors,
    schedules,
    blocks,
}: StaffAppointmentsCalendarProps) {
    const router = useRouter();

    const [
        selectedAppointmentId,
        setSelectedAppointmentId,
    ] = useState<string | null>(
        null
    );

    const [
        drawerMode,
        setDrawerMode,
    ] =
        useState<DrawerMode>(
            "DETAIL"
        );

    const selectedAppointment =
        useMemo(
            () =>
                appointments.find(
                    (appointment) =>
                        appointment.id ===
                        selectedAppointmentId
                ) ?? null,
            [
                appointments,
                selectedAppointmentId,
            ]
        );

    const canModify =
        selectedAppointment?.status ===
        "SCHEDULED";

    function selectAppointment(
        appointment: CalendarAppointment
    ): void {
        setSelectedAppointmentId(
            appointment.id
        );

        setDrawerMode("DETAIL");
    }

    function selectAvailableSlot(
        selection: CalendarSlotSelection
    ): void {
        const params =
            new URLSearchParams({
                doctorId:
                    selection.doctorId,
                date:
                    selection.scheduledDate,
                time:
                    selection.startTime,
            });

        router.push(
            `/staff/appointments/new?${params.toString()}`
        );
    }

    function closeDrawer(): void {
        setSelectedAppointmentId(
            null
        );

        setDrawerMode("DETAIL");
    }

    function showDetails(): void {
        setDrawerMode("DETAIL");
    }

    return (
        <>
            <AppointmentCalendar
                appointments={
                    appointments
                }
                doctors={doctors}
                schedules={schedules}
                blocks={blocks}
                allowSlotSelection
                onAppointmentSelect={
                    selectAppointment
                }
                onAvailableSlotSelect={
                    selectAvailableSlot
                }
            />

            <Drawer
                open={Boolean(
                    selectedAppointment
                )}
                title={getDrawerTitle(
                    drawerMode
                )}
                description={getDrawerDescription(
                    drawerMode
                )}
                onClose={closeDrawer}
                footer={
                    selectedAppointment &&
                        drawerMode ===
                        "DETAIL" ? (
                        <div className="grid gap-3 sm:grid-cols-2">
                            <Button
                                type="button"
                                variant="outline"
                                disabled={
                                    !canModify
                                }
                                onClick={() =>
                                    setDrawerMode(
                                        "RESCHEDULE"
                                    )
                                }
                            >
                                <Pencil className="size-4" />
                                Reagendar
                            </Button>

                            <Button
                                type="button"
                                variant="danger"
                                disabled={
                                    !canModify
                                }
                                onClick={() =>
                                    setDrawerMode(
                                        "CANCEL"
                                    )
                                }
                            >
                                <CalendarX2 className="size-4" />
                                Cancelar cita
                            </Button>
                        </div>
                    ) : null
                }
            >
                {selectedAppointment &&
                    drawerMode ===
                    "RESCHEDULE" ? (
                    <RescheduleAppointmentForm
                        key={`reschedule-${selectedAppointment.id}`}
                        appointment={
                            selectedAppointment
                        }
                        onCancel={
                            showDetails
                        }
                    />
                ) : null}

                {selectedAppointment &&
                    drawerMode ===
                    "CANCEL" ? (
                    <CancelAppointmentForm
                        key={`cancel-${selectedAppointment.id}`}
                        appointment={
                            selectedAppointment
                        }
                        onCancel={
                            showDetails
                        }
                    />
                ) : null}

                {selectedAppointment &&
                    drawerMode ===
                    "DETAIL" ? (
                    <div className="space-y-6">
                        <section className="rounded-2xl border border-primary-border bg-primary-soft p-5">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.15em] text-primary">
                                        Consulta
                                    </p>

                                    <h3 className="mt-2 text-xl font-bold text-foreground">
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

                        <section className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-2xl border border-border bg-surface-muted p-4">
                                <CalendarClock className="size-5 text-primary" />

                                <p className="mt-3 text-xs font-bold uppercase text-foreground-muted">
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

                                <p className="mt-3 text-xs font-bold uppercase text-foreground-muted">
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
                            </div>
                        </section>

                        <section className="rounded-2xl border border-border p-4">
                            <div className="flex gap-3">
                                <UserRound className="size-5 text-primary" />

                                <div>
                                    <p className="text-sm font-semibold text-foreground">
                                        {
                                            selectedAppointment.patientName
                                        }
                                    </p>

                                    <p className="mt-1 flex items-center gap-2 text-xs text-foreground-muted">
                                        <Mail className="size-3.5" />
                                        {
                                            selectedAppointment.patientEmail
                                        }
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section className="rounded-2xl border border-border p-4">
                            <div className="flex gap-3">
                                <Stethoscope className="size-5 text-secondary" />

                                <div>
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
                                    <p className="text-sm text-danger">
                                        {
                                            selectedAppointment.cancellationReason
                                        }
                                    </p>
                                </div>
                            </section>
                        ) : null}
                    </div>
                ) : null}
            </Drawer>
        </>
    );
}