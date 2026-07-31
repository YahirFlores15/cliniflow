import { cancelAppointment, checkAppointmentAvailability, createAppointment, createPatient, findAppointmentById, findDoctorById, findDoctorSchedule, findPatientById, listActiveDoctors, listAppointments, listPatients, patientEmailExists, patientEmailExistsForAnotherUser, rescheduleAppointment, updatePatient, } from "@/server/modules/staff/staff.repository";
import type { AppointmentFilterInput, CancelAppointmentInput, CreateAppointmentInput, CreatePatientInput, RescheduleAppointmentInput, UpdatePatientInput, } from "@/shared/schemas/staff.schemas";
import type { AppointmentDTO, DoctorOptionDTO, PatientDTO, } from "@/shared/dtos/staff.dtos";
import { getDb } from "@/server/db/connection";
import { hash } from "bcryptjs";


const MINIMUM_APPOINTMENT_NOTICE_HOURS = 8;

export class StaffDomainError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "StaffDomainError";
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

function parseLocalDateTime(date: string, time: string): Date | null {
    const parsedDate = parseCalendarDate(date);
    const timeMatch = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(time);

    if (!parsedDate || !timeMatch) {
        return null;
    }

    const hours = Number(timeMatch[1]);
    const minutes = Number(timeMatch[2]);

    parsedDate.setHours(hours, minutes, 0, 0);

    return parsedDate;
}

function getIsoWeekday(date: Date): number {
    const weekday = date.getDay();

    return weekday === 0 ? 7 : weekday;
}

function minutesToTime(totalMinutes: number): string {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
        2,
        "0"
    )}`;
}

function calculateEndTime(params: {
    startTime: string;
    durationMinutes: number;
}): string {
    const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(params.startTime);

    if (!match) {
        throw new StaffDomainError("La hora de inicio no es válida.");
    }

    const startMinutes = Number(match[1]) * 60 + Number(match[2]);
    const endMinutes = startMinutes + params.durationMinutes;

    if (endMinutes > 24 * 60) {
        throw new StaffDomainError(
            "La cita no puede terminar después de la medianoche."
        );
    }

    return minutesToTime(endMinutes);
}

function validateBirthDate(birthDate: string): void {
    const parsedBirthDate = parseCalendarDate(birthDate);

    if (!parsedBirthDate) {
        throw new StaffDomainError(
            "La fecha de nacimiento no es una fecha válida."
        );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (parsedBirthDate > today) {
        throw new StaffDomainError(
            "La fecha de nacimiento no puede estar en el futuro."
        );
    }
}

function validateMinimumAppointmentNotice(
    appointmentDateTime: Date,
    now = new Date()
): void {
    const minimumDateTime = new Date(
        now.getTime() +
        MINIMUM_APPOINTMENT_NOTICE_HOURS * 60 * 60 * 1000
    );

    if (appointmentDateTime < minimumDateTime) {
        throw new StaffDomainError(
            "La cita debe agendarse con al menos 8 horas de anticipación."
        );
    }
}

function getAvailabilityErrorMessage(
    reason:
        | "AVAILABLE"
        | "DOCTOR_NOT_FOUND"
        | "DOCTOR_INACTIVE"
        | "NO_SCHEDULE"
        | "OUTSIDE_SCHEDULE"
        | "BLOCKED"
        | "OVERLAP"
): string {
    switch (reason) {
        case "DOCTOR_NOT_FOUND":
            return "El doctor seleccionado no existe.";

        case "DOCTOR_INACTIVE":
            return "El doctor seleccionado está desactivado.";

        case "NO_SCHEDULE":
            return "El doctor no tiene horario disponible para ese día.";

        case "OUTSIDE_SCHEDULE":
            return "La cita queda fuera del horario laboral del doctor.";

        case "BLOCKED":
            return "El horario seleccionado está bloqueado por el doctor.";

        case "OVERLAP":
            return "El doctor ya tiene otra cita en ese horario.";

        case "AVAILABLE":
            return "El horario está disponible.";
    }
}

function assertPatientCanReceiveAppointments(patientId: string): PatientDTO {
    const patient = findPatientById(patientId);

    if (!patient) {
        throw new StaffDomainError("El paciente seleccionado no existe.");
    }

    if (!patient.isActive) {
        throw new StaffDomainError(
            "No se pueden agendar citas para un paciente desactivado."
        );
    }

    return patient;
}

function validateAppointmentStatusForChanges(
    appointment: AppointmentDTO
): void {
    if (appointment.status === "COMPLETED") {
        throw new StaffDomainError(
            "Una cita completada no se puede modificar."
        );
    }

    if (appointment.status === "CANCELLED") {
        throw new StaffDomainError(
            "Una cita cancelada no se puede modificar."
        );
    }
}

export function getStaffPatients(searchQuery = ""): PatientDTO[] {
    return listPatients(searchQuery);
}

export function getStaffDoctors(): DoctorOptionDTO[] {
    return listActiveDoctors();
}

export function getStaffAppointments(
    filters?: AppointmentFilterInput
): AppointmentDTO[] {
    return listAppointments({
        scheduledDate: filters?.date,
        doctorId: filters?.doctorId || undefined,
        patientId: filters?.patientId || undefined,
        status: filters?.status,
    });
}

export async function createPatientForStaff(
    input: CreatePatientInput
): Promise<PatientDTO> {
    validateBirthDate(input.birthDate);

    const normalizedEmail = input.email.trim().toLowerCase();

    if (patientEmailExists(normalizedEmail)) {
        throw new StaffDomainError(
            "Ya existe un usuario registrado con ese email."
        );
    }

    const passwordHash = await hash(input.password, 10);

    return createPatient({
        name: input.name.trim(),
        email: normalizedEmail,
        passwordHash,
        phone: input.phone.trim(),
        birthDate: input.birthDate,
        sex: input.sex,
        address: input.address.trim(),
    });
}

export function updatePatientForStaff(
    input: UpdatePatientInput
): PatientDTO {
    validateBirthDate(input.birthDate);

    const patient = findPatientById(input.patientId);

    if (!patient) {
        throw new StaffDomainError("El paciente no existe.");
    }

    const normalizedEmail = input.email.trim().toLowerCase();

    if (
        patientEmailExistsForAnotherUser({
            email: normalizedEmail,
            patientId: input.patientId,
        })
    ) {
        throw new StaffDomainError(
            "Otro usuario ya utiliza ese email."
        );
    }

    return updatePatient({
        patientId: input.patientId,
        name: input.name.trim(),
        email: normalizedEmail,
        phone: input.phone.trim(),
        birthDate: input.birthDate,
        sex: input.sex,
        address: input.address.trim(),
    });
}

export function createAppointmentForStaff(params: {
    input: CreateAppointmentInput;
    createdByUserId: string;
}): AppointmentDTO {
    const appointmentDateTime = parseLocalDateTime(
        params.input.scheduledDate,
        params.input.startTime
    );

    if (!appointmentDateTime) {
        throw new StaffDomainError(
            "La fecha u hora de la cita no es válida."
        );
    }

    validateMinimumAppointmentNotice(appointmentDateTime);
    assertPatientCanReceiveAppointments(params.input.patientId);

    const doctor = findDoctorById(params.input.doctorId);

    if (!doctor) {
        throw new StaffDomainError(
            "El doctor seleccionado no existe."
        );
    }

    if (!doctor.isActive) {
        throw new StaffDomainError(
            "El doctor seleccionado está desactivado."
        );
    }

    const weekday = getIsoWeekday(appointmentDateTime);

    const schedule = findDoctorSchedule({
        doctorId: params.input.doctorId,
        weekday,
    });

    if (!schedule) {
        throw new StaffDomainError(
            "El doctor no tiene horario disponible para ese día."
        );
    }

    if (
        params.input.durationMinutes !==
        schedule.appointmentDurationMinutes
    ) {
        throw new StaffDomainError(
            `Las citas de este horario deben durar ${schedule.appointmentDurationMinutes} minutos.`
        );
    }

    const endTime = calculateEndTime({
        startTime: params.input.startTime,
        durationMinutes: params.input.durationMinutes,
    });

    const database = getDb();

    const transaction = database.transaction(() => {
        const availability = checkAppointmentAvailability({
            doctorId: params.input.doctorId,
            weekday,
            scheduledDate: params.input.scheduledDate,
            startTime: params.input.startTime,
            endTime,
        });

        if (!availability.isAvailable) {
            throw new StaffDomainError(
                getAvailabilityErrorMessage(availability.reason)
            );
        }

        return createAppointment({
            patientId: params.input.patientId,
            doctorId: params.input.doctorId,
            scheduledDate: params.input.scheduledDate,
            startTime: params.input.startTime,
            endTime,
            durationMinutes: params.input.durationMinutes,
            reason: params.input.reason.trim(),
            createdByUserId: params.createdByUserId,
        });
    });

    return transaction();
}

export function rescheduleAppointmentForStaff(
    input: RescheduleAppointmentInput
): AppointmentDTO {
    const appointment = findAppointmentById(input.appointmentId);

    if (!appointment) {
        throw new StaffDomainError("La cita no existe.");
    }

    validateAppointmentStatusForChanges(appointment);
    assertPatientCanReceiveAppointments(appointment.patientId);

    const appointmentDateTime = parseLocalDateTime(
        input.scheduledDate,
        input.startTime
    );

    if (!appointmentDateTime) {
        throw new StaffDomainError(
            "La nueva fecha u hora no es válida."
        );
    }

    validateMinimumAppointmentNotice(appointmentDateTime);

    const weekday = getIsoWeekday(appointmentDateTime);

    const schedule = findDoctorSchedule({
        doctorId: appointment.doctorId,
        weekday,
    });

    if (!schedule) {
        throw new StaffDomainError(
            "El doctor no tiene horario disponible para ese día."
        );
    }

    if (
        appointment.durationMinutes !==
        schedule.appointmentDurationMinutes
    ) {
        throw new StaffDomainError(
            `Las citas de este horario deben durar ${schedule.appointmentDurationMinutes} minutos.`
        );
    }

    const endTime = calculateEndTime({
        startTime: input.startTime,
        durationMinutes: appointment.durationMinutes,
    });

    const database = getDb();

    const transaction = database.transaction(() => {
        const currentAppointment = findAppointmentById(
            input.appointmentId
        );

        if (!currentAppointment) {
            throw new StaffDomainError("La cita no existe.");
        }

        validateAppointmentStatusForChanges(currentAppointment);

        const availability = checkAppointmentAvailability({
            doctorId: currentAppointment.doctorId,
            weekday,
            scheduledDate: input.scheduledDate,
            startTime: input.startTime,
            endTime,
            excludedAppointmentId: currentAppointment.id,
        });

        if (!availability.isAvailable) {
            throw new StaffDomainError(
                getAvailabilityErrorMessage(availability.reason)
            );
        }

        return rescheduleAppointment({
            appointmentId: currentAppointment.id,
            scheduledDate: input.scheduledDate,
            startTime: input.startTime,
            endTime,
        });
    });

    return transaction();
}

export function cancelAppointmentForStaff(params: {
    input: CancelAppointmentInput;
    cancelledByUserId: string;
}): AppointmentDTO {
    const appointment = findAppointmentById(
        params.input.appointmentId
    );

    if (!appointment) {
        throw new StaffDomainError("La cita no existe.");
    }

    if (appointment.status === "COMPLETED") {
        throw new StaffDomainError(
            "Una cita completada no se puede cancelar."
        );
    }

    if (appointment.status === "CANCELLED") {
        throw new StaffDomainError(
            "La cita ya se encuentra cancelada."
        );
    }

    return cancelAppointment({
        appointmentId: appointment.id,
        cancellationReason: params.input.reason.trim(),
        cancelledByUserId: params.cancelledByUserId,
    });
}