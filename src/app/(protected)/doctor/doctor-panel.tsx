"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
    Ban,
    CalendarDays,
    CheckCircle2,
    CircleX,
    Clock3,
    FileText,
    Save,
    Stethoscope,
    Trash2,
    UserRound,
} from "lucide-react";

import {
    createDoctorBlockAction,
    deleteDoctorBlockAction,
    saveDoctorScheduleAction,
    type DoctorActionState,
} from "@/server/modules/doctor/doctor.actions";
import type {
    DoctorAgendaDTO,
    DoctorAppointmentDTO,
    DoctorBlockDTO,
    DoctorScheduleDTO,
} from "@/shared/dtos/doctor.dtos";
import type {
    DoctorAgendaFilterInput,
    DoctorAppointmentStatus,
} from "@/shared/schemas/doctor.schemas";

type DoctorPanelProps = {
    agenda: DoctorAgendaDTO;
    filters: DoctorAgendaFilterInput;
};

type WeekdayConfiguration = {
    value: number;
    label: string;
};

const weekdays: WeekdayConfiguration[] = [
    { value: 1, label: "Lunes" },
    { value: 2, label: "Martes" },
    { value: 3, label: "Miércoles" },
    { value: 4, label: "Jueves" },
    { value: 5, label: "Viernes" },
    { value: 6, label: "Sábado" },
    { value: 7, label: "Domingo" },
];

const initialActionState: DoctorActionState = {
    ok: false,
    message: "",
};

const statusLabels: Record<
    DoctorAppointmentStatus,
    string
> = {
    SCHEDULED: "Programada",
    CANCELLED: "Cancelada",
    COMPLETED: "Completada",
};

const statusClasses: Record<
    DoctorAppointmentStatus,
    string
> = {
    SCHEDULED:
        "border-cyan-200 bg-cyan-50 text-cyan-800",
    CANCELLED:
        "border-red-200 bg-red-50 text-red-800",
    COMPLETED:
        "border-emerald-200 bg-emerald-50 text-emerald-800",
};

function getLocalCalendarDate(): string {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");
    const day = String(date.getDate()).padStart(
        2,
        "0"
    );

    return `${year}-${month}-${day}`;
}

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

    return new Intl.DateTimeFormat("es-MX", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
    }).format(parsedDate);
}

function formatDateTime(
    dateTime: string
): string {
    const match =
        /^(\d{4})-(\d{2})-(\d{2})T([01]\d|2[0-3]):([0-5]\d)$/.exec(
            dateTime
        );

    if (!match) {
        return dateTime;
    }

    const parsedDate = new Date(
        Number(match[1]),
        Number(match[2]) - 1,
        Number(match[3]),
        Number(match[4]),
        Number(match[5])
    );

    return new Intl.DateTimeFormat("es-MX", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(parsedDate);
}

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

    const hasNotHadBirthday =
        today.getMonth() + 1 < birthMonth ||
        (today.getMonth() + 1 ===
            birthMonth &&
            today.getDate() < birthDay);

    if (hasNotHadBirthday) {
        age -= 1;
    }

    return `${age} años`;
}

function AppointmentCard({
    appointment,
}: {
    appointment: DoctorAppointmentDTO;
}) {
    const patientAge = formatPatientAge(
        appointment.patientBirthDate
    );

    return (
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <span
                            className={[
                                "inline-flex rounded-full border px-3 py-1 text-xs font-semibold",
                                statusClasses[
                                appointment.status
                                ],
                            ].join(" ")}
                        >
                            {
                                statusLabels[
                                appointment.status
                                ]
                            }
                        </span>

                        {appointment.hasMedicalNote ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-800">
                                <FileText className="h-3.5 w-3.5" />
                                Nota registrada
                            </span>
                        ) : null}
                    </div>

                    <div className="mt-4 flex items-start gap-3">
                        <div className="rounded-xl bg-slate-100 p-2.5 text-slate-700">
                            <UserRound className="h-5 w-5" />
                        </div>

                        <div className="min-w-0">
                            <h3 className="truncate text-lg font-semibold text-slate-950">
                                {
                                    appointment.patientName
                                }
                            </h3>

                            <p className="mt-1 text-sm text-slate-600">
                                {
                                    appointment.patientEmail
                                }
                            </p>

                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                                {appointment.patientPhone ? (
                                    <span>
                                        {
                                            appointment.patientPhone
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
                </div>

                <div className="shrink-0 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                    <div className="flex items-center gap-2 font-medium">
                        <CalendarDays className="h-4 w-4" />

                        <span className="capitalize">
                            {formatCalendarDate(
                                appointment.scheduledDate
                            )}
                        </span>
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                        <Clock3 className="h-4 w-4" />

                        <span>
                            {appointment.startTime} a{" "}
                            {appointment.endTime}
                        </span>

                        <span className="text-slate-400">
                            ·
                        </span>

                        <span>
                            {
                                appointment.durationMinutes
                            }{" "}
                            min
                        </span>
                    </div>
                </div>
            </div>

            <div className="mt-5 border-t border-slate-100 pt-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Motivo de consulta
                </p>

                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                    {appointment.reason ||
                        "Sin motivo registrado."}
                </p>

                {appointment.status ===
                    "CANCELLED" &&
                    appointment.cancellationReason ? (
                    <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3">
                        <p className="text-xs font-semibold uppercase tracking-wider text-red-700">
                            Motivo de cancelación
                        </p>

                        <p className="mt-1 text-sm text-red-800">
                            {
                                appointment.cancellationReason
                            }
                        </p>
                    </div>
                ) : null}
            </div>
        </article>
    );
}

function ScheduleDayForm({
    weekday,
    schedule,
}: {
    weekday: WeekdayConfiguration;
    schedule: DoctorScheduleDTO | null;
}) {
    const [state, formAction, pending] =
        useActionState(
            saveDoctorScheduleAction,
            initialActionState
        );

    return (
        <form
            action={formAction}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
            <input
                type="hidden"
                name="weekday"
                value={weekday.value}
            />

            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h3 className="font-semibold text-slate-950">
                        {weekday.label}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                        Configura la disponibilidad de este
                        día.
                    </p>
                </div>

                <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                    <input
                        type="checkbox"
                        name="isActive"
                        defaultChecked={
                            schedule?.isActive ?? false
                        }
                        className="h-4 w-4 rounded border-slate-300 text-cyan-700 focus:ring-cyan-500"
                    />

                    Día activo
                </label>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <label className="block">
                    <span className="text-sm font-medium text-slate-700">
                        Inicio
                    </span>

                    <input
                        type="time"
                        name="startTime"
                        required
                        defaultValue={
                            schedule?.startTime ??
                            "08:00"
                        }
                        className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                    />
                </label>

                <label className="block">
                    <span className="text-sm font-medium text-slate-700">
                        Finalización
                    </span>

                    <input
                        type="time"
                        name="endTime"
                        required
                        defaultValue={
                            schedule?.endTime ??
                            "16:00"
                        }
                        className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                    />
                </label>

                <label className="block">
                    <span className="text-sm font-medium text-slate-700">
                        Duración
                    </span>

                    <select
                        name="appointmentDurationMinutes"
                        defaultValue={
                            schedule
                                ?.appointmentDurationMinutes ??
                            30
                        }
                        className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                    >
                        <option value="30">
                            30 minutos
                        </option>

                        <option value="60">
                            60 minutos
                        </option>
                    </select>
                </label>
            </div>

            {state.message ? (
                <div
                    className={[
                        "mt-4 rounded-xl border px-4 py-3 text-sm",
                        state.ok
                            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                            : "border-red-200 bg-red-50 text-red-800",
                    ].join(" ")}
                >
                    {state.message}
                </div>
            ) : null}

            <div className="mt-5 flex justify-end">
                <button
                    type="submit"
                    disabled={pending}
                    className="inline-flex items-center gap-2 rounded-xl bg-cyan-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <Save className="h-4 w-4" />

                    {pending
                        ? "Guardando..."
                        : "Guardar horario"}
                </button>
            </div>
        </form>
    );
}

function DeleteBlockForm({
    block,
}: {
    block: DoctorBlockDTO;
}) {
    const [state, formAction, pending] =
        useActionState(
            deleteDoctorBlockAction,
            initialActionState
        );

    return (
        <form action={formAction}>
            <input
                type="hidden"
                name="blockId"
                value={block.id}
            />

            <button
                type="submit"
                disabled={pending}
                className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
                <Trash2 className="h-4 w-4" />

                {pending
                    ? "Eliminando..."
                    : "Eliminar"}
            </button>

            {state.message ? (
                <p
                    className={[
                        "mt-2 max-w-sm text-xs",
                        state.ok
                            ? "text-emerald-700"
                            : "text-red-700",
                    ].join(" ")}
                >
                    {state.message}
                </p>
            ) : null}
        </form>
    );
}

function DoctorBlockCard({
    block,
}: {
    block: DoctorBlockDTO;
}) {
    return (
        <article className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <div className="flex items-center gap-2 text-amber-800">
                        <Ban className="h-5 w-5" />

                        <h3 className="font-semibold">
                            Horario bloqueado
                        </h3>
                    </div>

                    <div className="mt-4 space-y-1 text-sm text-amber-950">
                        <p>
                            <span className="font-semibold">
                                Inicio:
                            </span>{" "}
                            {formatDateTime(
                                block.startDateTime
                            )}
                        </p>

                        <p>
                            <span className="font-semibold">
                                Final:
                            </span>{" "}
                            {formatDateTime(
                                block.endDateTime
                            )}
                        </p>
                    </div>

                    <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-amber-900">
                        {block.reason ||
                            "Sin motivo registrado."}
                    </p>
                </div>

                <DeleteBlockForm
                    block={block}
                />
            </div>
        </article>
    );
}

function DoctorBlocksSection({
    blocks,
}: {
    blocks: DoctorBlockDTO[];
}) {
    const [state, formAction, pending] =
        useActionState(
            createDoctorBlockAction,
            initialActionState
        );

    const today = getLocalCalendarDate();

    return (
        <section className="mt-10 border-t border-slate-200 pt-10">
            <div>
                <h2 className="text-xl font-semibold text-slate-950">
                    Bloqueos de disponibilidad
                </h2>

                <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
                    Bloquea periodos en los que no podrás
                    atender. Las citas programadas dentro
                    del rango se cancelarán
                    automáticamente.
                </p>
            </div>

            <form
                action={formAction}
                className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <label className="block">
                        <span className="text-sm font-medium text-slate-700">
                            Fecha inicial
                        </span>

                        <input
                            type="date"
                            name="startDate"
                            min={today}
                            required
                            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                        />
                    </label>

                    <label className="block">
                        <span className="text-sm font-medium text-slate-700">
                            Hora inicial
                        </span>

                        <input
                            type="time"
                            name="startTime"
                            required
                            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                        />
                    </label>

                    <label className="block">
                        <span className="text-sm font-medium text-slate-700">
                            Fecha final
                        </span>

                        <input
                            type="date"
                            name="endDate"
                            min={today}
                            required
                            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                        />
                    </label>

                    <label className="block">
                        <span className="text-sm font-medium text-slate-700">
                            Hora final
                        </span>

                        <input
                            type="time"
                            name="endTime"
                            required
                            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                        />
                    </label>
                </div>

                <label className="mt-4 block">
                    <span className="text-sm font-medium text-slate-700">
                        Motivo
                    </span>

                    <textarea
                        name="reason"
                        rows={3}
                        maxLength={500}
                        placeholder="Vacaciones, capacitación, asunto personal..."
                        className="mt-2 w-full resize-y rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                    />
                </label>

                {state.message ? (
                    <div
                        className={[
                            "mt-4 rounded-xl border px-4 py-3 text-sm",
                            state.ok
                                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                : "border-red-200 bg-red-50 text-red-800",
                        ].join(" ")}
                    >
                        {state.message}
                    </div>
                ) : null}

                <div className="mt-5 flex justify-end">
                    <button
                        type="submit"
                        disabled={pending}
                        className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <Ban className="h-4 w-4" />

                        {pending
                            ? "Creando bloqueo..."
                            : "Crear bloqueo"}
                    </button>
                </div>
            </form>

            <div className="mt-6">
                <h3 className="font-semibold text-slate-950">
                    Bloqueos vigentes y futuros
                </h3>

                {blocks.length === 0 ? (
                    <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
                        <Ban className="mx-auto h-8 w-8 text-slate-400" />

                        <p className="mt-3 text-sm text-slate-600">
                            No tienes bloqueos vigentes o
                            futuros.
                        </p>
                    </div>
                ) : (
                    <div className="mt-4 grid gap-4">
                        {blocks.map((block) => (
                            <DoctorBlockCard
                                key={block.id}
                                block={block}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

export default function DoctorPanel({
    agenda,
    filters,
}: DoctorPanelProps) {
    return (
        <div>
            <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-700">
                    Panel médico
                </p>

                <h1 className="mt-3 text-3xl font-bold text-slate-950">
                    Bienvenido, Dr.{" "}
                    {agenda.doctor.name}
                </h1>

                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm text-slate-600">
                    <span>
                        {agenda.doctor.specialty ||
                            "Especialidad no registrada"}
                    </span>

                    {agenda.doctor.licenseNumber ? (
                        <>
                            <span className="text-slate-300">
                                ·
                            </span>

                            <span>
                                Cédula{" "}
                                {
                                    agenda.doctor
                                        .licenseNumber
                                }
                            </span>
                        </>
                    ) : null}
                </div>
            </div>

            <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <article className="rounded-2xl border border-cyan-200 bg-cyan-50 p-5">
                    <CalendarDays className="h-5 w-5 text-cyan-700" />

                    <p className="mt-4 text-3xl font-bold text-cyan-950">
                        {
                            agenda.summary
                                .todayScheduled
                        }
                    </p>

                    <p className="mt-1 text-sm font-medium text-cyan-800">
                        Citas programadas hoy
                    </p>
                </article>

                <article className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
                    <Clock3 className="h-5 w-5 text-blue-700" />

                    <p className="mt-4 text-3xl font-bold text-blue-950">
                        {
                            agenda.summary
                                .upcomingScheduled
                        }
                    </p>

                    <p className="mt-1 text-sm font-medium text-blue-800">
                        Próximas citas
                    </p>
                </article>

                <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                    <CheckCircle2 className="h-5 w-5 text-emerald-700" />

                    <p className="mt-4 text-3xl font-bold text-emerald-950">
                        {agenda.summary.completed}
                    </p>

                    <p className="mt-1 text-sm font-medium text-emerald-800">
                        Citas completadas
                    </p>
                </article>

                <article className="rounded-2xl border border-red-200 bg-red-50 p-5">
                    <CircleX className="h-5 w-5 text-red-700" />

                    <p className="mt-4 text-3xl font-bold text-red-950">
                        {agenda.summary.cancelled}
                    </p>

                    <p className="mt-1 text-sm font-medium text-red-800">
                        Citas canceladas
                    </p>
                </article>
            </section>

            <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-cyan-50 p-2.5 text-cyan-700">
                        <Stethoscope className="h-5 w-5" />
                    </div>

                    <div>
                        <h2 className="font-semibold text-slate-950">
                            Filtrar agenda
                        </h2>

                        <p className="text-sm text-slate-600">
                            Consulta tus citas por fecha o
                            estado.
                        </p>
                    </div>
                </div>

                <form
                    method="get"
                    className="mt-5 grid gap-4 md:grid-cols-[1fr_1fr_auto_auto] md:items-end"
                >
                    <label className="block">
                        <span className="text-sm font-medium text-slate-700">
                            Fecha
                        </span>

                        <input
                            type="date"
                            name="date"
                            defaultValue={
                                filters.date ?? ""
                            }
                            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                        />
                    </label>

                    <label className="block">
                        <span className="text-sm font-medium text-slate-700">
                            Estado
                        </span>

                        <select
                            name="status"
                            defaultValue={
                                filters.status ?? ""
                            }
                            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                        >
                            <option value="">
                                Todos los estados
                            </option>

                            <option value="SCHEDULED">
                                Programadas
                            </option>

                            <option value="COMPLETED">
                                Completadas
                            </option>

                            <option value="CANCELLED">
                                Canceladas
                            </option>
                        </select>
                    </label>

                    <button
                        type="submit"
                        className="rounded-xl bg-cyan-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-800"
                    >
                        Aplicar filtros
                    </button>

                    <Link
                        href="/doctor"
                        className="rounded-xl border border-slate-300 px-5 py-2.5 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                        Limpiar
                    </Link>
                </form>
            </section>

            <section className="mt-8">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-slate-950">
                            Agenda
                        </h2>

                        <p className="mt-1 text-sm text-slate-600">
                            Solo se muestran citas asignadas
                            a tu perfil médico.
                        </p>
                    </div>

                    <p className="text-sm font-medium text-slate-500">
                        {agenda.appointments.length}{" "}
                        {agenda.appointments.length === 1
                            ? "resultado"
                            : "resultados"}
                    </p>
                </div>

                {agenda.appointments.length === 0 ? (
                    <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
                        <CalendarDays className="mx-auto h-8 w-8 text-slate-400" />

                        <h3 className="mt-4 font-semibold text-slate-800">
                            No hay citas para mostrar
                        </h3>

                        <p className="mt-2 text-sm text-slate-600">
                            No existen citas que coincidan
                            con los filtros seleccionados.
                        </p>
                    </div>
                ) : (
                    <div className="mt-5 grid gap-4">
                        {agenda.appointments.map(
                            (appointment) => (
                                <AppointmentCard
                                    key={appointment.id}
                                    appointment={
                                        appointment
                                    }
                                />
                            )
                        )}
                    </div>
                )}
            </section>

            <section className="mt-10 border-t border-slate-200 pt-10">
                <div>
                    <h2 className="text-xl font-semibold text-slate-950">
                        Horario semanal
                    </h2>

                    <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
                        Configura los días y horas en los que
                        el personal podrá programar citas.
                        No podrás desactivar o reducir un
                        horario si deja citas futuras fuera.
                    </p>
                </div>

                <div className="mt-5 grid gap-4 xl:grid-cols-2">
                    {weekdays.map((weekday) => {
                        const schedule =
                            agenda.schedules.find(
                                (item) =>
                                    item.weekday ===
                                    weekday.value
                            ) ?? null;

                        return (
                            <ScheduleDayForm
                                key={weekday.value}
                                weekday={weekday}
                                schedule={schedule}
                            />
                        );
                    })}
                </div>
            </section>

            <DoctorBlocksSection
                blocks={agenda.blocks}
            />
        </div>
    );
}