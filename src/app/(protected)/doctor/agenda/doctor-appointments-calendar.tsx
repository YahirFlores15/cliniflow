"use client";

import {
    CalendarClock,
    Clock3,
    FileHeart,
    Mail,
    NotebookPen,
    Phone,
    Stethoscope,
    UserRound,
} from "lucide-react";
import Link from "next/link";
import {
    useMemo,
    useState,
} from "react";

import { AppointmentCalendar } from "@/components/calendar/appointment-calendar";
import type {
    CalendarAppointment,
    CalendarDoctorBlock,
    CalendarDoctorOption,
    CalendarDoctorSchedule,
} from "@/components/calendar/calendar.types";
import { formatFullDate } from "@/components/calendar/calendar.utils";
import { Badge } from "@/components/ui/badge";
import {
    buttonVariants,
} from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { cn } from "@/lib/utils";

type DoctorAppointmentsCalendarProps = {
    appointments: CalendarAppointment[];
    doctor: CalendarDoctorOption;
    schedules: CalendarDoctorSchedule[];
    blocks: CalendarDoctorBlock[];
};

function getStatusLabel(
    status: CalendarAppointment["status"]
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

function getStatusVariant(
    status: CalendarAppointment["status"]
):
    | "success"
    | "danger"
    | "primary" {
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

function getPatientAge(
    birthDate:
        | string
        | null
        | undefined
): string | null {
    if (!birthDate) {
        return null;
    }

    const match =
        /^(\d{4})-(\d{2})-(\d{2})$/.exec(
            birthDate
        );

    if (!match) {
        return null;
    }

    const birthYear =
        Number(match[1]);

    const birthMonth =
        Number(match[2]);

    const birthDay =
        Number(match[3]);

    const today =
        new Date();

    let age =
        today.getFullYear() -
        birthYear;

    const birthdayHasNotPassed =
        today.getMonth() + 1 <
        birthMonth ||
        (today.getMonth() + 1 ===
            birthMonth &&
            today.getDate() <
            birthDay);

    if (
        birthdayHasNotPassed
    ) {
        age -= 1;
    }

    return `${age} años`;
}

export function DoctorAppointmentsCalendar({
    appointments,
    doctor,
    schedules,
    blocks,
}: DoctorAppointmentsCalendarProps) {
    const [
        selectedAppointmentId,
        setSelectedAppointmentId,
    ] =
        useState<string | null>(
            null
        );

    const selectedAppointment =
        useMemo(
            () =>
                appointments.find(
                    (
                        appointment
                    ) =>
                        appointment.id ===
                        selectedAppointmentId
                ) ?? null,
            [
                appointments,
                selectedAppointmentId,
            ]
        );

    const patientAge =
        getPatientAge(
            selectedAppointment
                ?.patientBirthDate
        );

    function selectAppointment(
        appointment: CalendarAppointment
    ): void {
        setSelectedAppointmentId(
            appointment.id
        );
    }

    function closeDrawer(): void {
        setSelectedAppointmentId(
            null
        );
    }

    return (
        <>
            <AppointmentCalendar
                appointments={
                    appointments
                }
                doctors={[
                    doctor,
                ]}
                schedules={
                    schedules
                }
                blocks={
                    blocks
                }
                showDoctorFilter={
                    false
                }
                onAppointmentSelect={
                    selectAppointment
                }
            />

            <Drawer
                open={Boolean(
                    selectedAppointment
                )}
                title="Detalle de la consulta"
                description="Información médica y administrativa de la cita seleccionada."
                onClose={
                    closeDrawer
                }
                footer={
                    selectedAppointment ? (
                        <div className="grid gap-3 sm:grid-cols-2">
                            <Link
                                href={`/doctor/patients/record?patientId=${encodeURIComponent(
                                    selectedAppointment.patientId
                                )}`}
                                className={cn(
                                    buttonVariants({
                                        variant:
                                            "outline",
                                        size: "lg",
                                    }),
                                    "w-full"
                                )}
                            >
                                <FileHeart className="size-4" />
                                Abrir expediente
                            </Link>

                            <Link
                                href={`/doctor/appointments/note?appointmentId=${encodeURIComponent(
                                    selectedAppointment.id
                                )}`}
                                className={cn(
                                    buttonVariants({
                                        variant:
                                            "primary",
                                        size: "lg",
                                    }),
                                    "w-full"
                                )}
                            >
                                <NotebookPen className="size-4" />

                                {selectedAppointment.hasMedicalNote
                                    ? "Ver nota"
                                    : "Crear nota"}
                            </Link>
                        </div>
                    ) : null
                }
            >
                {selectedAppointment ? (
                    <div className="space-y-6">
                        <section className="rounded-2xl border border-primary-border bg-primary-soft p-5">
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <p className="text-xs font-bold uppercase tracking-[0.15em] text-primary">
                                        Consulta médica
                                    </p>

                                    <h3 className="mt-2 truncate text-xl font-bold text-foreground">
                                        {
                                            selectedAppointment.patientName
                                        }
                                    </h3>

                                    <p className="mt-1 text-sm text-foreground-muted">
                                        {
                                            doctor.name
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

                            <div className="mt-4 flex flex-wrap gap-2">
                                {selectedAppointment.hasMedicalNote ? (
                                    <Badge variant="success">
                                        Nota médica registrada
                                    </Badge>
                                ) : (
                                    <Badge variant="neutral">
                                        Sin nota médica
                                    </Badge>
                                )}

                                <Badge variant="neutral">
                                    {
                                        selectedAppointment.durationMinutes
                                    }{" "}
                                    min
                                </Badge>
                            </div>
                        </section>

                        <section className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-2xl border border-border bg-surface-muted p-4">
                                <CalendarClock className="size-5 text-primary" />

                                <p className="mt-3 text-xs font-bold uppercase tracking-[0.1em] text-foreground-muted">
                                    Fecha
                                </p>

                                <p className="mt-1 text-sm font-semibold capitalize text-foreground">
                                    {formatFullDate(
                                        selectedAppointment.scheduledDate
                                    )}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-border bg-surface-muted p-4">
                                <Clock3 className="size-5 text-secondary" />

                                <p className="mt-3 text-xs font-bold uppercase tracking-[0.1em] text-foreground-muted">
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
                            <div className="flex items-start gap-3">
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary-border bg-primary-soft text-primary">
                                    <UserRound className="size-5" />
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

                                    {selectedAppointment.patientPhone ? (
                                        <p className="mt-1 flex items-center gap-2 text-xs text-foreground-muted">
                                            <Phone className="size-3.5 shrink-0" />

                                            {
                                                selectedAppointment.patientPhone
                                            }
                                        </p>
                                    ) : null}

                                    {patientAge ? (
                                        <p className="mt-2 text-xs font-medium text-foreground-muted">
                                            {
                                                patientAge
                                            }
                                        </p>
                                    ) : null}
                                </div>
                            </div>
                        </section>

                        <section className="rounded-2xl border border-border p-4">
                            <div className="flex items-start gap-3">
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-secondary-border bg-secondary-soft text-secondary">
                                    <Stethoscope className="size-5" />
                                </div>

                                <div>
                                    <p className="text-sm font-semibold text-foreground">
                                        {
                                            selectedAppointment.doctorName
                                        }
                                    </p>

                                    <p className="mt-1 text-xs text-foreground-muted">
                                        {selectedAppointment.doctorSpecialty ??
                                            "Especialidad no registrada"}
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
                            "CANCELLED" ? (
                            <section>
                                <h3 className="text-sm font-semibold text-danger">
                                    Motivo de cancelación
                                </h3>

                                <div className="mt-3 rounded-2xl border border-danger-border bg-danger-soft p-4">
                                    <p className="whitespace-pre-wrap text-sm leading-6 text-danger">
                                        {selectedAppointment.cancellationReason ??
                                            "No se registró un motivo de cancelación."}
                                    </p>
                                </div>
                            </section>
                        ) : null}

                        {selectedAppointment.status ===
                            "CANCELLED" &&
                            !selectedAppointment.hasMedicalNote ? (
                            <section className="rounded-2xl border border-warning-border bg-warning-soft p-4">
                                <p className="text-sm font-semibold text-foreground">
                                    Consulta cancelada
                                </p>

                                <p className="mt-1 text-xs leading-5 text-foreground-muted">
                                    No se puede registrar una nota médica nueva para esta cita.
                                </p>
                            </section>
                        ) : null}
                    </div>
                ) : null}
            </Drawer>
        </>
    );
}