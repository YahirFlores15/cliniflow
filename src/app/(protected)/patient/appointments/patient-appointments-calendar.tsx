"use client";

import {
    Ban,
    CalendarClock,
    Clock3,
    Mail,
    RefreshCw,
    Stethoscope,
} from "lucide-react";
import {
    useActionState,
    useEffect,
    useMemo,
    useState,
} from "react";
import {
    useRouter,
} from "next/navigation";

import {
    AppointmentCalendar,
} from "@/components/calendar/appointment-calendar";
import type {
    CalendarAppointment,
    CalendarDoctorOption,
} from "@/components/calendar/calendar.types";
import {
    formatFullDate,
} from "@/components/calendar/calendar.utils";
import {
    ActionMessage,
} from "@/components/feedback/action-message";
import {
    Badge,
} from "@/components/ui/badge";
import {
    Button,
} from "@/components/ui/button";
import {
    Drawer,
} from "@/components/ui/drawer";
import {
    Input,
} from "@/components/ui/input";
import {
    Textarea,
} from "@/components/ui/textarea";
import {
    cancelPatientAppointmentAction,
    reschedulePatientAppointmentAction,
    type PatientActionState,
} from "@/server/modules/patient/patient.actions";
import type {
    PatientAppointmentDTO,
} from "@/shared/dtos/patient.dtos";


type PatientAppointmentsCalendarProps = {
    appointments:
    PatientAppointmentDTO[];
};

type AppointmentAction =
    | "NONE"
    | "RESCHEDULE"
    | "CANCEL";

const INITIAL_ACTION_STATE:
    PatientActionState = {
    ok: false,
    message: "",
};

function getStatusLabel(
    status:
        PatientAppointmentDTO["status"]
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
    status:
        PatientAppointmentDTO["status"]
):
    | "primary"
    | "success"
    | "danger" {
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

function parseAppointmentDateTime(
    appointment:
        PatientAppointmentDTO
): Date | null {
    const value =
        new Date(
            `${appointment.scheduledDate}T${appointment.startTime}:00`
        );

    if (
        Number.isNaN(
            value.getTime()
        )
    ) {
        return null;
    }

    return value;
}

function canModifyAppointment(
    appointment:
        PatientAppointmentDTO
): boolean {
    if (
        appointment.status !==
        "SCHEDULED"
    ) {
        return false;
    }

    const appointmentDateTime =
        parseAppointmentDateTime(
            appointment
        );

    if (!appointmentDateTime) {
        return false;
    }

    return (
        appointmentDateTime >
        new Date()
    );
}

function getMinimumRescheduleDate(): string {
    const minimumDate =
        new Date(
            Date.now() +
            8 *
            60 *
            60 *
            1000
        );

    const year =
        minimumDate.getFullYear();

    const month =
        String(
            minimumDate.getMonth() +
            1
        ).padStart(
            2,
            "0"
        );

    const day =
        String(
            minimumDate.getDate()
        ).padStart(
            2,
            "0"
        );

    return `${year}-${month}-${day}`;
}

export function PatientAppointmentsCalendar({
    appointments,
}: PatientAppointmentsCalendarProps) {
    const router =
        useRouter();

    const [
        selectedAppointmentId,
        setSelectedAppointmentId,
    ] =
        useState<string | null>(
            null
        );

    const [
        activeAction,
        setActiveAction,
    ] =
        useState<AppointmentAction>(
            "NONE"
        );

    const [
        rescheduleState,
        rescheduleFormAction,
        reschedulePending,
    ] =
        useActionState(
            reschedulePatientAppointmentAction,
            INITIAL_ACTION_STATE
        );

    const [
        cancelState,
        cancelFormAction,
        cancelPending,
    ] =
        useActionState(
            cancelPatientAppointmentAction,
            INITIAL_ACTION_STATE
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
                ) ??
                null,
            [
                appointments,
                selectedAppointmentId,
            ]
        );

    const calendarAppointments:
        CalendarAppointment[] =
        useMemo(
            () =>
                appointments.map(
                    (
                        appointment
                    ) => ({
                        id:
                            appointment.id,

                        title:
                            `Dr. ${appointment.doctorName}`,

                        subtitle:
                            appointment.reason ??
                            "Sin motivo registrado",

                        doctorId:
                            appointment.doctorId,

                        doctorName:
                            appointment.doctorName,

                        doctorSpecialty:
                            appointment.specialty,

                        patientId:
                            appointment.patientId,

                        patientName:
                            "Mi consulta",

                        patientEmail:
                            "",

                        scheduledDate:
                            appointment.scheduledDate,

                        startTime:
                            appointment.startTime,

                        endTime:
                            appointment.endTime,

                        durationMinutes:
                            appointment.durationMinutes,

                        status:
                            appointment.status,

                        reason:
                            appointment.reason,

                        cancellationReason:
                            appointment.cancellationReason,

                        hasMedicalNote:
                            appointment.hasMedicalNote,
                    })
                ),
            [
                appointments,
            ]
        );

    const doctors:
        CalendarDoctorOption[] =
        useMemo(
            () => {
                const doctorMap =
                    new Map<
                        string,
                        CalendarDoctorOption
                    >();

                for (
                    const appointment of
                    appointments
                ) {
                    if (
                        doctorMap.has(
                            appointment.doctorId
                        )
                    ) {
                        continue;
                    }

                    doctorMap.set(
                        appointment.doctorId,
                        {
                            id:
                                appointment.doctorId,

                            name:
                                appointment.doctorName,

                            specialty:
                                appointment.specialty,
                        }
                    );
                }

                return Array.from(
                    doctorMap.values()
                );
            },
            [
                appointments,
            ]
        );

    useEffect(
        () => {
            if (
                rescheduleState.ok ||
                cancelState.ok
            ) {
                router.refresh();
            }
        },
        [
            cancelState.ok,
            rescheduleState.ok,
            router,
        ]
    );

    function selectAppointment(
        appointment:
            CalendarAppointment
    ): void {
        setSelectedAppointmentId(
            appointment.id
        );

        setActiveAction(
            "NONE"
        );
    }

    function closeDrawer(): void {
        if (
            reschedulePending ||
            cancelPending
        ) {
            return;
        }

        setSelectedAppointmentId(
            null
        );

        setActiveAction(
            "NONE"
        );
    }

    const appointmentCanBeModified =
        selectedAppointment
            ? canModifyAppointment(
                selectedAppointment
            )
            : false;

    return (
        <>
            <AppointmentCalendar
                appointments={
                    calendarAppointments
                }
                doctors={
                    doctors
                }
                showDoctorFilter={
                    doctors.length >
                    1
                }
                allowSlotSelection={
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
                title="Detalle de la cita"
                description="Información administrativa de la consulta seleccionada."
                onClose={
                    closeDrawer
                }
                footer={
                    selectedAppointment &&
                        appointmentCanBeModified ? (
                        <div className="grid gap-3 sm:grid-cols-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="lg"
                                fullWidth
                                disabled={
                                    cancelPending ||
                                    reschedulePending
                                }
                                onClick={() =>
                                    setActiveAction(
                                        (
                                            current
                                        ) =>
                                            current ===
                                                "RESCHEDULE"
                                                ? "NONE"
                                                : "RESCHEDULE"
                                    )
                                }
                            >
                                <RefreshCw className="size-4" />
                                Reagendar
                            </Button>

                            <Button
                                type="button"
                                variant="danger"
                                size="lg"
                                fullWidth
                                disabled={
                                    cancelPending ||
                                    reschedulePending
                                }
                                onClick={() =>
                                    setActiveAction(
                                        (
                                            current
                                        ) =>
                                            current ===
                                                "CANCEL"
                                                ? "NONE"
                                                : "CANCEL"
                                    )
                                }
                            >
                                <Ban className="size-4" />
                                Cancelar
                            </Button>
                        </div>
                    ) : undefined
                }
            >
                {selectedAppointment ? (
                    <div className="space-y-6">
                        <section className="rounded-2xl border border-primary-border bg-primary-soft p-5">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div className="flex min-w-0 items-start gap-4">
                                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-white">
                                        <Stethoscope className="size-5" />
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-xs font-bold uppercase tracking-[0.12em] text-primary">
                                            Consulta médica
                                        </p>

                                        <h3 className="mt-2 truncate text-lg font-bold text-foreground">
                                            Dr.{" "}
                                            {
                                                selectedAppointment.doctorName
                                            }
                                        </h3>

                                        <p className="mt-1 text-sm text-foreground-muted">
                                            {selectedAppointment.specialty ??
                                                "Especialidad no registrada"}
                                        </p>
                                    </div>
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
                                <Badge variant="neutral">
                                    {
                                        selectedAppointment.durationMinutes
                                    }{" "}
                                    minutos
                                </Badge>

                                {selectedAppointment.hasMedicalNote ? (
                                    <Badge variant="success">
                                        Nota médica disponible
                                    </Badge>
                                ) : (
                                    <Badge variant="neutral">
                                        Sin nota médica
                                    </Badge>
                                )}
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
                                    <Mail className="size-5" />
                                </div>

                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-foreground">
                                        Contacto del médico
                                    </p>

                                    <p className="mt-1 break-all text-sm text-foreground-muted">
                                        {
                                            selectedAppointment.doctorEmail
                                        }
                                    </p>

                                    {selectedAppointment.licenseNumber ? (
                                        <p className="mt-2 text-xs text-foreground-muted">
                                            Cédula profesional:{" "}
                                            {
                                                selectedAppointment.licenseNumber
                                            }
                                        </p>
                                    ) : null}
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

                        {!appointmentCanBeModified &&
                            selectedAppointment.status ===
                            "SCHEDULED" ? (
                            <ActionMessage variant="info">
                                Esta cita ya comenzó o quedó en el pasado, por lo que no puede modificarse desde el portal.
                            </ActionMessage>
                        ) : null}

                        {activeAction ===
                            "RESCHEDULE" &&
                            appointmentCanBeModified ? (
                            <form
                                action={
                                    rescheduleFormAction
                                }
                                className="rounded-2xl border border-primary-border bg-primary-soft p-5"
                            >
                                <input
                                    type="hidden"
                                    name="appointmentId"
                                    value={
                                        selectedAppointment.id
                                    }
                                />

                                <div className="flex items-start gap-3">
                                    <RefreshCw className="mt-0.5 size-5 shrink-0 text-primary" />

                                    <div>
                                        <h3 className="text-sm font-semibold text-foreground">
                                            Reagendar consulta
                                        </h3>

                                        <p className="mt-1 text-xs leading-5 text-foreground-muted">
                                            El servidor volverá a comprobar horario, duración, bloqueos, anticipación y citas superpuestas.
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                                    <label>
                                        <span className="mb-2 block text-sm font-semibold text-foreground">
                                            Nueva fecha
                                        </span>

                                        <Input
                                            type="date"
                                            name="scheduledDate"
                                            required
                                            min={
                                                getMinimumRescheduleDate()
                                            }
                                            defaultValue={
                                                selectedAppointment.scheduledDate
                                            }
                                        />
                                    </label>

                                    <label>
                                        <span className="mb-2 block text-sm font-semibold text-foreground">
                                            Nueva hora
                                        </span>

                                        <Input
                                            type="time"
                                            name="startTime"
                                            required
                                            defaultValue={
                                                selectedAppointment.startTime
                                            }
                                        />
                                    </label>
                                </div>

                                {rescheduleState.message ? (
                                    <ActionMessage
                                        variant={
                                            rescheduleState.ok
                                                ? "success"
                                                : "error"
                                        }
                                        className="mt-4"
                                    >
                                        {
                                            rescheduleState.message
                                        }
                                    </ActionMessage>
                                ) : null}

                                <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        disabled={
                                            reschedulePending
                                        }
                                        onClick={() =>
                                            setActiveAction(
                                                "NONE"
                                            )
                                        }
                                    >
                                        Cerrar
                                    </Button>

                                    <Button
                                        type="submit"
                                        variant="primary"
                                        disabled={
                                            reschedulePending
                                        }
                                    >
                                        <RefreshCw className="size-4" />

                                        {reschedulePending
                                            ? "Verificando..."
                                            : "Confirmar reagendado"}
                                    </Button>
                                </div>
                            </form>
                        ) : null}

                        {activeAction ===
                            "CANCEL" &&
                            appointmentCanBeModified ? (
                            <form
                                action={
                                    cancelFormAction
                                }
                                className="rounded-2xl border border-danger-border bg-danger-soft p-5"
                            >
                                <input
                                    type="hidden"
                                    name="appointmentId"
                                    value={
                                        selectedAppointment.id
                                    }
                                />

                                <div className="flex items-start gap-3">
                                    <Ban className="mt-0.5 size-5 shrink-0 text-danger" />

                                    <div>
                                        <h3 className="text-sm font-semibold text-foreground">
                                            Cancelar consulta
                                        </h3>

                                        <p className="mt-1 text-xs leading-5 text-foreground-muted">
                                            La cita dejará de estar disponible y no podrá reactivarse desde el portal.
                                        </p>
                                    </div>
                                </div>

                                <label className="mt-5 block">
                                    <span className="mb-2 block text-sm font-semibold text-foreground">
                                        Motivo de cancelación{" "}
                                        <span className="font-normal text-foreground-muted">
                                            (opcional)
                                        </span>
                                    </span>

                                    <Textarea
                                        name="reason"
                                        rows={4}
                                        maxLength={
                                            500
                                        }
                                        placeholder="Describe brevemente el motivo"
                                    />
                                </label>

                                {cancelState.message ? (
                                    <ActionMessage
                                        variant={
                                            cancelState.ok
                                                ? "success"
                                                : "error"
                                        }
                                        className="mt-4"
                                    >
                                        {
                                            cancelState.message
                                        }
                                    </ActionMessage>
                                ) : null}

                                <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        disabled={
                                            cancelPending
                                        }
                                        onClick={() =>
                                            setActiveAction(
                                                "NONE"
                                            )
                                        }
                                    >
                                        Conservar cita
                                    </Button>

                                    <Button
                                        type="submit"
                                        variant="danger"
                                        disabled={
                                            cancelPending
                                        }
                                    >
                                        <Ban className="size-4" />

                                        {cancelPending
                                            ? "Cancelando..."
                                            : "Confirmar cancelación"}
                                    </Button>
                                </div>
                            </form>
                        ) : null}
                    </div>
                ) : null}
            </Drawer>
        </>
    );
}