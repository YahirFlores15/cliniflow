"use client";

import { useActionState } from "react";
import {
    HeartPulse,
    Save,
    ShieldCheck,
    UserRound,
} from "lucide-react";

import {
    saveMedicalRecordAction,
    type DoctorActionState,
} from "@/server/modules/doctor/doctor.actions";
import type {
    MedicalRecordDTO,
} from "@/shared/dtos/doctor.dtos";

type MedicalRecordPanelProps = {
    record: MedicalRecordDTO;
};

const initialActionState: DoctorActionState = {
    ok: false,
    message: "",
};

function formatPatientAge(
    birthDate: string | null
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

    const birthYear = Number(match[1]);
    const birthMonth = Number(match[2]);
    const birthDay = Number(match[3]);

    const today = new Date();

    let age =
        today.getFullYear() - birthYear;

    const birthdayHasNotPassed =
        today.getMonth() + 1 < birthMonth ||
        (today.getMonth() + 1 ===
            birthMonth &&
            today.getDate() < birthDay);

    if (birthdayHasNotPassed) {
        age -= 1;
    }

    return `${age} años`;
}

export default function MedicalRecordPanel({
    record,
}: MedicalRecordPanelProps) {
    const [state, formAction, pending] =
        useActionState(
            saveMedicalRecordAction,
            initialActionState
        );

    const patientAge = formatPatientAge(
        record.patientBirthDate
    );

    return (
        <section
            id="medical-record"
            className="mt-10 scroll-mt-6 border-t border-slate-200 pt-10"
        >
            <div className="flex items-start gap-3">
                <div className="rounded-xl bg-violet-50 p-2.5 text-violet-700">
                    <HeartPulse className="h-5 w-5" />
                </div>

                <div>
                    <h2 className="text-xl font-semibold text-slate-950">
                        Expediente clínico
                    </h2>

                    <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
                        Información clínica permanente del
                        paciente seleccionado. No corresponde
                        a una consulta específica ni sustituye
                        la nota médica.
                    </p>
                </div>
            </div>

            <div className="mt-5 rounded-2xl border border-violet-200 bg-violet-50 p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start gap-3">
                        <div className="rounded-xl bg-white p-2.5 text-violet-700 shadow-sm">
                            <UserRound className="h-5 w-5" />
                        </div>

                        <div>
                            <h3 className="font-semibold text-violet-950">
                                {record.patientName}
                            </h3>

                            <p className="mt-1 text-sm text-violet-800">
                                {record.patientEmail}
                            </p>

                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-violet-700">
                                {record.patientPhone ? (
                                    <span>
                                        {
                                            record.patientPhone
                                        }
                                    </span>
                                ) : null}

                                {patientAge ? (
                                    <span>
                                        {patientAge}
                                    </span>
                                ) : null}
                            </div>
                        </div>
                    </div>

                    <div className="inline-flex items-center gap-2 rounded-xl border border-violet-200 bg-white px-4 py-2 text-sm font-medium text-violet-800">
                        <ShieldCheck className="h-4 w-4" />

                        Acceso mediante cita médica
                    </div>
                </div>
            </div>

            <form
                key={`${record.patientId}-${record.updatedAt ?? "new"}`}
                action={formAction}
                className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
                <input
                    type="hidden"
                    name="patientId"
                    value={record.patientId}
                />

                <div className="grid gap-5 xl:grid-cols-2">
                    <label className="block">
                        <span className="text-sm font-medium text-slate-700">
                            Alergias
                        </span>

                        <textarea
                            name="allergies"
                            rows={5}
                            maxLength={2000}
                            defaultValue={
                                record.allergies ?? ""
                            }
                            placeholder="Medicamentos, alimentos, sustancias o sin alergias conocidas."
                            className="mt-2 w-full resize-y rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                        />
                    </label>

                    <label className="block">
                        <span className="text-sm font-medium text-slate-700">
                            Enfermedades crónicas
                        </span>

                        <textarea
                            name="chronicDiseases"
                            rows={5}
                            maxLength={2000}
                            defaultValue={
                                record.chronicDiseases ??
                                ""
                            }
                            placeholder="Diabetes, hipertensión, asma u otros antecedentes permanentes."
                            className="mt-2 w-full resize-y rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                        />
                    </label>

                    <label className="block xl:col-span-2">
                        <span className="text-sm font-medium text-slate-700">
                            Medicamentos actuales
                        </span>

                        <textarea
                            name="currentMedications"
                            rows={4}
                            maxLength={2000}
                            defaultValue={
                                record.currentMedications ??
                                ""
                            }
                            placeholder="Nombre, dosis y frecuencia cuando se conozcan."
                            className="mt-2 w-full resize-y rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                        />
                    </label>

                    <label className="block">
                        <span className="text-sm font-medium text-slate-700">
                            Contacto de emergencia
                        </span>

                        <input
                            type="text"
                            name="emergencyContactName"
                            maxLength={120}
                            defaultValue={
                                record.emergencyContactName ??
                                ""
                            }
                            placeholder="Nombre completo"
                            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                        />
                    </label>

                    <label className="block">
                        <span className="text-sm font-medium text-slate-700">
                            Teléfono de emergencia
                        </span>

                        <input
                            type="text"
                            name="emergencyContactPhone"
                            maxLength={30}
                            defaultValue={
                                record.emergencyContactPhone ??
                                ""
                            }
                            placeholder="Número telefónico"
                            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                        />
                    </label>
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
                        Los campos vacíos se guardarán sin
                        información registrada.
                    </p>

                    <button
                        type="submit"
                        disabled={pending}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <Save className="h-4 w-4" />

                        {pending
                            ? "Guardando..."
                            : "Guardar expediente"}
                    </button>
                </div>
            </form>
        </section>
    );
}