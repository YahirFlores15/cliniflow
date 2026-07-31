"use client";

import {
    CalendarDays,
    ClipboardList,
    FileText,
    HeartPulse,
    UserRound,
} from "lucide-react";
import { useMemo, useState } from "react";
import type {
    PatientAppointmentDTO,
    PatientPortalDTO,
} from "@/shared/dtos/patient.dtos";
import PatientAppointmentCard from "./patient-appointment-card";
import PatientHistoryPanel from "./patient-history-panel";
import PatientProfilePanel from "./patient-profile-panel";

type PatientSection =
    | "APPOINTMENTS"
    | "HISTORY"
    | "PROFILE";

type PatientPanelProps = {
    portal: PatientPortalDTO;
};

function parseAppointmentDateTime(
    appointment: PatientAppointmentDTO
): Date | null {
    const value = new Date(
        `${appointment.scheduledDate}T${appointment.startTime}:00`
    );

    if (Number.isNaN(value.getTime())) {
        return null;
    }

    return value;
}

function sortAppointmentsAscending(
    appointments: PatientAppointmentDTO[]
): PatientAppointmentDTO[] {
    return [...appointments].sort((first, second) => {
        const firstDate = parseAppointmentDateTime(first);
        const secondDate = parseAppointmentDateTime(second);

        if (!firstDate || !secondDate) {
            return 0;
        }

        return firstDate.getTime() - secondDate.getTime();
    });
}

function formatPatientSex(
    sex: PatientPortalDTO["profile"]["sex"]
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

export default function PatientPanel({
    portal,
}: PatientPanelProps) {
    const [activeSection, setActiveSection] =
        useState<PatientSection>("APPOINTMENTS");

    const upcomingAppointments = useMemo(() => {
        const now = new Date();

        return sortAppointmentsAscending(
            portal.appointments.filter((appointment) => {
                if (appointment.status !== "SCHEDULED") {
                    return false;
                }

                const appointmentDate =
                    parseAppointmentDateTime(appointment);

                return Boolean(
                    appointmentDate &&
                    appointmentDate > now
                );
            })
        );
    }, [portal.appointments]);

    const historicalAppointments = useMemo(() => {
        const now = new Date();

        return portal.appointments.filter((appointment) => {
            if (appointment.status !== "SCHEDULED") {
                return true;
            }

            const appointmentDate =
                parseAppointmentDateTime(appointment);

            return Boolean(
                !appointmentDate ||
                appointmentDate <= now
            );
        });
    }, [portal.appointments]);

    const navigationItems: Array<{
        id: PatientSection;
        label: string;
        description: string;
        icon: typeof CalendarDays;
    }> = [
            {
                id: "APPOINTMENTS",
                label: "Próximas citas",
                description: "Consulta y administra tus citas",
                icon: CalendarDays,
            },
            {
                id: "HISTORY",
                label: "Historial médico",
                description: "Revisa consultas e indicaciones",
                icon: ClipboardList,
            },
            {
                id: "PROFILE",
                label: "Mi perfil",
                description: "Consulta tus datos personales",
                icon: UserRound,
            },
        ];

    return (
        <div className="space-y-8">
            <section className="overflow-hidden rounded-3xl border border-cyan-100 bg-gradient-to-br from-cyan-700 via-cyan-700 to-slate-900 text-white shadow-xl shadow-cyan-950/10">
                <div className="grid gap-8 px-6 py-8 lg:grid-cols-[1fr_auto] lg:px-10 lg:py-10">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-100">
                            Portal del paciente
                        </p>

                        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                            Bienvenido, {portal.profile.name}
                        </h1>

                        <p className="mt-3 max-w-2xl text-sm leading-6 text-cyan-50 sm:text-base">
                            Consulta tus citas, revisa la
                            información registrada durante tus
                            consultas y mantén actualizados tus
                            datos de contacto.
                        </p>
                    </div>

                    <div className="flex items-center">
                        <div className="rounded-3xl border border-white/20 bg-white/10 p-5 backdrop-blur">
                            <HeartPulse
                                aria-hidden="true"
                                className="h-12 w-12 text-cyan-100"
                            />
                        </div>
                    </div>
                </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-500">
                            Próximas citas
                        </p>

                        <CalendarDays
                            aria-hidden="true"
                            className="h-5 w-5 text-cyan-700"
                        />
                    </div>

                    <p className="mt-3 text-3xl font-bold text-slate-950">
                        {portal.summary.upcomingAppointments}
                    </p>
                </article>

                <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-500">
                            Consultas completadas
                        </p>

                        <ClipboardList
                            aria-hidden="true"
                            className="h-5 w-5 text-emerald-700"
                        />
                    </div>

                    <p className="mt-3 text-3xl font-bold text-slate-950">
                        {portal.summary.completedAppointments}
                    </p>
                </article>

                <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-500">
                            Citas canceladas
                        </p>

                        <CalendarDays
                            aria-hidden="true"
                            className="h-5 w-5 text-rose-700"
                        />
                    </div>

                    <p className="mt-3 text-3xl font-bold text-slate-950">
                        {portal.summary.cancelledAppointments}
                    </p>
                </article>

                <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-500">
                            Notas médicas
                        </p>

                        <FileText
                            aria-hidden="true"
                            className="h-5 w-5 text-violet-700"
                        />
                    </div>

                    <p className="mt-3 text-3xl font-bold text-slate-950">
                        {portal.summary.medicalNotes}
                    </p>
                </article>
            </section>

            <section className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
                <aside className="self-start rounded-3xl border border-slate-200 bg-white p-3 shadow-sm xl:sticky xl:top-6">
                    <nav
                        aria-label="Navegación del portal del paciente"
                        className="space-y-2"
                    >
                        {navigationItems.map((item) => {
                            const Icon = item.icon;
                            const isActive =
                                activeSection === item.id;

                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() =>
                                        setActiveSection(item.id)
                                    }
                                    className={`flex w-full items-start gap-3 rounded-2xl px-4 py-4 text-left transition ${isActive
                                            ? "bg-cyan-700 text-white shadow-md shadow-cyan-900/10"
                                            : "text-slate-700 hover:bg-slate-100"
                                        }`}
                                >
                                    <Icon
                                        aria-hidden="true"
                                        className={`mt-0.5 h-5 w-5 shrink-0 ${isActive
                                                ? "text-cyan-100"
                                                : "text-slate-500"
                                            }`}
                                    />

                                    <span>
                                        <span className="block text-sm font-semibold">
                                            {item.label}
                                        </span>

                                        <span
                                            className={`mt-1 block text-xs leading-5 ${isActive
                                                    ? "text-cyan-100"
                                                    : "text-slate-500"
                                                }`}
                                        >
                                            {item.description}
                                        </span>
                                    </span>
                                </button>
                            );
                        })}
                    </nav>

                    <div className="mt-3 rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Datos registrados
                        </p>

                        <dl className="mt-3 space-y-2 text-sm">
                            <div>
                                <dt className="text-slate-500">
                                    Sexo
                                </dt>
                                <dd className="font-medium text-slate-800">
                                    {formatPatientSex(
                                        portal.profile.sex
                                    )}
                                </dd>
                            </div>

                            <div>
                                <dt className="text-slate-500">
                                    Fecha de nacimiento
                                </dt>
                                <dd className="font-medium text-slate-800">
                                    {portal.profile.birthDate ??
                                        "No registrada"}
                                </dd>
                            </div>
                        </dl>
                    </div>
                </aside>

                <div className="min-w-0">
                    {activeSection === "APPOINTMENTS" ? (
                        <section className="space-y-5">
                            <header>
                                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">
                                    Agenda personal
                                </p>

                                <h2 className="mt-2 text-2xl font-bold text-slate-950">
                                    Próximas citas
                                </h2>

                                <p className="mt-2 text-sm leading-6 text-slate-600">
                                    Puedes cancelar o reagendar una
                                    cita mientras siga programada y
                                    todavía no haya comenzado.
                                </p>
                            </header>

                            {upcomingAppointments.length > 0 ? (
                                <div className="space-y-4">
                                    {upcomingAppointments.map(
                                        (appointment) => (
                                            <PatientAppointmentCard
                                                key={appointment.id}
                                                appointment={
                                                    appointment
                                                }
                                            />
                                        )
                                    )}
                                </div>
                            ) : (
                                <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
                                    <CalendarDays
                                        aria-hidden="true"
                                        className="mx-auto h-10 w-10 text-slate-400"
                                    />

                                    <h3 className="mt-4 font-semibold text-slate-900">
                                        No tienes próximas citas
                                    </h3>

                                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                                        Cuando recepción programe una
                                        nueva cita aparecerá en esta
                                        sección.
                                    </p>
                                </div>
                            )}
                        </section>
                    ) : null}

                    {activeSection === "HISTORY" ? (
                        <PatientHistoryPanel
                            appointments={
                                historicalAppointments
                            }
                            medicalRecord={
                                portal.medicalRecord
                            }
                            medicalNotes={portal.medicalNotes}
                        />
                    ) : null}

                    {activeSection === "PROFILE" ? (
                        <PatientProfilePanel
                            profile={portal.profile}
                            medicalRecord={
                                portal.medicalRecord
                            }
                        />
                    ) : null}
                </div>
            </section>
        </div>
    );
}