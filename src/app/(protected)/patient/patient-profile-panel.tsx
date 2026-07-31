"use client";

import {
    AlertCircle,
    CheckCircle2,
    Mail,
    MapPin,
    Phone,
    ShieldCheck,
    UserRound,
} from "lucide-react";
import { useActionState } from "react";
import {
    updatePatientProfileAction,
    type PatientActionState,
} from "@/server/modules/patient/patient.actions";
import type {
    PatientMedicalRecordDTO,
    PatientProfileDTO,
} from "@/shared/dtos/patient.dtos";

type PatientProfilePanelProps = {
    profile: PatientProfileDTO;
    medicalRecord: PatientMedicalRecordDTO;
};

const initialState: PatientActionState = {
    ok: false,
    message: "",
};

function formatSex(
    sex: PatientProfileDTO["sex"]
): string {
    switch (sex) {
        case "MALE":
            return "Masculino";

        case "FEMALE":
            return "Femenino";

        case "OTHER":
            return "Otro";

        case "UNSPECIFIED":
            return "Sin especificar";

        default:
            return "No registrado";
    }
}

export default function PatientProfilePanel({
    profile,
    medicalRecord,
}: PatientProfilePanelProps) {
    const [state, formAction, isPending] = useActionState(
        updatePatientProfileAction,
        initialState
    );

    return (
        <section className="space-y-6">
            <header>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">
                    Información personal
                </p>

                <h2 className="mt-2 text-2xl font-bold text-slate-950">
                    Mi perfil
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                    Puedes actualizar tus datos de contacto. El
                    nombre, correo, fecha de nacimiento y datos
                    clínicos deben ser corregidos por personal
                    autorizado.
                </p>
            </header>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
                <form
                    action={formAction}
                    className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                    <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-cyan-50 p-3">
                            <UserRound
                                aria-hidden="true"
                                className="h-6 w-6 text-cyan-700"
                            />
                        </div>

                        <div>
                            <h3 className="font-semibold text-slate-950">
                                Datos de contacto
                            </h3>

                            <p className="text-sm text-slate-500">
                                Información utilizada por la clínica
                                para contactarte.
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 grid gap-5 sm:grid-cols-2">
                        <label className="block">
                            <span className="text-sm font-medium text-slate-700">
                                Nombre completo
                            </span>

                            <input
                                type="text"
                                value={profile.name}
                                readOnly
                                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-600 outline-none"
                            />
                        </label>

                        <label className="block">
                            <span className="text-sm font-medium text-slate-700">
                                Correo electrónico
                            </span>

                            <div className="relative mt-2">
                                <Mail
                                    aria-hidden="true"
                                    className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                                />

                                <input
                                    type="email"
                                    value={profile.email}
                                    readOnly
                                    className="w-full rounded-xl border border-slate-200 bg-slate-100 py-3 pl-11 pr-4 text-sm text-slate-600 outline-none"
                                />
                            </div>
                        </label>

                        <label className="block">
                            <span className="text-sm font-medium text-slate-700">
                                Teléfono
                            </span>

                            <div className="relative mt-2">
                                <Phone
                                    aria-hidden="true"
                                    className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                                />

                                <input
                                    name="phone"
                                    type="tel"
                                    required
                                    minLength={7}
                                    maxLength={30}
                                    defaultValue={
                                        profile.phone ?? ""
                                    }
                                    placeholder="Ej. 314 123 4567"
                                    className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-cyan-600 focus:ring-4 focus:ring-cyan-100"
                                />
                            </div>
                        </label>

                        <label className="block">
                            <span className="text-sm font-medium text-slate-700">
                                Fecha de nacimiento
                            </span>

                            <input
                                type="text"
                                value={
                                    profile.birthDate ??
                                    "No registrada"
                                }
                                readOnly
                                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-600 outline-none"
                            />
                        </label>

                        <label className="block sm:col-span-2">
                            <span className="text-sm font-medium text-slate-700">
                                Dirección
                            </span>

                            <div className="relative mt-2">
                                <MapPin
                                    aria-hidden="true"
                                    className="pointer-events-none absolute left-4 top-4 h-4 w-4 text-slate-400"
                                />

                                <textarea
                                    name="address"
                                    rows={4}
                                    maxLength={250}
                                    defaultValue={
                                        profile.address ?? ""
                                    }
                                    placeholder="Dirección actual"
                                    className="w-full resize-none rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-cyan-600 focus:ring-4 focus:ring-cyan-100"
                                />
                            </div>
                        </label>
                    </div>

                    {state.message ? (
                        <div
                            className={`mt-5 flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${state.ok
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
                    ) : null}

                    <div className="mt-6 flex justify-end">
                        <button
                            type="submit"
                            disabled={isPending}
                            className="rounded-xl bg-cyan-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isPending
                                ? "Guardando..."
                                : "Guardar cambios"}
                        </button>
                    </div>
                </form>

                <aside className="space-y-4">
                    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="rounded-2xl bg-slate-100 p-3">
                                <ShieldCheck
                                    aria-hidden="true"
                                    className="h-5 w-5 text-slate-700"
                                />
                            </div>

                            <h3 className="font-semibold text-slate-950">
                                Datos protegidos
                            </h3>
                        </div>

                        <dl className="mt-5 space-y-4 text-sm">
                            <div>
                                <dt className="text-slate-500">
                                    Sexo
                                </dt>
                                <dd className="mt-1 font-medium text-slate-900">
                                    {formatSex(profile.sex)}
                                </dd>
                            </div>

                            <div>
                                <dt className="text-slate-500">
                                    Estado de la cuenta
                                </dt>
                                <dd className="mt-1 font-medium text-emerald-700">
                                    {profile.isActive
                                        ? "Activa"
                                        : "Inactiva"}
                                </dd>
                            </div>
                        </dl>
                    </article>

                    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="font-semibold text-slate-950">
                            Contacto de emergencia
                        </h3>

                        <p className="mt-2 text-xs leading-5 text-slate-500">
                            Este dato forma parte del expediente
                            clínico y solo puede modificarlo un
                            médico autorizado.
                        </p>

                        <dl className="mt-5 space-y-4 text-sm">
                            <div>
                                <dt className="text-slate-500">
                                    Nombre
                                </dt>
                                <dd className="mt-1 font-medium text-slate-900">
                                    {medicalRecord.emergencyContactName ??
                                        "No registrado"}
                                </dd>
                            </div>

                            <div>
                                <dt className="text-slate-500">
                                    Teléfono
                                </dt>
                                <dd className="mt-1 font-medium text-slate-900">
                                    {medicalRecord.emergencyContactPhone ??
                                        "No registrado"}
                                </dd>
                            </div>
                        </dl>
                    </article>
                </aside>
            </div>
        </section>
    );
}