"use client";

import {
    CalendarDays,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import {
    useMemo,
    useState,
} from "react";

import type {
    CalendarAppointment,
    CalendarDoctorOption,
    CalendarView,
} from "@/components/calendar/calendar.types";
import {
    addDays,
    addMonths,
    formatFullDate,
    formatMonthTitle,
    formatWeekday,
    getAppointmentsByDate,
    getMonthDays,
    getWeekDays,
    startOfWeek,
} from "@/components/calendar/calendar.utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

type AppointmentCalendarProps = {
    appointments: CalendarAppointment[];
    doctors: CalendarDoctorOption[];
    onAppointmentSelect?: (
        appointment: CalendarAppointment
    ) => void;
};

const STATUS_LABELS = {
    SCHEDULED: "Programada",
    CANCELLED: "Cancelada",
    COMPLETED: "Completada",
} as const;

function getAppointmentClasses(
    appointment: CalendarAppointment
): string {
    if (
        appointment.status ===
        "COMPLETED"
    ) {
        return "border-secondary-border bg-secondary-soft text-secondary";
    }

    if (
        appointment.status ===
        "CANCELLED"
    ) {
        return "border-danger-border bg-danger-soft text-danger";
    }

    return "border-primary-border bg-primary-soft text-primary";
}

function getStatusVariant(
    appointment: CalendarAppointment
):
    | "success"
    | "danger"
    | "primary" {
    if (
        appointment.status ===
        "COMPLETED"
    ) {
        return "success";
    }

    if (
        appointment.status ===
        "CANCELLED"
    ) {
        return "danger";
    }

    return "primary";
}

export function AppointmentCalendar({
    appointments,
    doctors,
    onAppointmentSelect,
}: AppointmentCalendarProps) {
    const [view, setView] =
        useState<CalendarView>("WEEK");

    const [referenceDate, setReferenceDate] =
        useState(() => new Date());

    const [doctorFilter, setDoctorFilter] =
        useState("ALL");

    const filteredAppointments =
        useMemo(() => {
            if (doctorFilter === "ALL") {
                return appointments;
            }

            return appointments.filter(
                (appointment) =>
                    appointment.doctorId ===
                    doctorFilter
            );
        }, [
            appointments,
            doctorFilter,
        ]);

    const appointmentsByDate =
        useMemo(
            () =>
                getAppointmentsByDate(
                    filteredAppointments
                ),
            [filteredAppointments]
        );

    const weekDays = useMemo(
        () =>
            getWeekDays(referenceDate),
        [referenceDate]
    );

    const monthDays = useMemo(
        () =>
            getMonthDays(referenceDate),
        [referenceDate]
    );

    const title =
        view === "WEEK"
            ? (() => {
                const weekStart =
                    startOfWeek(
                        referenceDate
                    );
                const weekEnd = addDays(
                    weekStart,
                    6
                );

                const startText =
                    new Intl.DateTimeFormat(
                        "es-MX",
                        {
                            day: "numeric",
                            month: "short",
                        }
                    ).format(weekStart);

                const endText =
                    new Intl.DateTimeFormat(
                        "es-MX",
                        {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                        }
                    ).format(weekEnd);

                return `${startText} – ${endText}`;
            })()
            : formatMonthTitle(
                referenceDate
            );

    function goPrevious(): void {
        setReferenceDate(
            (currentDate) =>
                view === "WEEK"
                    ? addDays(
                        currentDate,
                        -7
                    )
                    : addMonths(
                        currentDate,
                        -1
                    )
        );
    }

    function goNext(): void {
        setReferenceDate(
            (currentDate) =>
                view === "WEEK"
                    ? addDays(
                        currentDate,
                        7
                    )
                    : addMonths(
                        currentDate,
                        1
                    )
        );
    }

    function goToday(): void {
        setReferenceDate(new Date());
    }

    return (
        <div className="flex flex-col gap-5">
            <Card>
                <CardContent className="flex flex-col gap-4">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.15em] text-primary">
                                Agenda clínica
                            </p>

                            <h3 className="mt-2 text-xl font-bold tracking-tight text-foreground">
                                {title}
                            </h3>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                            <div className="min-w-60">
                                <label
                                    htmlFor="calendar-doctor"
                                    className="mb-2 block text-sm font-semibold text-foreground"
                                >
                                    Médico
                                </label>

                                <Select
                                    id="calendar-doctor"
                                    value={
                                        doctorFilter
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setDoctorFilter(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                >
                                    <option value="ALL">
                                        Todos los médicos
                                    </option>

                                    {doctors.map(
                                        (doctor) => (
                                            <option
                                                key={
                                                    doctor.id
                                                }
                                                value={
                                                    doctor.id
                                                }
                                            >
                                                {
                                                    doctor.name
                                                }
                                                {doctor.specialty
                                                    ? ` · ${doctor.specialty}`
                                                    : ""}
                                            </option>
                                        )
                                    )}
                                </Select>
                            </div>

                            <div className="flex rounded-xl border border-border bg-surface-muted p-1">
                                <Button
                                    type="button"
                                    variant={
                                        view ===
                                            "WEEK"
                                            ? "primary"
                                            : "ghost"
                                    }
                                    size="sm"
                                    onClick={() =>
                                        setView(
                                            "WEEK"
                                        )
                                    }
                                >
                                    Semana
                                </Button>

                                <Button
                                    type="button"
                                    variant={
                                        view ===
                                            "MONTH"
                                            ? "primary"
                                            : "ghost"
                                    }
                                    size="sm"
                                    onClick={() =>
                                        setView(
                                            "MONTH"
                                        )
                                    }
                                >
                                    Mes
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={goToday}
                        >
                            <CalendarDays className="size-4" />
                            Hoy
                        </Button>

                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                aria-label={
                                    view === "WEEK"
                                        ? "Semana anterior"
                                        : "Mes anterior"
                                }
                                onClick={
                                    goPrevious
                                }
                            >
                                <ChevronLeft className="size-5" />
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                aria-label={
                                    view === "WEEK"
                                        ? "Semana siguiente"
                                        : "Mes siguiente"
                                }
                                onClick={goNext}
                            >
                                <ChevronRight className="size-5" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {view === "WEEK" ? (
                <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[var(--shadow-sm)]">
                    <div className="grid min-w-[980px] grid-cols-7 border-b border-border bg-surface-muted">
                        {weekDays.map((day) => (
                            <div
                                key={day.dateKey}
                                className="border-r border-border px-3 py-4 text-center last:border-r-0"
                            >
                                <p className="text-xs font-bold uppercase tracking-[0.1em] text-foreground-muted">
                                    {formatWeekday(
                                        day.date
                                    )}
                                </p>

                                <div
                                    className={cn(
                                        "mx-auto mt-2 flex size-9 items-center justify-center rounded-xl text-sm font-bold",
                                        day.isToday
                                            ? "bg-primary text-white"
                                            : "text-foreground"
                                    )}
                                >
                                    {day.dayNumber}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="overflow-x-auto">
                        <div className="grid min-h-[520px] min-w-[980px] grid-cols-7">
                            {weekDays.map((day) => {
                                const dayAppointments =
                                    appointmentsByDate.get(
                                        day.dateKey
                                    ) ?? [];

                                return (
                                    <div
                                        key={
                                            day.dateKey
                                        }
                                        className="border-r border-border p-2 last:border-r-0"
                                    >
                                        <div className="flex flex-col gap-2">
                                            {dayAppointments.map(
                                                (
                                                    appointment
                                                ) => (
                                                    <button
                                                        key={
                                                            appointment.id
                                                        }
                                                        type="button"
                                                        onClick={() =>
                                                            onAppointmentSelect?.(
                                                                appointment
                                                            )
                                                        }
                                                        className={cn(
                                                            "w-full rounded-xl border p-3 text-left transition hover:-translate-y-0.5 hover:shadow-sm",
                                                            getAppointmentClasses(
                                                                appointment
                                                            )
                                                        )}
                                                    >
                                                        <p className="text-xs font-bold">
                                                            {
                                                                appointment.startTime
                                                            }
                                                            {" – "}
                                                            {
                                                                appointment.endTime
                                                            }
                                                        </p>

                                                        <p className="mt-1 line-clamp-2 text-sm font-semibold">
                                                            {
                                                                appointment.patientName
                                                            }
                                                        </p>

                                                        <p className="mt-1 line-clamp-1 text-xs opacity-75">
                                                            {
                                                                appointment.doctorName
                                                            }
                                                        </p>
                                                    </button>
                                                )
                                            )}

                                            {dayAppointments.length ===
                                                0 ? (
                                                <div className="flex min-h-20 items-center justify-center rounded-xl border border-dashed border-border text-center text-xs text-foreground-muted">
                                                    Sin citas
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[var(--shadow-sm)]">
                    <div className="grid grid-cols-7 border-b border-border bg-surface-muted">
                        {weekDays.map((day) => (
                            <div
                                key={
                                    day.dateKey
                                }
                                className="px-2 py-3 text-center text-xs font-bold uppercase tracking-[0.08em] text-foreground-muted"
                            >
                                {formatWeekday(
                                    day.date
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="grid min-w-[760px] grid-cols-7">
                        {monthDays.map((day) => {
                            const dayAppointments =
                                appointmentsByDate.get(
                                    day.dateKey
                                ) ?? [];

                            const visibleAppointments =
                                dayAppointments.slice(
                                    0,
                                    3
                                );

                            const remainingCount =
                                dayAppointments.length -
                                visibleAppointments.length;

                            return (
                                <div
                                    key={
                                        day.dateKey
                                    }
                                    className={cn(
                                        "min-h-36 border-b border-r border-border p-2",
                                        !day.isCurrentMonth &&
                                        "bg-surface-muted/50"
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "flex size-8 items-center justify-center rounded-lg text-xs font-bold",
                                            day.isToday
                                                ? "bg-primary text-white"
                                                : day.isCurrentMonth
                                                    ? "text-foreground"
                                                    : "text-foreground-muted"
                                        )}
                                        title={formatFullDate(
                                            day.dateKey
                                        )}
                                    >
                                        {
                                            day.dayNumber
                                        }
                                    </div>

                                    <div className="mt-2 space-y-1.5">
                                        {visibleAppointments.map(
                                            (
                                                appointment
                                            ) => (
                                                <button
                                                    key={
                                                        appointment.id
                                                    }
                                                    type="button"
                                                    onClick={() =>
                                                        onAppointmentSelect?.(
                                                            appointment
                                                        )
                                                    }
                                                    className={cn(
                                                        "block w-full truncate rounded-lg border px-2 py-1.5 text-left text-[0.7rem] font-semibold",
                                                        getAppointmentClasses(
                                                            appointment
                                                        )
                                                    )}
                                                    title={`${appointment.startTime} · ${appointment.patientName}`}
                                                >
                                                    {
                                                        appointment.startTime
                                                    }{" "}
                                                    {
                                                        appointment.patientName
                                                    }
                                                </button>
                                            )
                                        )}

                                        {remainingCount >
                                            0 ? (
                                            <p className="px-1 text-xs font-semibold text-foreground-muted">
                                                +
                                                {
                                                    remainingCount
                                                }{" "}
                                                citas
                                            </p>
                                        ) : null}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <Card>
                <CardContent className="grid gap-3 sm:grid-cols-3">
                    {(
                        [
                            "SCHEDULED",
                            "COMPLETED",
                            "CANCELLED",
                        ] as const
                    ).map((status) => {
                        const exampleAppointment =
                            {
                                status,
                            } as CalendarAppointment;

                        return (
                            <div
                                key={status}
                                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface-muted px-4 py-3"
                            >
                                <div className="flex items-center gap-2">
                                    <div
                                        className={cn(
                                            "size-3 rounded-full border",
                                            getAppointmentClasses(
                                                exampleAppointment
                                            )
                                        )}
                                    />

                                    <span className="text-sm font-medium text-foreground">
                                        {
                                            STATUS_LABELS[
                                            status
                                            ]
                                        }
                                    </span>
                                </div>

                                <Badge
                                    variant={getStatusVariant(
                                        exampleAppointment
                                    )}
                                >
                                    {
                                        filteredAppointments.filter(
                                            (
                                                appointment
                                            ) =>
                                                appointment.status ===
                                                status
                                        ).length
                                    }
                                </Badge>
                            </div>
                        );
                    })}
                </CardContent>
            </Card>
        </div>
    );
}