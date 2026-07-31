import type { CancelPatientAppointmentRepositoryInput, PatientAppointmentAvailabilityDTO, PatientAppointmentDTO, PatientDoctorScheduleDTO, PatientMedicalNoteDTO, PatientMedicalRecordDTO, PatientProfileDTO, ReschedulePatientAppointmentRepositoryInput, UpdatePatientProfileRepositoryInput, } from "@/shared/dtos/patient.dtos";
import type { PatientAppointmentStatus, PatientSex, } from "@/shared/schemas/patient.schemas";
import { getDb } from "@/server/db/connection";


const db = getDb();

type PatientProfileRow = {
    id: string;
    user_id: string;
    name: string;
    email: string;
    phone: string | null;
    birth_date: string | null;
    sex: PatientSex | null;
    address: string | null;
    is_active: number;
    created_at: string;
    updated_at: string;
};

type PatientAppointmentRow = {
    id: string;
    patient_id: string;
    doctor_id: string;
    doctor_user_id: string;
    doctor_name: string;
    doctor_email: string;
    specialty: string | null;
    license_number: string | null;
    scheduled_date: string;
    start_time: string;
    end_time: string;
    duration_minutes: 30 | 60;
    status: PatientAppointmentStatus;
    reason: string | null;
    cancellation_reason: string | null;
    cancelled_at: string | null;
    created_at: string;
    updated_at: string;
    has_medical_note: number;
};

type PatientMedicalRecordRow = {
    id: string;
    patient_id: string;
    allergies: string | null;
    chronic_diseases: string | null;
    current_medications: string | null;
    emergency_contact_name: string | null;
    emergency_contact_phone: string | null;
    created_at: string;
    updated_at: string;
};

type PatientMedicalNoteRow = {
    id: string;
    appointment_id: string;
    doctor_id: string;
    doctor_name: string;
    doctor_specialty: string | null;
    scheduled_date: string;
    start_time: string;
    end_time: string;
    consultation_reason: string;
    diagnosis: string;
    treatment: string | null;
    prescription_text: string | null;
    instructions_text: string | null;
    created_at: string;
    updated_at: string;
};

type PatientDoctorScheduleRow = {
    id: string;
    doctor_id: string;
    weekday: number;
    start_time: string;
    end_time: string;
    appointment_duration_minutes: 30 | 60;
    is_active: number;
};

function mapPatientProfileRow(
    row: PatientProfileRow
): PatientProfileDTO {
    return {
        id: row.id,
        userId: row.user_id,
        name: row.name,
        email: row.email,
        phone: row.phone,
        birthDate: row.birth_date,
        sex: row.sex,
        address: row.address,
        isActive: row.is_active === 1,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

function mapPatientAppointmentRow(
    row: PatientAppointmentRow
): PatientAppointmentDTO {
    return {
        id: row.id,
        patientId: row.patient_id,
        doctorId: row.doctor_id,
        doctorUserId: row.doctor_user_id,
        doctorName: row.doctor_name,
        doctorEmail: row.doctor_email,
        specialty: row.specialty,
        licenseNumber: row.license_number,
        scheduledDate: row.scheduled_date,
        startTime: row.start_time,
        endTime: row.end_time,
        durationMinutes: row.duration_minutes,
        status: row.status,
        reason: row.reason,
        cancellationReason: row.cancellation_reason,
        cancelledAt: row.cancelled_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        hasMedicalNote: row.has_medical_note === 1,
    };
}

function mapPatientMedicalRecordRow(
    row: PatientMedicalRecordRow
): PatientMedicalRecordDTO {
    return {
        id: row.id,
        patientId: row.patient_id,
        allergies: row.allergies,
        chronicDiseases: row.chronic_diseases,
        currentMedications: row.current_medications,
        emergencyContactName: row.emergency_contact_name,
        emergencyContactPhone: row.emergency_contact_phone,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

function mapPatientMedicalNoteRow(
    row: PatientMedicalNoteRow
): PatientMedicalNoteDTO {
    return {
        id: row.id,
        appointmentId: row.appointment_id,
        doctorId: row.doctor_id,
        doctorName: row.doctor_name,
        doctorSpecialty: row.doctor_specialty,
        scheduledDate: row.scheduled_date,
        startTime: row.start_time,
        endTime: row.end_time,
        consultationReason: row.consultation_reason,
        diagnosis: row.diagnosis,
        treatment: row.treatment,
        prescriptionText: row.prescription_text,
        instructionsText: row.instructions_text,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

function mapPatientDoctorScheduleRow(
    row: PatientDoctorScheduleRow
): PatientDoctorScheduleDTO {
    return {
        id: row.id,
        doctorId: row.doctor_id,
        weekday: row.weekday,
        startTime: row.start_time,
        endTime: row.end_time,
        appointmentDurationMinutes:
            row.appointment_duration_minutes,
        isActive: row.is_active === 1,
    };
}

const patientAppointmentSelect = `
    SELECT
        appointments.id,
        appointments.patient_id,
        appointments.doctor_id,
        doctor_users.id AS doctor_user_id,
        doctor_users.name AS doctor_name,
        doctor_users.email AS doctor_email,
        doctor_profiles.specialty,
        doctor_profiles.license_number,
        appointments.scheduled_date,
        appointments.start_time,
        appointments.end_time,
        appointments.duration_minutes,
        appointments.status,
        appointments.reason,
        appointments.cancellation_reason,
        appointments.cancelled_at,
        appointments.created_at,
        appointments.updated_at,
        CASE
            WHEN medical_notes.id IS NULL THEN 0
            ELSE 1
        END AS has_medical_note
    FROM appointments
    INNER JOIN doctor_profiles
        ON doctor_profiles.id = appointments.doctor_id
    INNER JOIN users AS doctor_users
        ON doctor_users.id = doctor_profiles.user_id
    LEFT JOIN medical_notes
        ON medical_notes.appointment_id = appointments.id
`;

export function findPatientProfileByUserId(
    userId: string
): PatientProfileDTO | null {
    const row = db
        .prepare(
            `
            SELECT
                patient_profiles.id,
                patient_profiles.user_id,
                users.name,
                users.email,
                patient_profiles.phone,
                patient_profiles.birth_date,
                patient_profiles.sex,
                patient_profiles.address,
                users.is_active,
                patient_profiles.created_at,
                patient_profiles.updated_at
            FROM patient_profiles
            INNER JOIN users
                ON users.id = patient_profiles.user_id
            WHERE patient_profiles.user_id = ?
              AND users.role = 'PATIENT'
            LIMIT 1
            `
        )
        .get(userId) as PatientProfileRow | undefined;

    return row ? mapPatientProfileRow(row) : null;
}

export function findPatientAppointmentById(params: {
    appointmentId: string;
    patientId: string;
}): PatientAppointmentDTO | null {
    const row = db
        .prepare(
            `
            ${patientAppointmentSelect}
            WHERE appointments.id = ?
              AND appointments.patient_id = ?
            LIMIT 1
            `
        )
        .get(
            params.appointmentId,
            params.patientId
        ) as PatientAppointmentRow | undefined;

    return row ? mapPatientAppointmentRow(row) : null;
}

export function listPatientAppointments(
    patientId: string
): PatientAppointmentDTO[] {
    const rows = db
        .prepare(
            `
            ${patientAppointmentSelect}
            WHERE appointments.patient_id = ?
            ORDER BY
                appointments.scheduled_date DESC,
                appointments.start_time DESC
            `
        )
        .all(patientId) as PatientAppointmentRow[];

    return rows.map(mapPatientAppointmentRow);
}

export function findPatientMedicalRecord(
    patientId: string
): PatientMedicalRecordDTO {
    const row = db
        .prepare(
            `
            SELECT
                id,
                patient_id,
                allergies,
                chronic_diseases,
                current_medications,
                emergency_contact_name,
                emergency_contact_phone,
                created_at,
                updated_at
            FROM medical_records
            WHERE patient_id = ?
            LIMIT 1
            `
        )
        .get(patientId) as PatientMedicalRecordRow | undefined;

    if (!row) {
        return {
            id: null,
            patientId,
            allergies: null,
            chronicDiseases: null,
            currentMedications: null,
            emergencyContactName: null,
            emergencyContactPhone: null,
            createdAt: null,
            updatedAt: null,
        };
    }

    return mapPatientMedicalRecordRow(row);
}

export function listPatientMedicalNotes(
    patientId: string
): PatientMedicalNoteDTO[] {
    const rows = db
        .prepare(
            `
            SELECT
                medical_notes.id,
                medical_notes.appointment_id,
                medical_notes.doctor_id,
                doctor_users.name AS doctor_name,
                doctor_profiles.specialty AS doctor_specialty,
                appointments.scheduled_date,
                appointments.start_time,
                appointments.end_time,
                medical_notes.reason AS consultation_reason,
                medical_notes.diagnosis,
                medical_notes.treatment,
                medical_notes.prescription_text,
                medical_notes.instructions_text,
                medical_notes.created_at,
                medical_notes.updated_at
            FROM medical_notes
            INNER JOIN appointments
                ON appointments.id = medical_notes.appointment_id
            INNER JOIN doctor_profiles
                ON doctor_profiles.id = medical_notes.doctor_id
            INNER JOIN users AS doctor_users
                ON doctor_users.id = doctor_profiles.user_id
            WHERE appointments.patient_id = ?
            ORDER BY
                appointments.scheduled_date DESC,
                appointments.start_time DESC,
                medical_notes.created_at DESC
            `
        )
        .all(patientId) as PatientMedicalNoteRow[];

    return rows.map(mapPatientMedicalNoteRow);
}

export function updatePatientProfile(
    params: UpdatePatientProfileRepositoryInput
): PatientProfileDTO {
    db.prepare(
        `
        UPDATE patient_profiles
        SET phone = ?,
            address = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        `
    ).run(
        params.phone,
        params.address || null,
        params.patientId
    );

    const row = db
        .prepare(
            `
            SELECT
                patient_profiles.id,
                patient_profiles.user_id,
                users.name,
                users.email,
                patient_profiles.phone,
                patient_profiles.birth_date,
                patient_profiles.sex,
                patient_profiles.address,
                users.is_active,
                patient_profiles.created_at,
                patient_profiles.updated_at
            FROM patient_profiles
            INNER JOIN users
                ON users.id = patient_profiles.user_id
            WHERE patient_profiles.id = ?
              AND users.role = 'PATIENT'
            LIMIT 1
            `
        )
        .get(params.patientId) as PatientProfileRow | undefined;

    if (!row) {
        throw new Error(
            "No se pudo actualizar el perfil del paciente."
        );
    }

    return mapPatientProfileRow(row);
}

export function findPatientDoctorSchedule(params: {
    doctorId: string;
    weekday: number;
}): PatientDoctorScheduleDTO | null {
    const row = db
        .prepare(
            `
            SELECT
                id,
                doctor_id,
                weekday,
                start_time,
                end_time,
                appointment_duration_minutes,
                is_active
            FROM doctor_schedules
            WHERE doctor_id = ?
              AND weekday = ?
              AND is_active = 1
            LIMIT 1
            `
        )
        .get(
            params.doctorId,
            params.weekday
        ) as PatientDoctorScheduleRow | undefined;

    return row ? mapPatientDoctorScheduleRow(row) : null;
}

export function checkPatientAppointmentAvailability(params: {
    doctorId: string;
    weekday: number;
    scheduledDate: string;
    startTime: string;
    endTime: string;
    excludedAppointmentId: string;
}): PatientAppointmentAvailabilityDTO {
    const doctor = db
        .prepare(
            `
            SELECT
                doctor_profiles.id,
                users.is_active
            FROM doctor_profiles
            INNER JOIN users
                ON users.id = doctor_profiles.user_id
            WHERE doctor_profiles.id = ?
              AND users.role = 'DOCTOR'
            LIMIT 1
            `
        )
        .get(params.doctorId) as
        | {
            id: string;
            is_active: number;
        }
        | undefined;

    if (!doctor) {
        return {
            isAvailable: false,
            reason: "DOCTOR_NOT_FOUND",
        };
    }

    if (doctor.is_active !== 1) {
        return {
            isAvailable: false,
            reason: "DOCTOR_INACTIVE",
        };
    }

    const schedule = findPatientDoctorSchedule({
        doctorId: params.doctorId,
        weekday: params.weekday,
    });

    if (!schedule) {
        return {
            isAvailable: false,
            reason: "NO_SCHEDULE",
        };
    }

    if (
        params.startTime < schedule.startTime ||
        params.endTime > schedule.endTime
    ) {
        return {
            isAvailable: false,
            reason: "OUTSIDE_SCHEDULE",
        };
    }

    const startDateTime =
        `${params.scheduledDate}T${params.startTime}`;

    const endDateTime =
        `${params.scheduledDate}T${params.endTime}`;

    const block = db
        .prepare(
            `
            SELECT id
            FROM doctor_blocks
            WHERE doctor_id = ?
              AND start_datetime < ?
              AND end_datetime > ?
            LIMIT 1
            `
        )
        .get(
            params.doctorId,
            endDateTime,
            startDateTime
        ) as { id: string } | undefined;

    if (block) {
        return {
            isAvailable: false,
            reason: "BLOCKED",
        };
    }

    const overlappingAppointment = db
        .prepare(
            `
            SELECT id
            FROM appointments
            WHERE doctor_id = ?
              AND scheduled_date = ?
              AND status = 'SCHEDULED'
              AND id != ?
              AND start_time < ?
              AND end_time > ?
            LIMIT 1
            `
        )
        .get(
            params.doctorId,
            params.scheduledDate,
            params.excludedAppointmentId,
            params.endTime,
            params.startTime
        ) as { id: string } | undefined;

    if (overlappingAppointment) {
        return {
            isAvailable: false,
            reason: "OVERLAP",
        };
    }

    return {
        isAvailable: true,
        reason: "AVAILABLE",
    };
}

export function cancelPatientAppointment(
    params: CancelPatientAppointmentRepositoryInput
): PatientAppointmentDTO {
    const result = db
        .prepare(
            `
            UPDATE appointments
            SET status = 'CANCELLED',
                cancellation_reason = ?,
                cancelled_at = CURRENT_TIMESTAMP,
                cancelled_by_user_id = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
              AND patient_id = ?
              AND status = 'SCHEDULED'
            `
        )
        .run(
            params.cancellationReason || null,
            params.cancelledByUserId,
            params.appointmentId,
            params.patientId
        );

    if (result.changes !== 1) {
        throw new Error(
            "No se pudo cancelar la cita del paciente."
        );
    }

    const appointment = findPatientAppointmentById({
        appointmentId: params.appointmentId,
        patientId: params.patientId,
    });

    if (!appointment) {
        throw new Error(
            "No se pudo recuperar la cita cancelada."
        );
    }

    return appointment;
}

export function reschedulePatientAppointment(
    params: ReschedulePatientAppointmentRepositoryInput
): PatientAppointmentDTO {
    const result = db
        .prepare(
            `
            UPDATE appointments
            SET scheduled_date = ?,
                start_time = ?,
                end_time = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
              AND patient_id = ?
              AND status = 'SCHEDULED'
            `
        )
        .run(
            params.scheduledDate,
            params.startTime,
            params.endTime,
            params.appointmentId,
            params.patientId
        );

    if (result.changes !== 1) {
        throw new Error(
            "No se pudo reagendar la cita del paciente."
        );
    }

    const appointment = findPatientAppointmentById({
        appointmentId: params.appointmentId,
        patientId: params.patientId,
    });

    if (!appointment) {
        throw new Error(
            "No se pudo recuperar la cita reagendada."
        );
    }

    return appointment;
}