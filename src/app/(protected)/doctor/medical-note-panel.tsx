"use client";

import { useActionState } from "react";
import {
    ClipboardPlus,
    FileCheck2,
    Pill,
    Save,
    ShieldCheck,
    UserRound,
} from "lucide-react";

import {
    createMedicalNoteAction,
    type DoctorActionState,
} from "@/server/modules/doctor/doctor.actions";
import type {
    DoctorAppointmentDTO,
    MedicalNoteDTO,
} from "@/shared/dtos/doctor.dtos";

type MedicalNotePanelProps = {
    appointment: DoctorAppointmentDTO;
    note: MedicalNoteDTO | null;
};

const initialActionState: DoctorActionState = {
    ok: false,
    message: "",
};

function formatCalendarDate(
    date: string
): string {
    const match =
        /^(\d{4})-(\d{2})-(\d{2})$/.exec(
            date
        );

    if (!match) {
        return date;
    }

    const parsedDate = new Date(
        Number(match[1]),
        Number(match[2]) - 1,
        Number(match[3])
    );

    return new Intl.DateTimeFormat(
        "es-MX",
        {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric",
        }
    ).format(parsedDate);
}

function ExistingMedicalNote({
    note,
}: {
    note: MedicalNoteDTO;
}) {
    return (
        <section
            id="medical-note"
            className="mt-10 scroll-mt-6 border-t border-slate-200 pt-10"
        >
            <div className="flex items-start gap-3">
                <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-700">
                    <FileCheck2 className="h-5 w-5" />
                </div>

                <div>
                    <h2 className="text-xl font-semibold text-slate-950">
                        Nota médica registrada
                    </h2>

                    <p className="mt-1 text-sm text-slate-600">
                        Esta nota está ligada permanentemente a la cita
                        seleccionada y no puede reemplazarse.
                    </p>
                </div>
            </div>

            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start gap-3">
                        <div className="rounded-xl bg-white p-2.5 text-emerald-700 shadow-sm">
                            <UserRound className="h-5 w-5" />
                        </div>

                        <div>
                            <h3 className="font-semibold text-emerald-950">
                                {note.patientName}
                            </h3>

                            <p className="mt-1 text-sm text-emerald-800">
                                {note.patientEmail}
                            </p>

                            <p className="mt-2 text-sm capitalize text-emerald-700">
                                {formatCalendarDate(
                                    note.scheduledDate
                                )}{" "}
                                · {note.startTime} a{" "}
                                {note.endTime}
                            </p>
                        </div>
                    </div>

                    <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-2 text-sm font-medium text-emerald-800">
                        <ShieldCheck className="h-4 w-4" />

                        Nota cerrada
                    </div>
                </div>
            </div>

            <div className="mt-5 grid gap-4">
                <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                        Motivo de consulta
                    </h3>

                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-800">
                        {note.reason}
                    </p>
                </article>

                <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                        Diagnóstico
                    </h3>

                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-800">
                        {note.diagnosis}
                    </p>
                </article>

                <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                        Tratamiento
                    </h3>

                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-800">
                        {note.treatment ||
                            "Sin tratamiento registrado."}
                    </p>
                </article>

                <div className="grid gap-4 xl:grid-cols-2">
                    <article className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
                        <div className="flex items-center gap-2 text-blue-800">
                            <Pill className="h-5 w-5" />

                            <h3 className="font-semibold">
                                Receta
                            </h3>
                        </div>

                        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-blue-950">
                            {note.prescriptionText ||
                                "Sin receta registrada."}
                        </p>
                    </article>

                    <article className="rounded-2xl border border-violet-200 bg-violet-50 p-5">
                        <h3 className="font-semibold text-violet-800">
                            Indicaciones
                        </h3>

                        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-violet-950">
                            {note.instructionsText ||
                                "Sin indicaciones registradas."}
                        </p>
                    </article>
                </div>
            </div>
        </section>
    );
}

export default function MedicalNotePanel({
    appointment,
    note,
}: MedicalNotePanelProps) {
    const [state, formAction, pending] =
        useActionState(
            createMedicalNoteAction,
            initialActionState
        );

    if (note) {
        return (
            <ExistingMedicalNote
                note={note}
            />
        );
    }

    return (
        <section
            id="medical-note"
            className="mt-10 scroll-mt-6 border-t border-slate-200 pt-10"
        >
            <div className="flex items-start gap-3">
                <div className="rounded-xl bg-blue-50 p-2.5 text-blue-700">
                    <ClipboardPlus className="h-5 w-5" />
                </div>

                <div>
                    <h2 className="text-xl font-semibold text-slate-950">
                        Crear nota médica
                    </h2>

                    <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
                        Registra el resultado clínico de la cita.
                        Después de guardar, la nota quedará en modo
                        de solo lectura.
                    </p>
                </div>
            </div>

            <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start gap-3">
                        <div className="rounded-xl bg-white p-2.5 text-blue-700 shadow-sm">
                            <UserRound className="h-5 w-5" />
                        </div>

                        <div>
                            <h3 className="font-semibold text-blue-950">
                                {appointment.patientName}
                            </h3>

                            <p className="mt-1 text-sm text-blue-800">
                                {appointment.patientEmail}
                            </p>

                            <p className="mt-2 text-sm capitalize text-blue-700">
                                {formatCalendarDate(
                                    appointment.scheduledDate
                                )}{" "}
                                · {appointment.startTime} a{" "}
                                {appointment.endTime}
                            </p>
                        </div>
                    </div>

                    <div className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-medium text-blue-800">
                        <ShieldCheck className="h-4 w-4" />

                        Cita propia verificada
                    </div>
                </div>
            </div>

            {appointment.status ===
                "CANCELLED" ? (
                <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800">
                    No se puede crear una nota médica para
                    una cita cancelada.
                </div>
            ) : (
                <form
                    action={formAction}
                    className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                    <input
                        type="hidden"
                        name="appointmentId"
                        value={appointment.id}
                    />

                    <div className="grid gap-5">
                        <label className="block">
                            <span className="text-sm font-medium text-slate-700">
                                Motivo de consulta
                            </span>

                            <textarea
                                name="reason"
                                rows={4}
                                required
                                minLength={3}
                                maxLength={500}
                                defaultValue={
                                    appointment.reason ?? ""
                                }
                                className="mt-2 w-full resize-y rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </label>

                        <label className="block">
                            <span className="text-sm font-medium text-slate-700">
                                Diagnóstico
                            </span>

                            <textarea
                                name="diagnosis"
                                rows={6}
                                required
                                minLength={3}
                                maxLength={3000}
                                placeholder="Impresión diagnóstica o diagnóstico clínico."
                                className="mt-2 w-full resize-y rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </label>

                        <label className="block">
                            <span className="text-sm font-medium text-slate-700">
                                Tratamiento
                            </span>

                            <textarea
                                name="treatment"
                                rows={5}
                                maxLength={3000}
                                placeholder="Plan terapéutico realizado o recomendado."
                                className="mt-2 w-full resize-y rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </label>

                        <div className="grid gap-5 xl:grid-cols-2">
                            <label className="block">
                                <span className="text-sm font-medium text-slate-700">
                                    Receta
                                </span>

                                <textarea
                                    name="prescriptionText"
                                    rows={6}
                                    maxLength={3000}
                                    placeholder="Medicamento, presentación, dosis, vía, frecuencia y duración."
                                    className="mt-2 w-full resize-y rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </label>

                            <label className="block">
                                <span className="text-sm font-medium text-slate-700">
                                    Indicaciones
                                </span>

                                <textarea
                                    name="instructionsText"
                                    rows={6}
                                    maxLength={3000}
                                    placeholder="Cuidados, signos de alarma, seguimiento y recomendaciones."
                                    className="mt-2 w-full resize-y rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </label>
                        </div>
                    </div>

                    {state.message ? (
                        <div
                            className={[
                                "mt-5 rounded-xl border px-4 py-3 text-sm",
                                state.ok
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                    : "border-red-200 bg-red-50 text-red-800",
                            ].join(" ")}
                        >
                            {state.message}
                        </div>
                    ) : null}

                    <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs leading-5 text-slate-500">
                            El médico y el paciente se resuelven
                            automáticamente desde la sesión y la cita.
                        </p>

                        <button
                            type="submit"
                            disabled={pending}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <Save className="h-4 w-4" />

                            {pending
                                ? "Registrando..."
                                : "Registrar nota médica"}
                        </button>
                    </div>
                </form>
            )}
        </section>
    );
}