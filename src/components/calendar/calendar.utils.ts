import type { CalendarAppointment, CalendarDay, } from "@/components/calendar/calendar.types";


const WEEKDAY_FORMATTER =
    new Intl.DateTimeFormat(
        "es-MX",
        {
            weekday: "short",
        }
    );

const MONTH_FORMATTER =
    new Intl.DateTimeFormat(
        "es-MX",
        {
            month: "long",
            year: "numeric",
        }
    );

const FULL_DATE_FORMATTER =
    new Intl.DateTimeFormat(
        "es-MX",
        {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
        }
    );

export function createLocalDate(
    dateKey: string
): Date {
    const [year, month, day] =
        dateKey.split("-").map(Number);

    return new Date(
        year,
        month - 1,
        day,
        12,
        0,
        0,
        0
    );
}

export function createLocalDateTime(
    dateKey: string,
    time: string
): Date {
    const [year, month, day] =
        dateKey.split("-").map(Number);

    const [hours, minutes] =
        time.split(":").map(Number);

    return new Date(
        year,
        month - 1,
        day,
        hours,
        minutes,
        0,
        0
    );
}

export function toDateKey(
    date: Date
): string {
    const year = date.getFullYear();

    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

export function addDays(
    date: Date,
    amount: number
): Date {
    const nextDate = new Date(date);

    nextDate.setDate(
        nextDate.getDate() + amount
    );

    return nextDate;
}

export function addMonths(
    date: Date,
    amount: number
): Date {
    return new Date(
        date.getFullYear(),
        date.getMonth() + amount,
        1,
        12,
        0,
        0,
        0
    );
}

export function startOfWeek(
    date: Date
): Date {
    const result = new Date(date);
    const weekday = result.getDay();

    const mondayOffset =
        weekday === 0
            ? -6
            : 1 - weekday;

    result.setDate(
        result.getDate() +
        mondayOffset
    );

    result.setHours(12, 0, 0, 0);

    return result;
}

export function startOfMonthGrid(
    date: Date
): Date {
    const firstDay = new Date(
        date.getFullYear(),
        date.getMonth(),
        1,
        12,
        0,
        0,
        0
    );

    return startOfWeek(firstDay);
}

export function getWeekDays(
    referenceDate: Date
): CalendarDay[] {
    const weekStart =
        startOfWeek(referenceDate);

    const todayKey =
        toDateKey(new Date());

    return Array.from(
        {
            length: 7,
        },
        (_, index) => {
            const date = addDays(
                weekStart,
                index
            );

            const dateKey =
                toDateKey(date);

            return {
                date,
                dateKey,
                dayNumber:
                    date.getDate(),
                isToday:
                    dateKey === todayKey,
                isCurrentMonth: true,
            };
        }
    );
}

export function getMonthDays(
    referenceDate: Date
): CalendarDay[] {
    const gridStart =
        startOfMonthGrid(
            referenceDate
        );

    const currentMonth =
        referenceDate.getMonth();

    const todayKey =
        toDateKey(new Date());

    return Array.from(
        {
            length: 42,
        },
        (_, index) => {
            const date = addDays(
                gridStart,
                index
            );

            const dateKey =
                toDateKey(date);

            return {
                date,
                dateKey,
                dayNumber:
                    date.getDate(),
                isToday:
                    dateKey === todayKey,
                isCurrentMonth:
                    date.getMonth() ===
                    currentMonth,
            };
        }
    );
}

export function formatWeekday(
    date: Date
): string {
    const value =
        WEEKDAY_FORMATTER.format(date);

    return (
        value
            .charAt(0)
            .toUpperCase() +
        value.slice(1)
    );
}

export function formatMonthTitle(
    date: Date
): string {
    const value =
        MONTH_FORMATTER.format(date);

    return (
        value
            .charAt(0)
            .toUpperCase() +
        value.slice(1)
    );
}

export function formatFullDate(
    dateKey: string
): string {
    const value =
        FULL_DATE_FORMATTER.format(
            createLocalDate(dateKey)
        );

    return (
        value
            .charAt(0)
            .toUpperCase() +
        value.slice(1)
    );
}

export function timeToMinutes(
    time: string
): number {
    const [hours, minutes] =
        time.split(":").map(Number);

    return hours * 60 + minutes;
}

export function minutesToTime(
    totalMinutes: number
): string {
    const hours = Math.floor(
        totalMinutes / 60
    );

    const minutes =
        totalMinutes % 60;

    return `${String(hours).padStart(
        2,
        "0"
    )}:${String(minutes).padStart(
        2,
        "0"
    )}`;
}

export function rangesOverlap(
    firstStart: string,
    firstEnd: string,
    secondStart: string,
    secondEnd: string
): boolean {
    return (
        firstStart < secondEnd &&
        firstEnd > secondStart
    );
}

export function getIsoWeekday(
    date: Date
): number {
    const weekday = date.getDay();

    return weekday === 0
        ? 7
        : weekday;
}

export function getAppointmentsByDate(
    appointments: CalendarAppointment[]
): Map<
    string,
    CalendarAppointment[]
> {
    const appointmentsByDate =
        new Map<
            string,
            CalendarAppointment[]
        >();

    for (const appointment of appointments) {
        const currentAppointments =
            appointmentsByDate.get(
                appointment.scheduledDate
            ) ?? [];

        currentAppointments.push(
            appointment
        );

        appointmentsByDate.set(
            appointment.scheduledDate,
            currentAppointments
        );
    }

    for (
        const dateAppointments
        of appointmentsByDate.values()
    ) {
        dateAppointments.sort(
            (first, second) =>
                first.startTime.localeCompare(
                    second.startTime
                )
        );
    }

    return appointmentsByDate;
}