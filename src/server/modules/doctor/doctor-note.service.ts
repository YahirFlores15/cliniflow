import { createMedicalNote, findAppointmentForDoctor, findDoctorProfileByUserId, findMedicalNoteByAppointment, } from "@/server/modules/doctor/doctor.repository";
import type { DoctorAppointmentDTO, DoctorProfileDTO, MedicalNoteDTO, } from "@/shared/dtos/doctor.dtos";
import { markAppointmentAsCompleted } from "@/server/modules/doctor/doctor-note.repository";
import type { CreateMedicalNoteInput, } from "@/shared/schemas/doctor.schemas";
import { getDb } from "@/server/db/connection";


export class DoctorNoteDomainError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "DoctorNoteDomainError";
    }
}

export type DoctorMedicalNotePageDTO = {
    doctor: DoctorProfileDTO;
    appointment: DoctorAppointmentDTO;
    note: MedicalNoteDTO | null;
    canCreateNote: boolean;
    creationBlockedReason: string | null;
};

function getDoctorProfileOrThrow(
    userId: string
): DoctorProfileDTO {
    const doctor =
        findDoctorProfileByUserId(
            userId
        );

    if (!doctor) {
        throw new DoctorNoteDomainError(
            "No se encontró el perfil médico de la cuenta autenticada."
        );
    }

    if (!doctor.isActive) {
        throw new DoctorNoteDomainError(
            "La cuenta médica se encuentra desactivada."
        );
    }

    return doctor;
}

function parseAppointmentDateTime(
    appointment: Pick<
        DoctorAppointmentDTO,
        "scheduledDate" | "startTime"
    >
): Date | null {
    const dateMatch =
        /^(\d{4})-(\d{2})-(\d{2})$/.exec(
            appointment.scheduledDate
        );

    const timeMatch =
        /^([01]\d|2[0-3]):([0-5]\d)$/.exec(
            appointment.startTime
        );

    if (
        !dateMatch ||
        !timeMatch
    ) {
        return null;
    }

    const year =
        Number(dateMatch[1]);

    const month =
        Number(dateMatch[2]);

    const day =
        Number(dateMatch[3]);

    const hours =
        Number(timeMatch[1]);

    const minutes =
        Number(timeMatch[2]);

    const date =
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
        date.getFullYear() !== year ||
        date.getMonth() !==
        month - 1 ||
        date.getDate() !== day ||
        date.getHours() !== hours ||
        date.getMinutes() !== minutes
    ) {
        return null;
    }

    return date;
}

function getCreationBlockedReason(params: {
    appointment: DoctorAppointmentDTO;
    note: MedicalNoteDTO | null;
    now?: Date;
}): string | null {
    if (params.note) {
        return "La cita ya tiene una nota médica registrada.";
    }

    if (
        params.appointment.status ===
        "CANCELLED"
    ) {
        return "No se puede registrar una nota médica para una cita cancelada.";
    }

    if (
        params.appointment.status ===
        "COMPLETED"
    ) {
        return "La cita está completada, pero no tiene una nota médica asociada.";
    }

    const appointmentDateTime =
        parseAppointmentDateTime(
            params.appointment
        );

    if (!appointmentDateTime) {
        return "La fecha u hora de la cita no es válida.";
    }

    const now =
        params.now ?? new Date();

    if (
        appointmentDateTime.getTime() >
        now.getTime()
    ) {
        return "La nota médica podrá registrarse cuando comience la consulta.";
    }

    return null;
}

export function getDoctorMedicalNotePage(
    params: {
        userId: string;
        appointmentId: string;
    }
): DoctorMedicalNotePageDTO | null {
    const doctor =
        getDoctorProfileOrThrow(
            params.userId
        );

    const appointment =
        findAppointmentForDoctor({
            doctorId:
                doctor.id,
            appointmentId:
                params.appointmentId,
        });

    if (!appointment) {
        return null;
    }

    const note =
        findMedicalNoteByAppointment({
            doctorId:
                doctor.id,
            appointmentId:
                appointment.id,
        });

    const creationBlockedReason =
        getCreationBlockedReason({
            appointment,
            note,
        });

    return {
        doctor,
        appointment,
        note,
        canCreateNote:
            !creationBlockedReason,
        creationBlockedReason,
    };
}

export function createDoctorMedicalNote(
    params: {
        userId: string;
        input: CreateMedicalNoteInput;
    }
): MedicalNoteDTO {
    const doctor =
        getDoctorProfileOrThrow(
            params.userId
        );

    const database =
        getDb();

    const transaction =
        database.transaction(
            (): MedicalNoteDTO => {
                const appointment =
                    findAppointmentForDoctor({
                        doctorId:
                            doctor.id,
                        appointmentId:
                            params.input
                                .appointmentId,
                    });

                if (!appointment) {
                    throw new DoctorNoteDomainError(
                        "La cita no existe o no pertenece al médico autenticado."
                    );
                }

                const existingNote =
                    findMedicalNoteByAppointment({
                        doctorId:
                            doctor.id,
                        appointmentId:
                            appointment.id,
                    });

                const creationBlockedReason =
                    getCreationBlockedReason({
                        appointment,
                        note:
                            existingNote,
                    });

                if (
                    creationBlockedReason
                ) {
                    throw new DoctorNoteDomainError(
                        creationBlockedReason
                    );
                }

                const note =
                    createMedicalNote({
                        appointmentId:
                            appointment.id,
                        doctorId:
                            doctor.id,
                        reason:
                            params.input.reason.trim(),
                        diagnosis:
                            params.input.diagnosis.trim(),
                        treatment:
                            params.input.treatment.trim(),
                        prescriptionText:
                            params.input.prescriptionText.trim(),
                        instructionsText:
                            params.input.instructionsText.trim(),
                    });

                const appointmentWasCompleted =
                    markAppointmentAsCompleted({
                        appointmentId:
                            appointment.id,
                        doctorId:
                            doctor.id,
                    });

                if (
                    !appointmentWasCompleted
                ) {
                    throw new DoctorNoteDomainError(
                        "La cita cambió de estado y no pudo completarse."
                    );
                }

                return note;
            }
        );

    return transaction();
}