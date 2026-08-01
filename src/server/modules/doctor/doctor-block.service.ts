import { createBlockForDoctor, deleteBlockForDoctor, DoctorDomainError, } from "@/server/modules/doctor/doctor.service";
import { findDoctorProfileByUserId, listFutureDoctorBlocks, } from "@/server/modules/doctor/doctor.repository";
import { listScheduledAppointmentsAffectedByDoctorBlock, } from "@/server/modules/doctor/doctor-block.repository";
import type { DoctorBlockPreviewDTO, DoctorBlocksWorkspaceDTO, } from "@/shared/dtos/doctor-block.dtos";
import type { CreateDoctorBlockInput, DeleteDoctorBlockInput, } from "@/shared/schemas/doctor.schemas";


function getLocalCalendarDate(
    date: Date
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

function getLocalDateTime(
    date = new Date()
): string {
    const datePart =
        getLocalCalendarDate(
            date
        );

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

    return `${datePart}T${hours}:${minutes}`;
}

function parseLocalDateTime(
    params: {
        date: string;
        time: string;
    }
): Date | null {
    const dateMatch =
        /^(\d{4})-(\d{2})-(\d{2})$/.exec(
            params.date
        );

    const timeMatch =
        /^([01]\d|2[0-3]):([0-5]\d)$/.exec(
            params.time
        );

    if (
        !dateMatch ||
        !timeMatch
    ) {
        return null;
    }

    const year =
        Number(
            dateMatch[1]
        );

    const month =
        Number(
            dateMatch[2]
        );

    const day =
        Number(
            dateMatch[3]
        );

    const hours =
        Number(
            timeMatch[1]
        );

    const minutes =
        Number(
            timeMatch[2]
        );

    const parsedDate =
        new Date(
            year,
            month - 1,
            day,
            hours,
            minutes,
            0,
            0
        );

    if (
        parsedDate.getFullYear() !==
        year ||
        parsedDate.getMonth() !==
        month - 1 ||
        parsedDate.getDate() !==
        day ||
        parsedDate.getHours() !==
        hours ||
        parsedDate.getMinutes() !==
        minutes
    ) {
        return null;
    }

    return parsedDate;
}

function serializeLocalDateTime(
    date: Date
): string {
    return getLocalDateTime(
        date
    );
}

function getDoctorOrThrow(
    userId: string
) {
    const doctor =
        findDoctorProfileByUserId(
            userId
        );

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

function resolveBlockDateTimes(
    input: CreateDoctorBlockInput
): {
    startDateTime: Date;
    endDateTime: Date;
    serializedStartDateTime: string;
    serializedEndDateTime: string;
} {
    const startDateTime =
        parseLocalDateTime({
            date:
                input.startDate,
            time:
                input.startTime,
        });

    const endDateTime =
        parseLocalDateTime({
            date:
                input.endDate,
            time:
                input.endTime,
        });

    if (
        !startDateTime ||
        !endDateTime
    ) {
        throw new DoctorDomainError(
            "La fecha u hora del bloqueo no es válida."
        );
    }

    if (
        startDateTime.getTime() >=
        endDateTime.getTime()
    ) {
        throw new DoctorDomainError(
            "El inicio del bloqueo debe ser anterior al final."
        );
    }

    if (
        startDateTime.getTime() <=
        Date.now()
    ) {
        throw new DoctorDomainError(
            "El bloqueo debe comenzar en una fecha y hora futura."
        );
    }

    return {
        startDateTime,
        endDateTime,
        serializedStartDateTime:
            serializeLocalDateTime(
                startDateTime
            ),
        serializedEndDateTime:
            serializeLocalDateTime(
                endDateTime
            ),
    };
}

export function getDoctorBlocksWorkspace(
    userId: string
): DoctorBlocksWorkspaceDTO {
    const doctor =
        getDoctorOrThrow(
            userId
        );

    const blocks =
        listFutureDoctorBlocks({
            doctorId:
                doctor.id,
            fromDateTime:
                getLocalDateTime(),
        });

    return {
        doctor,
        blocks,
    };
}

export function previewDoctorBlock(
    params: {
        userId: string;
        input:
        CreateDoctorBlockInput;
    }
): DoctorBlockPreviewDTO {
    const doctor =
        getDoctorOrThrow(
            params.userId
        );

    const dateTimes =
        resolveBlockDateTimes(
            params.input
        );

    const affectedAppointments =
        listScheduledAppointmentsAffectedByDoctorBlock(
            {
                doctorId:
                    doctor.id,
                startDateTime:
                    dateTimes
                        .serializedStartDateTime,
                endDateTime:
                    dateTimes
                        .serializedEndDateTime,
            }
        );

    return {
        startDateTime:
            dateTimes
                .serializedStartDateTime,
        endDateTime:
            dateTimes
                .serializedEndDateTime,
        affectedAppointments,
        affectedAppointmentsCount:
            affectedAppointments.length,
    };
}

export function createDoctorBlockFromWorkspace(
    params: {
        userId: string;
        input:
        CreateDoctorBlockInput;
    }
) {
    resolveBlockDateTimes(
        params.input
    );

    return createBlockForDoctor({
        userId:
            params.userId,
        input:
            params.input,
    });
}

export function deleteDoctorBlockFromWorkspace(
    params: {
        userId: string;
        input:
        DeleteDoctorBlockInput;
    }
): void {
    deleteBlockForDoctor({
        userId:
            params.userId,
        input:
            params.input,
    });
}