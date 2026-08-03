import { completePastScheduledAppointments, } from "@/server/modules/appointments/appointment-status.repository";


export type AppointmentStatusSynchronizationResult = {
    completedAppointments: number;
    synchronizedAt: string;
};

function getLocalCalendarDate(
    date:
        Date
): string {
    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() +
            1
        ).padStart(
            2,
            "0"
        );

    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );

    return `${year}-${month}-${day}`;
}

function getLocalCalendarTime(
    date:
        Date
): string {
    const hours =
        String(
            date.getHours()
        ).padStart(
            2,
            "0"
        );

    const minutes =
        String(
            date.getMinutes()
        ).padStart(
            2,
            "0"
        );

    return `${hours}:${minutes}`;
}

function getLocalDateTime(
    date:
        Date
): string {
    return `${getLocalCalendarDate(
        date
    )}T${getLocalCalendarTime(
        date
    )}`;
}

export function synchronizePastAppointments(
    now =
        new Date()
): AppointmentStatusSynchronizationResult {
    const currentDate =
        getLocalCalendarDate(
            now
        );

    const currentTime =
        getLocalCalendarTime(
            now
        );

    const completedAppointments =
        completePastScheduledAppointments(
            {
                currentDate,
                currentTime,
            }
        );

    return {
        completedAppointments,
        synchronizedAt:
            getLocalDateTime(
                now
            ),
    };
}