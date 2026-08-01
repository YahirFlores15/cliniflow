import { findScheduleDoctorProfileByUserId, hasFutureAppointmentsOutsideNewSchedule, hasFutureScheduledAppointmentsOnWeekday, listSchedulesForDoctor, upsertScheduleForDoctor, } from "@/server/modules/doctor/doctor-schedule.repository";
import type { DoctorProfileDTO, DoctorScheduleDTO, } from "@/shared/dtos/doctor.dtos";
import type { UpsertDoctorScheduleInput, } from "@/shared/schemas/doctor.schemas";


export class DoctorScheduleDomainError
    extends Error {
    constructor(
        message: string
    ) {
        super(
            message
        );

        this.name =
            "DoctorScheduleDomainError";
    }
}

export type DoctorScheduleWorkspaceDTO = {
    doctor: DoctorProfileDTO;
    schedules: DoctorScheduleDTO[];
};

function getLocalCalendarDate(
    date = new Date()
): string {
    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
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

function timeToMinutes(
    time: string
): number {
    const match =
        /^([01]\d|2[0-3]):([0-5]\d)$/.exec(
            time
        );

    if (!match) {
        throw new DoctorScheduleDomainError(
            "La hora ingresada no es válida."
        );
    }

    return (
        Number(
            match[1]
        ) *
        60 +
        Number(
            match[2]
        )
    );
}

function getDoctorOrThrow(
    userId: string
): DoctorProfileDTO {
    const doctor =
        findScheduleDoctorProfileByUserId(
            userId
        );

    if (!doctor) {
        throw new DoctorScheduleDomainError(
            "No se encontró el perfil médico de la cuenta autenticada."
        );
    }

    if (
        !doctor.isActive
    ) {
        throw new DoctorScheduleDomainError(
            "La cuenta médica se encuentra desactivada."
        );
    }

    return doctor;
}

function assertValidScheduleRange(
    params: {
        startTime: string;
        endTime: string;
        appointmentDurationMinutes:
        | 30
        | 60;
    }
): void {
    const startMinutes =
        timeToMinutes(
            params.startTime
        );

    const endMinutes =
        timeToMinutes(
            params.endTime
        );

    if (
        startMinutes >=
        endMinutes
    ) {
        throw new DoctorScheduleDomainError(
            "La hora de inicio debe ser anterior a la hora de finalización."
        );
    }

    const availableMinutes =
        endMinutes -
        startMinutes;

    if (
        availableMinutes <
        params.appointmentDurationMinutes
    ) {
        throw new DoctorScheduleDomainError(
            "El horario debe permitir al menos una cita completa."
        );
    }

    if (
        availableMinutes %
        params.appointmentDurationMinutes !==
        0
    ) {
        throw new DoctorScheduleDomainError(
            `El horario debe dividirse exactamente en bloques de ${params.appointmentDurationMinutes} minutos.`
        );
    }
}

export function getDoctorScheduleWorkspace(
    userId: string
): DoctorScheduleWorkspaceDTO {
    const doctor =
        getDoctorOrThrow(
            userId
        );

    const schedules =
        listSchedulesForDoctor(
            doctor.id
        );

    return {
        doctor,
        schedules,
    };
}

export function saveScheduleForDoctor(
    params: {
        userId: string;
        input:
        UpsertDoctorScheduleInput;
    }
): DoctorScheduleDTO {
    const doctor =
        getDoctorOrThrow(
            params.userId
        );

    assertValidScheduleRange({
        startTime:
            params.input.startTime,
        endTime:
            params.input.endTime,
        appointmentDurationMinutes:
            params.input
                .appointmentDurationMinutes,
    });

    const today =
        getLocalCalendarDate();

    if (
        !params.input.isActive &&
        hasFutureScheduledAppointmentsOnWeekday(
            {
                doctorId:
                    doctor.id,
                weekday:
                    params.input.weekday,
                today,
            }
        )
    ) {
        throw new DoctorScheduleDomainError(
            "No puedes desactivar este día porque existen citas futuras programadas."
        );
    }

    if (
        params.input.isActive &&
        hasFutureAppointmentsOutsideNewSchedule(
            {
                doctorId:
                    doctor.id,
                weekday:
                    params.input.weekday,
                today,
                startTime:
                    params.input.startTime,
                endTime:
                    params.input.endTime,
            }
        )
    ) {
        throw new DoctorScheduleDomainError(
            "El nuevo horario dejaría fuera una o más citas futuras programadas."
        );
    }

    return upsertScheduleForDoctor({
        doctorId:
            doctor.id,
        weekday:
            params.input.weekday,
        startTime:
            params.input.startTime,
        endTime:
            params.input.endTime,
        appointmentDurationMinutes:
            params.input
                .appointmentDurationMinutes,
        isActive:
            params.input.isActive,
    });
}