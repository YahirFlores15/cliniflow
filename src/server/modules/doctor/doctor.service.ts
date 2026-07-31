import { cancelAppointmentsForDoctorBlock, createDoctorBlock, deleteDoctorBlock, findDoctorBlockById, findDoctorProfileByUserId, findMedicalRecordForDoctor, hasDoctorAccessToPatient, hasDoctorBlockOverlap, hasFutureAppointmentsOutsideSchedule, hasFutureScheduledAppointmentsForWeekday, listAppointmentsForDoctor, listDoctorSchedules, listFutureDoctorBlocks, listMedicalRecordsForDoctor, listScheduledAppointmentIdsAffectedByBlock, upsertDoctorSchedule, upsertMedicalRecord, } from "@/server/modules/doctor/doctor.repository";
import type { DoctorAgendaDTO, DoctorAgendaSummaryDTO, DoctorAppointmentDTO, DoctorBlockDTO, DoctorProfileDTO, DoctorScheduleDTO, MedicalRecordDTO, } from "@/shared/dtos/doctor.dtos";
import type { CreateDoctorBlockInput, DeleteDoctorBlockInput, DoctorAgendaFilterInput, UpdateMedicalRecordInput, UpsertDoctorScheduleInput, } from "@/shared/schemas/doctor.schemas";
import { getDb } from "@/server/db/connection";


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
    const day = String(date.getDate()).padStart(
        2,
        "0"
    );

    return `${year}-${month}-${day}`;
}

function getLocalDateTime(
    date = new Date()
): string {
    const calendarDate =
        getLocalCalendarDate(date);

    const hours = String(
        date.getHours()
    ).padStart(2, "0");

    const minutes = String(
        date.getMinutes()
    ).padStart(2, "0");

    return `${calendarDate}T${hours}:${minutes}`;
}

function parseCalendarDate(
    value: string
): Date | null {
    const match =
        /^(\d{4})-(\d{2})-(\d{2})$/.exec(
            value
        );

    if (!match) {
        return null;
    }

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);

    const parsedDate = new Date(
        year,
        month - 1,
        day
    );

    if (
        parsedDate.getFullYear() !== year ||
        parsedDate.getMonth() !== month - 1 ||
        parsedDate.getDate() !== day
    ) {
        return null;
    }

    return parsedDate;
}

function parseLocalDateTime(params: {
    date: string;
    time: string;
}): Date | null {
    const parsedDate = parseCalendarDate(
        params.date
    );

    const timeMatch =
        /^([01]\d|2[0-3]):([0-5]\d)$/.exec(
            params.time
        );

    if (!parsedDate || !timeMatch) {
        return null;
    }

    parsedDate.setHours(
        Number(timeMatch[1]),
        Number(timeMatch[2]),
        0,
        0
    );

    return parsedDate;
}

function serializeLocalDateTime(
    date: Date
): string {
    return getLocalDateTime(date);
}

function timeToMinutes(time: string): number {
    const match =
        /^([01]\d|2[0-3]):([0-5]\d)$/.exec(
            time
        );

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

    const endMinutes = timeToMinutes(
        params.endTime
    );

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
    const doctor = findDoctorProfileByUserId(
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

function buildAgendaSummary(params: {
    appointments: DoctorAppointmentDTO[];
    today: string;
}): DoctorAgendaSummaryDTO {
    let todayScheduled = 0;
    let upcomingScheduled = 0;
    let completed = 0;
    let cancelled = 0;

    for (const appointment of params.appointments) {
        if (
            appointment.status === "COMPLETED"
        ) {
            completed += 1;
            continue;
        }

        if (
            appointment.status === "CANCELLED"
        ) {
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
            scheduledDate:
                params.filters?.date,
            status: params.filters?.status,
        });

    const schedules = listDoctorSchedules(
        doctor.id
    );

    const blocks = listFutureDoctorBlocks({
        doctorId: doctor.id,
        fromDateTime: getLocalDateTime(),
    });

    const medicalRecords =
        listMedicalRecordsForDoctor(
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
        blocks,
        medicalRecords,
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
        hasFutureScheduledAppointmentsForWeekday(
            {
                doctorId: doctor.id,
                weekday:
                    params.input.weekday,
                today,
            }
        )
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
            startTime:
                params.input.startTime,
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

export function createBlockForDoctor(params: {
    userId: string;
    input: CreateDoctorBlockInput;
}): {
    block: DoctorBlockDTO;
    cancelledAppointments: number;
} {
    const doctor = getDoctorProfileOrThrow(
        params.userId
    );

    const startDateTime =
        parseLocalDateTime({
            date: params.input.startDate,
            time: params.input.startTime,
        });

    const endDateTime = parseLocalDateTime({
        date: params.input.endDate,
        time: params.input.endTime,
    });

    if (!startDateTime || !endDateTime) {
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

    const now = new Date();

    if (
        startDateTime.getTime() <=
        now.getTime()
    ) {
        throw new DoctorDomainError(
            "El bloqueo debe comenzar en una fecha y hora futura."
        );
    }

    const serializedStart =
        serializeLocalDateTime(
            startDateTime
        );

    const serializedEnd =
        serializeLocalDateTime(endDateTime);

    const database = getDb();

    const transaction = database.transaction(
        () => {
            if (
                hasDoctorBlockOverlap({
                    doctorId: doctor.id,
                    startDateTime:
                        serializedStart,
                    endDateTime:
                        serializedEnd,
                })
            ) {
                throw new DoctorDomainError(
                    "El rango seleccionado se superpone con otro bloqueo."
                );
            }

            const affectedAppointmentIds =
                listScheduledAppointmentIdsAffectedByBlock(
                    {
                        doctorId: doctor.id,
                        startDateTime:
                            serializedStart,
                        endDateTime:
                            serializedEnd,
                    }
                );

            const normalizedReason =
                params.input.reason.trim();

            const cancellationReason =
                normalizedReason
                    ? `Horario bloqueado por el médico: ${normalizedReason}`
                    : "Horario bloqueado por el médico.";

            const block = createDoctorBlock({
                doctorId: doctor.id,
                startDateTime:
                    serializedStart,
                endDateTime:
                    serializedEnd,
                reason: normalizedReason,
            });

            const cancelledAppointments =
                cancelAppointmentsForDoctorBlock(
                    {
                        appointmentIds:
                            affectedAppointmentIds,
                        cancelledByUserId:
                            params.userId,
                        cancellationReason,
                    }
                );

            return {
                block,
                cancelledAppointments,
            };
        }
    );

    return transaction();
}

export function deleteBlockForDoctor(params: {
    userId: string;
    input: DeleteDoctorBlockInput;
}): void {
    const doctor = getDoctorProfileOrThrow(
        params.userId
    );

    const block = findDoctorBlockById({
        doctorId: doctor.id,
        blockId: params.input.blockId,
    });

    if (!block) {
        throw new DoctorDomainError(
            "El bloqueo no existe o no pertenece al médico autenticado."
        );
    }

    const now = getLocalDateTime();

    if (block.startDateTime <= now) {
        throw new DoctorDomainError(
            "No se puede eliminar un bloqueo que ya comenzó."
        );
    }

    const wasDeleted = deleteDoctorBlock({
        doctorId: doctor.id,
        blockId: block.id,
    });

    if (!wasDeleted) {
        throw new DoctorDomainError(
            "No se pudo eliminar el bloqueo."
        );
    }
}

export function saveMedicalRecordForDoctor(
    params: {
        userId: string;
        input: UpdateMedicalRecordInput;
    }
): MedicalRecordDTO {
    const doctor = getDoctorProfileOrThrow(
        params.userId
    );

    const hasAccess =
        hasDoctorAccessToPatient({
            doctorId: doctor.id,
            patientId:
                params.input.patientId,
        });

    if (!hasAccess) {
        throw new DoctorDomainError(
            "No tienes acceso al expediente de este paciente."
        );
    }

    const database = getDb();

    const transaction = database.transaction(
        () => {
            upsertMedicalRecord({
                patientId:
                    params.input.patientId,
                allergies:
                    params.input.allergies.trim(),
                chronicDiseases:
                    params.input.chronicDiseases.trim(),
                currentMedications:
                    params.input.currentMedications.trim(),
                emergencyContactName:
                    params.input.emergencyContactName.trim(),
                emergencyContactPhone:
                    params.input.emergencyContactPhone.trim(),
            });

            const record =
                findMedicalRecordForDoctor({
                    doctorId: doctor.id,
                    patientId:
                        params.input.patientId,
                });

            if (!record) {
                throw new DoctorDomainError(
                    "No se pudo consultar el expediente actualizado."
                );
            }

            return record;
        }
    );

    return transaction();
}