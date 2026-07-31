import { cancelPatientAppointment, checkPatientAppointmentAvailability, findPatientAppointmentById, findPatientDoctorSchedule, findPatientMedicalRecord, findPatientProfileByUserId, listPatientAppointments, listPatientMedicalNotes, reschedulePatientAppointment, updatePatientProfile, } from "@/server/modules/patient/patient.repository";
import type { PatientAppointmentAvailabilityReason, PatientAppointmentDTO, PatientPortalDTO, PatientProfileDTO, } from "@/shared/dtos/patient.dtos";
import type { PatientCancelAppointmentInput, PatientRescheduleAppointmentInput, PatientUpdateProfileInput, } from "@/shared/schemas/patient.schemas";
import { getDb } from "@/server/db/connection";


const MINIMUM_APPOINTMENT_NOTICE_HOURS = 8;

export class PatientDomainError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "PatientDomainError";
    }
}

function parseCalendarDate(date: string): Date | null {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);

    if (!match) {
        return null;
    }

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);

    const parsedDate = new Date(year, month - 1, day);

    if (
        parsedDate.getFullYear() !== year ||
        parsedDate.getMonth() !== month - 1 ||
        parsedDate.getDate() !== day
    ) {
        return null;
    }

    return parsedDate;
}

function parseLocalDateTime(
    date: string,
    time: string
): Date | null {
    const parsedDate = parseCalendarDate(date);
    const timeMatch =
        /^([01]\d|2[0-3]):([0-5]\d)$/.exec(time);

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

function getIsoWeekday(date: Date): number {
    const weekday = date.getDay();

    return weekday === 0 ? 7 : weekday;
}

function minutesToTime(totalMinutes: number): string {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${String(hours).padStart(2, "0")}:${String(
        minutes
    ).padStart(2, "0")}`;
}

function calculateEndTime(params: {
    startTime: string;
    durationMinutes: 30 | 60;
}): string {
    const match =
        /^([01]\d|2[0-3]):([0-5]\d)$/.exec(params.startTime);

    if (!match) {
        throw new PatientDomainError(
            "La hora de inicio no es válida."
        );
    }

    const startMinutes =
        Number(match[1]) * 60 + Number(match[2]);

    const endMinutes =
        startMinutes + params.durationMinutes;

    if (endMinutes > 24 * 60) {
        throw new PatientDomainError(
            "La cita no puede terminar después de la medianoche."
        );
    }

    return minutesToTime(endMinutes);
}

function validateMinimumAppointmentNotice(
    appointmentDateTime: Date,
    now = new Date()
): void {
    const minimumDateTime = new Date(
        now.getTime() +
        MINIMUM_APPOINTMENT_NOTICE_HOURS *
        60 *
        60 *
        1000
    );

    if (appointmentDateTime < minimumDateTime) {
        throw new PatientDomainError(
            "La cita debe reagendarse con al menos 8 horas de anticipación."
        );
    }
}

function getAvailabilityErrorMessage(
    reason: PatientAppointmentAvailabilityReason
): string {
    switch (reason) {
        case "DOCTOR_NOT_FOUND":
            return "El médico de la cita ya no existe.";

        case "DOCTOR_INACTIVE":
            return "El médico de la cita se encuentra desactivado.";

        case "NO_SCHEDULE":
            return "El médico no tiene horario disponible para ese día.";

        case "OUTSIDE_SCHEDULE":
            return "El horario seleccionado queda fuera de la jornada del médico.";

        case "BLOCKED":
            return "El horario seleccionado está bloqueado por el médico.";

        case "OVERLAP":
            return "El médico ya tiene otra cita en ese horario.";

        case "AVAILABLE":
            return "El horario está disponible.";
    }
}

function requirePatientProfile(
    userId: string
): PatientProfileDTO {
    const profile = findPatientProfileByUserId(userId);

    if (!profile) {
        throw new PatientDomainError(
            "No existe un perfil de paciente asociado a esta cuenta."
        );
    }

    if (!profile.isActive) {
        throw new PatientDomainError(
            "El perfil del paciente está desactivado."
        );
    }

    return profile;
}

function requireOwnedAppointment(params: {
    appointmentId: string;
    patientId: string;
}): PatientAppointmentDTO {
    const appointment = findPatientAppointmentById(params);

    if (!appointment) {
        throw new PatientDomainError(
            "La cita no existe o no pertenece al paciente autenticado."
        );
    }

    return appointment;
}

function validateAppointmentCanBeChanged(
    appointment: PatientAppointmentDTO
): void {
    if (appointment.status === "COMPLETED") {
        throw new PatientDomainError(
            "Una cita completada no se puede modificar."
        );
    }

    if (appointment.status === "CANCELLED") {
        throw new PatientDomainError(
            "Una cita cancelada no se puede modificar."
        );
    }

    const appointmentDateTime = parseLocalDateTime(
        appointment.scheduledDate,
        appointment.startTime
    );

    if (!appointmentDateTime) {
        throw new PatientDomainError(
            "La fecha u hora actual de la cita no es válida."
        );
    }

    if (appointmentDateTime <= new Date()) {
        throw new PatientDomainError(
            "Una cita que ya comenzó o quedó en el pasado no se puede modificar."
        );
    }
}

export function getPatientPortal(
    userId: string
): PatientPortalDTO {
    const profile = requirePatientProfile(userId);
    const appointments = listPatientAppointments(profile.id);
    const medicalRecord = findPatientMedicalRecord(profile.id);
    const medicalNotes = listPatientMedicalNotes(profile.id);

    const now = new Date();

    const upcomingAppointments = appointments.filter(
        (appointment) => {
            if (appointment.status !== "SCHEDULED") {
                return false;
            }

            const appointmentDateTime = parseLocalDateTime(
                appointment.scheduledDate,
                appointment.startTime
            );

            return Boolean(
                appointmentDateTime &&
                appointmentDateTime > now
            );
        }
    ).length;

    return {
        profile,
        appointments,
        medicalRecord,
        medicalNotes,
        summary: {
            upcomingAppointments,
            completedAppointments: appointments.filter(
                (appointment) =>
                    appointment.status === "COMPLETED"
            ).length,
            cancelledAppointments: appointments.filter(
                (appointment) =>
                    appointment.status === "CANCELLED"
            ).length,
            medicalNotes: medicalNotes.length,
        },
    };
}

export function updateProfileForPatient(params: {
    userId: string;
    input: PatientUpdateProfileInput;
}): PatientProfileDTO {
    const profile = requirePatientProfile(params.userId);

    return updatePatientProfile({
        patientId: profile.id,
        phone: params.input.phone.trim(),
        address: params.input.address.trim(),
    });
}

export function cancelAppointmentForPatient(params: {
    userId: string;
    input: PatientCancelAppointmentInput;
}): PatientAppointmentDTO {
    const profile = requirePatientProfile(params.userId);

    const appointment = requireOwnedAppointment({
        appointmentId: params.input.appointmentId,
        patientId: profile.id,
    });

    validateAppointmentCanBeChanged(appointment);

    const database = getDb();

    const transaction = database.transaction(() => {
        const currentAppointment = requireOwnedAppointment({
            appointmentId: appointment.id,
            patientId: profile.id,
        });

        validateAppointmentCanBeChanged(currentAppointment);

        return cancelPatientAppointment({
            appointmentId: currentAppointment.id,
            patientId: profile.id,
            cancellationReason: params.input.reason.trim(),
            cancelledByUserId: params.userId,
        });
    });

    return transaction();
}

export function rescheduleAppointmentForPatient(params: {
    userId: string;
    input: PatientRescheduleAppointmentInput;
}): PatientAppointmentDTO {
    const profile = requirePatientProfile(params.userId);

    const appointment = requireOwnedAppointment({
        appointmentId: params.input.appointmentId,
        patientId: profile.id,
    });

    validateAppointmentCanBeChanged(appointment);

    if (
        appointment.scheduledDate ===
        params.input.scheduledDate &&
        appointment.startTime === params.input.startTime
    ) {
        throw new PatientDomainError(
            "La nueva fecha y hora deben ser diferentes a las actuales."
        );
    }

    const newAppointmentDateTime = parseLocalDateTime(
        params.input.scheduledDate,
        params.input.startTime
    );

    if (!newAppointmentDateTime) {
        throw new PatientDomainError(
            "La nueva fecha u hora no es válida."
        );
    }

    validateMinimumAppointmentNotice(
        newAppointmentDateTime
    );

    const weekday = getIsoWeekday(
        newAppointmentDateTime
    );

    const schedule = findPatientDoctorSchedule({
        doctorId: appointment.doctorId,
        weekday,
    });

    if (!schedule) {
        throw new PatientDomainError(
            "El médico no tiene horario disponible para ese día."
        );
    }

    if (
        appointment.durationMinutes !==
        schedule.appointmentDurationMinutes
    ) {
        throw new PatientDomainError(
            `Las citas de ese horario deben durar ${schedule.appointmentDurationMinutes} minutos.`
        );
    }

    const endTime = calculateEndTime({
        startTime: params.input.startTime,
        durationMinutes: appointment.durationMinutes,
    });

    const database = getDb();

    const transaction = database.transaction(() => {
        const currentAppointment =
            requireOwnedAppointment({
                appointmentId: appointment.id,
                patientId: profile.id,
            });

        validateAppointmentCanBeChanged(
            currentAppointment
        );

        const availability =
            checkPatientAppointmentAvailability({
                doctorId: currentAppointment.doctorId,
                weekday,
                scheduledDate:
                    params.input.scheduledDate,
                startTime: params.input.startTime,
                endTime,
                excludedAppointmentId:
                    currentAppointment.id,
            });

        if (!availability.isAvailable) {
            throw new PatientDomainError(
                getAvailabilityErrorMessage(
                    availability.reason
                )
            );
        }

        return reschedulePatientAppointment({
            appointmentId: currentAppointment.id,
            patientId: profile.id,
            scheduledDate:
                params.input.scheduledDate,
            startTime: params.input.startTime,
            endTime,
        });
    });

    return transaction();
}