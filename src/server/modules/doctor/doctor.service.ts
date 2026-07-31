import { findDoctorProfileByUserId, hasFutureAppointmentsOutsideSchedule, hasFutureScheduledAppointmentsForWeekday, listAppointmentsForDoctor, listDoctorSchedules, upsertDoctorSchedule, } from "@/server/modules/doctor/doctor.repository";
import type { DoctorAgendaDTO, DoctorAgendaSummaryDTO, DoctorAppointmentDTO, DoctorProfileDTO, DoctorScheduleDTO, } from "@/shared/dtos/doctor.dtos";
import type { DoctorAgendaFilterInput, UpsertDoctorScheduleInput, } from "@/shared/schemas/doctor.schemas";


export class DoctorDomainError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "DoctorDomainError";
    }
}

function getLocalCalendarDate(
    date = new Date()
): string {
    const year = date.getFullYear();
    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function timeToMinutes(time: string): number {
    const match =
        /^([01]\d|2[0-3]):([0-5]\d)$/.exec(time);

    if (!match) {
        throw new DoctorDomainError(
            "La hora ingresada no es válida."
        );
    }

    return (
        Number(match[1]) * 60 +
        Number(match[2])
    );
}

function assertValidScheduleRange(params: {
    startTime: string;
    endTime: string;
    appointmentDurationMinutes: 30 | 60;
}): void {
    const startMinutes = timeToMinutes(
        params.startTime
    );
    const endMinutes = timeToMinutes(params.endTime);

    if (startMinutes >= endMinutes) {
        throw new DoctorDomainError(
            "La hora de inicio debe ser anterior a la hora de finalización."
        );
    }

    const availableMinutes =
        endMinutes - startMinutes;

    if (
        availableMinutes <
        params.appointmentDurationMinutes
    ) {
        throw new DoctorDomainError(
            "El horario debe permitir al menos una cita completa."
        );
    }

    if (
        availableMinutes %
        params.appointmentDurationMinutes !==
        0
    ) {
        throw new DoctorDomainError(
            `El horario debe dividirse exactamente en bloques de ${params.appointmentDurationMinutes} minutos.`
        );
    }
}

function getDoctorProfileOrThrow(
    userId: string
): DoctorProfileDTO {
    const doctor = findDoctorProfileByUserId(userId);

    if (!doctor) {
        throw new DoctorDomainError(
            "No se encontró el perfil médico de la cuenta autenticada."
        );
    }

    if (!doctor.isActive) {
        throw new DoctorDomainError(
            "La cuenta médica se encuentra desactivada."
        );
    }

    return doctor;
}

function buildAgendaSummary(params: {
    appointments: DoctorAppointmentDTO[];
    today: string;
}): DoctorAgendaSummaryDTO {
    let todayScheduled = 0;
    let upcomingScheduled = 0;
    let completed = 0;
    let cancelled = 0;

    for (const appointment of params.appointments) {
        if (appointment.status === "COMPLETED") {
            completed += 1;
            continue;
        }

        if (appointment.status === "CANCELLED") {
            cancelled += 1;
            continue;
        }

        if (
            appointment.scheduledDate ===
            params.today
        ) {
            todayScheduled += 1;
        }

        if (
            appointment.scheduledDate >
            params.today
        ) {
            upcomingScheduled += 1;
        }
    }

    return {
        todayScheduled,
        upcomingScheduled,
        completed,
        cancelled,
    };
}

export function getDoctorAgenda(params: {
    userId: string;
    filters?: DoctorAgendaFilterInput;
}): DoctorAgendaDTO {
    const doctor = getDoctorProfileOrThrow(
        params.userId
    );

    const allAppointments =
        listAppointmentsForDoctor({
            doctorId: doctor.id,
        });

    const appointments =
        listAppointmentsForDoctor({
            doctorId: doctor.id,
            scheduledDate: params.filters?.date,
            status: params.filters?.status,
        });

    const schedules = listDoctorSchedules(
        doctor.id
    );

    const summary = buildAgendaSummary({
        appointments: allAppointments,
        today: getLocalCalendarDate(),
    });

    return {
        doctor,
        appointments,
        schedules,
        summary,
    };
}

export function saveDoctorSchedule(params: {
    userId: string;
    input: UpsertDoctorScheduleInput;
}): DoctorScheduleDTO {
    const doctor = getDoctorProfileOrThrow(
        params.userId
    );

    assertValidScheduleRange({
        startTime: params.input.startTime,
        endTime: params.input.endTime,
        appointmentDurationMinutes:
            params.input
                .appointmentDurationMinutes,
    });

    const today = getLocalCalendarDate();

    if (
        !params.input.isActive &&
        hasFutureScheduledAppointmentsForWeekday({
            doctorId: doctor.id,
            weekday: params.input.weekday,
            today,
        })
    ) {
        throw new DoctorDomainError(
            "No puedes desactivar este día porque existen citas futuras programadas."
        );
    }

    if (
        params.input.isActive &&
        hasFutureAppointmentsOutsideSchedule({
            doctorId: doctor.id,
            weekday: params.input.weekday,
            today,
            startTime: params.input.startTime,
            endTime: params.input.endTime,
        })
    ) {
        throw new DoctorDomainError(
            "El nuevo horario dejaría fuera una o más citas futuras programadas."
        );
    }

    return upsertDoctorSchedule({
        doctorId: doctor.id,
        weekday: params.input.weekday,
        startTime: params.input.startTime,
        endTime: params.input.endTime,
        appointmentDurationMinutes:
            params.input
                .appointmentDurationMinutes,
        isActive: params.input.isActive,
    });
}