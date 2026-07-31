"use client";

import {
    AlertCircle,
    Ban,
    CalendarDays,
    CheckCircle2,
    Clock3,
    RefreshCw,
    Stethoscope,
} from "lucide-react";
import { useActionState, useState } from "react";
import {
    cancelPatientAppointmentAction,
    reschedulePatientAppointmentAction,
    type PatientActionState,
} from "@/server/modules/patient/patient.actions";
import type { PatientAppointmentDTO } from "@/shared/dtos/patient.dtos";

type PatientAppointmentCardProps = {
    appointment: PatientAppointmentDTO;
};

type OpenForm = "NONE" | "RESCHEDULE" | "CANCEL";

const initialState: PatientActionState = {
    ok: false,
    message: "",
};

function formatDate(date: string): string {
    const [year, month, day] = date.split("-").map(Number);

    if (!year || !month || !day) {
        return date;
    }

    return new Intl.DateTimeFormat("es-MX", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(new Date(year, month - 1, day));
}

function getLocalMinimumDate(): string {
    const date = new Date();

    date.setHours(date.getHours() + 8);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(
        2,
        "0"
    );
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function ActionMessage({
    state,
}: {
    state: PatientActionState;
}) {
    if (!state.message) {
        return null;
    }

    return (
        <div
            className={`mt-4 flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${state.ok
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-rose-200 bg-rose-50 text-rose-800"
                }`}
        >
            {state.ok ? (
                <CheckCircle2
                    aria-hidden="true"
                    className="mt-0.5 h-5 w-5 shrink-0"
                />
            ) : (
                <AlertCircle
                    aria-hidden="true"
                    className="mt-0.5 h-5 w-5 shrink-0"
                />
            )}

            <p>{state.message}</p>
        </div>
    );
}

export default function PatientAppointmentCard({
    appointment,
}: PatientAppointmentCardProps) {
    const [openForm, setOpenForm] =
        useState<OpenForm>("NONE");

    const [
        rescheduleState,
        rescheduleAction,
        isRescheduling,
    ] = useActionState(
        reschedulePatientAppointmentAction,
        initialState
    );

    const [cancelState, cancelAction, isCancelling] =
        useActionState(
            cancelPatientAppointmentAction,
            initialState
        );

    return (
        <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="grid gap-6 p-6 lg:grid-cols-[1fr_auto]">
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-800">
                            Programada
                        </span>

                        {appointment.hasMedicalNote ? (
                            <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-800">
                                Nota médica disponible
                            </span>
                        ) : null}
                    </div>

                    <div className="mt-4 flex items-start gap-4">
                        <div className="rounded-2xl bg-slate-100 p-3">
                            <Stethoscope
                                aria-hidden="true"
                                className="h-6 w-6 text-slate-700"
                            />
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-slate-950">
                                Dr. {appointment.doctorName}
                            </h3>

                            <p className="mt-1 text-sm text-slate-600">
                                {appointment.specialty ??
                                    "Especialidad no registrada"}
                            </p>

                            {appointment.licenseNumber ? (
                                <p className="mt-1 text-xs text-slate-500">
                                    Cédula profesional:{" "}
                                    {appointment.licenseNumber}
                                </p>
                            ) : null}
                        </div>
                    </div>

                    <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                        <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                            <CalendarDays
                                aria-hidden="true"
                                className="mt-0.5 h-5 w-5 shrink-0 text-cyan-700"
                            />

                            <div>
                                <p className="font-medium capitalize text-slate-900">
                                    {formatDate(
                                        appointment.scheduledDate
                                    )}
                                </p>
                                <p className="mt-1 text-slate-500">
                                    Fecha de consulta
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                            <Clock3
                                aria-hidden="true"
                                className="mt-0.5 h-5 w-5 shrink-0 text-cyan-700"
                            />

                            <div>
                                <p className="font-medium text-slate-900">
                                    {appointment.startTime} a{" "}
                                    {appointment.endTime}
                                </p>
                                <p className="mt-1 text-slate-500">
                                    {appointment.durationMinutes}{" "}
                                    minutos
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 rounded-2xl border border-slate-200 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Motivo registrado
                        </p>

                        <p className="mt-2 text-sm leading-6 text-slate-700">
                            {appointment.reason ??
                                "Sin motivo registrado."}
                        </p>
                    </div>
                </div>

                <div className="flex gap-2 lg:flex-col">
                    <button
                        type="button"
                        onClick={() =>
                            setOpenForm((current) =>
                                current === "RESCHEDULE"
                                    ? "NONE"
                                    : "RESCHEDULE"
                            )
                        }
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-800 transition hover:bg-cyan-100 lg:flex-none"
                    >
                        <RefreshCw
                            aria-hidden="true"
                            className="h-4 w-4"
                        />
                        Reagendar
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            setOpenForm((current) =>
                                current === "CANCEL"
                                    ? "NONE"
                                    : "CANCEL"
                            )
                        }
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800 transition hover:bg-rose-100 lg:flex-none"
                    >
                        <Ban
                            aria-hidden="true"
                            className="h-4 w-4"
                        />
                        Cancelar
                    </button>
                </div>
            </div>

            {openForm === "RESCHEDULE" ? (
                <form
                    action={rescheduleAction}
                    className="border-t border-slate-200 bg-slate-50 p-6"
                >
                    <input
                        type="hidden"
                        name="appointmentId"
                        value={appointment.id}
                    />

                    <div className="flex items-center gap-3">
                        <RefreshCw
                            aria-hidden="true"
                            className="h-5 w-5 text-cyan-700"
                        />

                        <div>
                            <h4 className="font-semibold text-slate-950">
                                Seleccionar nueva fecha y hora
                            </h4>

                            <p className="mt-1 text-sm text-slate-500">
                                Se verificará nuevamente el horario,
                                los bloqueos y la disponibilidad del
                                médico.
                            </p>
                        </div>
                    </div>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                        <label>
                            <span className="text-sm font-medium text-slate-700">
                                Nueva fecha
                            </span>

                            <input
                                name="scheduledDate"
                                type="date"
                                required
                                min={getLocalMinimumDate()}
                                defaultValue={
                                    appointment.scheduledDate
                                }
                                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-600 focus:ring-4 focus:ring-cyan-100"
                            />
                        </label>

                        <label>
                            <span className="text-sm font-medium text-slate-700">
                                Nueva hora
                            </span>

                            <input
                                name="startTime"
                                type="time"
                                required
                                defaultValue={
                                    appointment.startTime
                                }
                                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-600 focus:ring-4 focus:ring-cyan-100"
                            />
                        </label>
                    </div>

                    <ActionMessage state={rescheduleState} />

                    <div className="mt-5 flex flex-wrap justify-end gap-3">
                        <button
                            type="button"
                            onClick={() =>
                                setOpenForm("NONE")
                            }
                            className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                        >
                            Cerrar
                        </button>

                        <button
                            type="submit"
                            disabled={isRescheduling}
                            className="rounded-xl bg-cyan-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isRescheduling
                                ? "Verificando..."
                                : "Confirmar reagendado"}
                        </button>
                    </div>
                </form>
            ) : null}

            {openForm === "CANCEL" ? (
                <form
                    action={cancelAction}
                    className="border-t border-rose-100 bg-rose-50/50 p-6"
                >
                    <input
                        type="hidden"
                        name="appointmentId"
                        value={appointment.id}
                    />

                    <div className="flex items-center gap-3">
                        <Ban
                            aria-hidden="true"
                            className="h-5 w-5 text-rose-700"
                        />

                        <div>
                            <h4 className="font-semibold text-slate-950">
                                Cancelar cita
                            </h4>

                            <p className="mt-1 text-sm text-slate-600">
                                Esta acción no puede deshacerse desde
                                el portal.
                            </p>
                        </div>
                    </div>

                    <label className="mt-5 block">
                        <span className="text-sm font-medium text-slate-700">
                            Motivo de cancelación{" "}
                            <span className="font-normal text-slate-400">
                                (opcional)
                            </span>
                        </span>

                        <textarea
                            name="reason"
                            rows={3}
                            maxLength={500}
                            placeholder="Describe brevemente el motivo"
                            className="mt-2 w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-rose-600 focus:ring-4 focus:ring-rose-100"
                        />
                    </label>

                    <ActionMessage state={cancelState} />

                    <div className="mt-5 flex flex-wrap justify-end gap-3">
                        <button
                            type="button"
                            onClick={() =>
                                setOpenForm("NONE")
                            }
                            className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                        >
                            Conservar cita
                        </button>

                        <button
                            type="submit"
                            disabled={isCancelling}
                            className="rounded-xl bg-rose-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isCancelling
                                ? "Cancelando..."
                                : "Confirmar cancelación"}
                        </button>
                    </div>
                </form>
            ) : null}
        </article>
    );
}