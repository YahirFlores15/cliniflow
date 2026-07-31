import { CalendarDays, CheckCircle2, CircleX, Clock3, FileText, Stethoscope, UserRound, } from "lucide-react";
import type { DoctorAgendaFilterInput, DoctorAppointmentStatus, } from "@/shared/schemas/doctor.schemas";
import type { DoctorAgendaDTO, DoctorAppointmentDTO, } from "@/shared/dtos/doctor.dtos";
import Link from "next/link";


type DoctorPanelProps = {
    agenda: DoctorAgendaDTO;
    filters: DoctorAgendaFilterInput;
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

function formatCalendarDate(date: string): string {
    const match =
        /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);

    if (!match) {
        return date;
    }

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);

    const parsedDate = new Date(
        year,
        month - 1,
        day
    );

    return new Intl.DateTimeFormat("es-MX", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
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

    let age = today.getFullYear() - birthYear;

    const hasNotHadBirthday =
        today.getMonth() + 1 < birthMonth ||
        (today.getMonth() + 1 === birthMonth &&
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
                                {appointment.patientName}
                            </h3>

                            <p className="mt-1 text-sm text-slate-600">
                                {appointment.patientEmail}
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
                                    <span>{patientAge}</span>
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
        </div>
    );
}