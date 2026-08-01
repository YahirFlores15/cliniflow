"use client";

import {
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Plus,
} from "lucide-react";
import {
    useEffect,
    useMemo,
    useState,
} from "react";

import type {
    CalendarAppointment,
    CalendarDoctorBlock,
    CalendarDoctorOption,
    CalendarDoctorSchedule,
    CalendarSlotSelection,
    CalendarView,
} from "@/components/calendar/calendar.types";
import {
    addDays,
    addMonths,
    createLocalDateTime,
    formatFullDate,
    formatMonthTitle,
    formatWeekday,
    getAppointmentsByDate,
    getIsoWeekday,
    getMonthDays,
    getWeekDays,
    minutesToTime,
    rangesOverlap,
    startOfWeek,
    timeToMinutes,
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
    schedules?: CalendarDoctorSchedule[];
    blocks?: CalendarDoctorBlock[];

    allowSlotSelection?: boolean;
    showDoctorFilter?: boolean;

    onAppointmentSelect?: (
        appointment: CalendarAppointment
    ) => void;

    onAvailableSlotSelect?: (
        selection: CalendarSlotSelection
    ) => void;
};

const STATUS_LABELS = {
    SCHEDULED: "Programada",
    CANCELLED: "Cancelada",
    COMPLETED: "Completada",
} as const;

const GRID_START_MINUTES =
    7 * 60;

const GRID_END_MINUTES =
    20 * 60;

const SLOT_MINUTES =
    30;

const SLOT_HEIGHT =
    44;

function getAppointmentClasses(
    appointment: Pick<
        CalendarAppointment,
        "status"
    >
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
    appointment: Pick<
        CalendarAppointment,
        "status"
    >
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
    schedules = [],
    blocks = [],
    allowSlotSelection = false,
    showDoctorFilter = true,
    onAppointmentSelect,
    onAvailableSlotSelect,
}: AppointmentCalendarProps) {
    const [
        view,
        setView,
    ] =
        useState<CalendarView>(
            "WEEK"
        );

    const [
        referenceDate,
        setReferenceDate,
    ] =
        useState(
            () => new Date()
        );

    const [
        doctorFilter,
        setDoctorFilter,
    ] =
        useState(
            doctors[0]?.id ??
            "ALL"
        );

    const [
        currentDateTime,
        setCurrentDateTime,
    ] =
        useState<Date | null>(
            null
        );

    useEffect(() => {
        const updateCurrentDateTime =
            (): void => {
                setCurrentDateTime(
                    new Date()
                );
            };

        updateCurrentDateTime();

        const intervalId =
            window.setInterval(
                updateCurrentDateTime,
                60_000
            );

        return () => {
            window.clearInterval(
                intervalId
            );
        };
    }, []);

    const effectiveDoctorFilter =
        showDoctorFilter
            ? doctorFilter
            : doctors[0]?.id ??
            "ALL";

    const filteredAppointments =
        useMemo(() => {
            if (
                effectiveDoctorFilter ===
                "ALL"
            ) {
                return appointments;
            }

            return appointments.filter(
                (appointment) =>
                    appointment.doctorId ===
                    effectiveDoctorFilter
            );
        }, [
            appointments,
            effectiveDoctorFilter,
        ]);

    const appointmentsByDate =
        useMemo(
            () =>
                getAppointmentsByDate(
                    filteredAppointments
                ),
            [filteredAppointments]
        );

    const weekDays =
        useMemo(
            () =>
                getWeekDays(
                    referenceDate
                ),
            [referenceDate]
        );

    const monthDays =
        useMemo(
            () =>
                getMonthDays(
                    referenceDate
                ),
            [referenceDate]
        );

    const timeSlots =
        useMemo(() => {
            const slots: number[] =
                [];

            for (
                let minutes =
                    GRID_START_MINUTES;
                minutes <
                GRID_END_MINUTES;
                minutes +=
                SLOT_MINUTES
            ) {
                slots.push(
                    minutes
                );
            }

            return slots;
        }, []);

    const title =
        view === "WEEK"
            ? (() => {
                const weekStart =
                    startOfWeek(
                        referenceDate
                    );

                const weekEnd =
                    addDays(
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
                    ).format(
                        weekStart
                    );

                const endText =
                    new Intl.DateTimeFormat(
                        "es-MX",
                        {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                        }
                    ).format(
                        weekEnd
                    );

                return `${startText} – ${endText}`;
            })()
            : formatMonthTitle(
                referenceDate
            );

    const selectedDoctor =
        doctors.find(
            (doctor) =>
                doctor.id ===
                effectiveDoctorFilter
        ) ?? null;

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
        setReferenceDate(
            new Date()
        );
    }

    function getScheduleForDay(
        date: Date
    ): CalendarDoctorSchedule | null {
        if (!selectedDoctor) {
            return null;
        }

        const weekday =
            getIsoWeekday(
                date
            );

        return (
            schedules.find(
                (schedule) =>
                    schedule.doctorId ===
                    selectedDoctor.id &&
                    schedule.weekday ===
                    weekday &&
                    schedule.isActive
            ) ?? null
        );
    }

    function isBlockedSlot(
        dateKey: string,
        startTime: string,
        endTime: string
    ): boolean {
        if (!selectedDoctor) {
            return false;
        }

        const slotStart =
            `${dateKey}T${startTime}`;

        const slotEnd =
            `${dateKey}T${endTime}`;

        return blocks.some(
            (block) =>
                block.doctorId ===
                selectedDoctor.id &&
                block.startDateTime <
                slotEnd &&
                block.endDateTime >
                slotStart
        );
    }

    function isOccupiedSlot(
        dateKey: string,
        startTime: string,
        endTime: string
    ): boolean {
        if (!selectedDoctor) {
            return false;
        }

        return appointments.some(
            (appointment) =>
                appointment.doctorId ===
                selectedDoctor.id &&
                appointment.scheduledDate ===
                dateKey &&
                appointment.status ===
                "SCHEDULED" &&
                rangesOverlap(
                    startTime,
                    endTime,
                    appointment.startTime,
                    appointment.endTime
                )
        );
    }

    function isNoticeValid(
        dateKey: string,
        startTime: string
    ): boolean {
        if (!currentDateTime) {
            return false;
        }

        const selectedDateTime =
            createLocalDateTime(
                dateKey,
                startTime
            );

        const minimumDateTime =
            new Date(
                currentDateTime.getTime() +
                8 *
                60 *
                60 *
                1000
            );

        return (
            selectedDateTime >=
            minimumDateTime
        );
    }

    function getSlotState(
        date: Date,
        dateKey: string,
        slotStartMinutes: number
    ): {
        selectable: boolean;
        label: string;
    } {
        if (!selectedDoctor) {
            return {
                selectable: false,
                label:
                    "Selecciona un médico",
            };
        }

        const schedule =
            getScheduleForDay(
                date
            );

        if (!schedule) {
            return {
                selectable: false,
                label:
                    "Sin horario laboral",
            };
        }

        const scheduleStart =
            timeToMinutes(
                schedule.startTime
            );

        const scheduleEnd =
            timeToMinutes(
                schedule.endTime
            );

        const slotDuration =
            schedule.appointmentDurationMinutes;

        const slotEndMinutes =
            slotStartMinutes +
            slotDuration;

        const startTime =
            minutesToTime(
                slotStartMinutes
            );

        const endTime =
            minutesToTime(
                slotEndMinutes
            );

        const aligned =
            (slotStartMinutes -
                scheduleStart) %
            slotDuration ===
            0;

        if (
            slotStartMinutes <
            scheduleStart ||
            slotEndMinutes >
            scheduleEnd ||
            !aligned
        ) {
            return {
                selectable: false,
                label:
                    "Fuera de horario",
            };
        }

        if (
            !isNoticeValid(
                dateKey,
                startTime
            )
        ) {
            return {
                selectable: false,
                label:
                    "Anticipación insuficiente",
            };
        }

        if (
            isBlockedSlot(
                dateKey,
                startTime,
                endTime
            )
        ) {
            return {
                selectable: false,
                label:
                    "Horario bloqueado",
            };
        }

        if (
            isOccupiedSlot(
                dateKey,
                startTime,
                endTime
            )
        ) {
            return {
                selectable: false,
                label:
                    "Horario ocupado",
            };
        }

        return {
            selectable:
                allowSlotSelection,
            label:
                "Horario disponible",
        };
    }

    function getAppointmentPosition(
        appointment: CalendarAppointment
    ): {
        top: number;
        height: number;
    } {
        const startMinutes =
            timeToMinutes(
                appointment.startTime
            );

        const endMinutes =
            timeToMinutes(
                appointment.endTime
            );

        const top =
            ((startMinutes -
                GRID_START_MINUTES) /
                SLOT_MINUTES) *
            SLOT_HEIGHT;

        const height =
            ((endMinutes -
                startMinutes) /
                SLOT_MINUTES) *
            SLOT_HEIGHT;

        return {
            top,
            height: Math.max(
                height,
                SLOT_HEIGHT
            ),
        };
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
                            {showDoctorFilter ? (
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
                                            (
                                                doctor
                                            ) => (
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
                            ) : selectedDoctor ? (
                                <div className="rounded-xl border border-primary-border bg-primary-soft px-4 py-3">
                                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-primary">
                                        Médico
                                    </p>

                                    <p className="mt-1 text-sm font-semibold text-foreground">
                                        {
                                            selectedDoctor.name
                                        }
                                    </p>

                                    {selectedDoctor.specialty ? (
                                        <p className="mt-0.5 text-xs text-foreground-muted">
                                            {
                                                selectedDoctor.specialty
                                            }
                                        </p>
                                    ) : null}
                                </div>
                            ) : null}

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
                            onClick={
                                goToday
                            }
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
                                    view ===
                                        "WEEK"
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
                                    view ===
                                        "WEEK"
                                        ? "Semana siguiente"
                                        : "Mes siguiente"
                                }
                                onClick={
                                    goNext
                                }
                            >
                                <ChevronRight className="size-5" />
                            </Button>
                        </div>
                    </div>

                    {view ===
                        "WEEK" &&
                        effectiveDoctorFilter ===
                        "ALL" ? (
                        <div className="rounded-2xl border border-warning-border bg-warning-soft px-4 py-3">
                            <p className="text-sm font-semibold text-foreground">
                                Selecciona un médico
                            </p>

                            <p className="mt-1 text-xs leading-5 text-foreground-muted">
                                La agenda horaria y las franjas disponibles requieren un médico específico.
                            </p>
                        </div>
                    ) : null}
                </CardContent>
            </Card>

            {view ===
                "WEEK" &&
                selectedDoctor ? (
                <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[var(--shadow-sm)]">
                    <div className="overflow-x-auto">
                        <div className="min-w-[1100px]">
                            <div className="grid grid-cols-[76px_repeat(7,minmax(140px,1fr))] border-b border-border bg-surface-muted">
                                <div className="border-r border-border px-3 py-4 text-center text-xs font-bold uppercase tracking-[0.08em] text-foreground-muted">
                                    Hora
                                </div>

                                {weekDays.map(
                                    (
                                        day
                                    ) => (
                                        <div
                                            key={
                                                day.dateKey
                                            }
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
                                                {
                                                    day.dayNumber
                                                }
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>

                            <div className="grid grid-cols-[76px_repeat(7,minmax(140px,1fr))]">
                                <div className="relative border-r border-border bg-surface-muted/50">
                                    {timeSlots.map(
                                        (
                                            slotMinutes
                                        ) => (
                                            <div
                                                key={
                                                    slotMinutes
                                                }
                                                className="flex h-11 items-start justify-center border-b border-border px-1 pt-1 text-[0.7rem] font-semibold text-foreground-muted"
                                            >
                                                {minutesToTime(
                                                    slotMinutes
                                                )}
                                            </div>
                                        )
                                    )}
                                </div>

                                {weekDays.map(
                                    (
                                        day
                                    ) => {
                                        const dayAppointments =
                                            appointmentsByDate.get(
                                                day.dateKey
                                            ) ??
                                            [];

                                        const visibleAppointments =
                                            dayAppointments.filter(
                                                (
                                                    appointment
                                                ) =>
                                                    appointment.status !==
                                                    "CANCELLED"
                                            );

                                        const schedule =
                                            getScheduleForDay(
                                                day.date
                                            );

                                        return (
                                            <div
                                                key={
                                                    day.dateKey
                                                }
                                                className="relative border-r border-border last:border-r-0"
                                                style={{
                                                    height:
                                                        timeSlots.length *
                                                        SLOT_HEIGHT,
                                                }}
                                            >
                                                {timeSlots.map(
                                                    (
                                                        slotMinutes
                                                    ) => {
                                                        const startTime =
                                                            minutesToTime(
                                                                slotMinutes
                                                            );

                                                        const state =
                                                            getSlotState(
                                                                day.date,
                                                                day.dateKey,
                                                                slotMinutes
                                                            );

                                                        return (
                                                            <button
                                                                key={
                                                                    slotMinutes
                                                                }
                                                                type="button"
                                                                disabled={
                                                                    !state.selectable
                                                                }
                                                                title={
                                                                    state.label
                                                                }
                                                                onClick={() =>
                                                                    onAvailableSlotSelect?.(
                                                                        {
                                                                            doctorId:
                                                                                selectedDoctor.id,
                                                                            scheduledDate:
                                                                                day.dateKey,
                                                                            startTime,
                                                                        }
                                                                    )
                                                                }
                                                                className={cn(
                                                                    "group absolute inset-x-0 flex h-11 items-center justify-center border-b border-border text-xs transition",
                                                                    state.selectable
                                                                        ? "cursor-pointer bg-surface hover:z-10 hover:bg-primary-soft"
                                                                        : schedule
                                                                            ? "cursor-default bg-surface-muted/30"
                                                                            : "cursor-default bg-surface-muted/65"
                                                                )}
                                                                style={{
                                                                    top:
                                                                        ((slotMinutes -
                                                                            GRID_START_MINUTES) /
                                                                            SLOT_MINUTES) *
                                                                        SLOT_HEIGHT,
                                                                }}
                                                            >
                                                                {state.selectable ? (
                                                                    <span className="flex items-center gap-1 rounded-lg border border-primary-border bg-surface px-2 py-1 font-semibold text-primary opacity-0 shadow-sm transition group-hover:opacity-100 group-focus-visible:opacity-100">
                                                                        <Plus className="size-3.5" />
                                                                        Agendar
                                                                    </span>
                                                                ) : null}
                                                            </button>
                                                        );
                                                    }
                                                )}

                                                {visibleAppointments.map(
                                                    (
                                                        appointment
                                                    ) => {
                                                        const position =
                                                            getAppointmentPosition(
                                                                appointment
                                                            );

                                                        return (
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
                                                                    "absolute inset-x-1 z-20 overflow-hidden rounded-xl border p-2 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15",
                                                                    getAppointmentClasses(
                                                                        appointment
                                                                    )
                                                                )}
                                                                style={{
                                                                    top:
                                                                        position.top +
                                                                        2,
                                                                    height:
                                                                        position.height -
                                                                        4,
                                                                }}
                                                            >
                                                                <p className="truncate text-[0.68rem] font-bold">
                                                                    {
                                                                        appointment.startTime
                                                                    }
                                                                    {
                                                                        " – "
                                                                    }
                                                                    {
                                                                        appointment.endTime
                                                                    }
                                                                </p>

                                                                <p className="mt-1 line-clamp-2 text-xs font-semibold">
                                                                    {
                                                                        appointment.patientName
                                                                    }
                                                                </p>
                                                            </button>
                                                        );
                                                    }
                                                )}
                                            </div>
                                        );
                                    }
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ) : view ===
                "WEEK" ? (
                <Card>
                    <CardContent className="flex min-h-80 flex-col items-center justify-center text-center">
                        <CalendarDays className="size-10 text-primary" />

                        <h3 className="mt-4 text-lg font-semibold text-foreground">
                            Selecciona un médico
                        </h3>

                        <p className="mt-2 max-w-md text-sm leading-6 text-foreground-muted">
                            Para consultar horarios disponibles y seleccionar una franja es necesario elegir un médico.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[var(--shadow-sm)]">
                    <div className="overflow-x-auto">
                        <div className="min-w-[760px]">
                            <div className="grid grid-cols-7 border-b border-border bg-surface-muted">
                                {weekDays.map(
                                    (
                                        day
                                    ) => (
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
                                    )
                                )}
                            </div>

                            <div className="grid grid-cols-7">
                                {monthDays.map(
                                    (
                                        day
                                    ) => {
                                        const dayAppointments =
                                            appointmentsByDate.get(
                                                day.dateKey
                                            ) ??
                                            [];

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
                                                                    "block w-full truncate rounded-lg border px-2 py-1.5 text-left text-[0.7rem] font-semibold transition hover:shadow-sm",
                                                                    getAppointmentClasses(
                                                                        appointment
                                                                    )
                                                                )}
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
                                    }
                                )}
                            </div>
                        </div>
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
                    ).map(
                        (
                            status
                        ) => (
                            <div
                                key={
                                    status
                                }
                                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface-muted px-4 py-3"
                            >
                                <span className="text-sm font-medium text-foreground">
                                    {
                                        STATUS_LABELS[
                                        status
                                        ]
                                    }
                                </span>

                                <Badge
                                    variant={getStatusVariant(
                                        {
                                            status,
                                        }
                                    )}
                                >
                                    {
                                        filteredAppointments.filter(
                                            (
                                                appointment
                                            ) =>
                                                appointment.status ===
                                                status
                                        )
                                            .length
                                    }
                                </Badge>
                            </div>
                        )
                    )}
                </CardContent>
            </Card>
        </div>
    );
}