import type { DoctorAppointmentDTO, DoctorProfileDTO, } from "@/shared/dtos/doctor.dtos";
import type { DoctorAppointmentStatus, } from "@/shared/schemas/doctor.schemas";
import { getDb } from "@/server/db/connection";


const db = getDb();

type DoctorProfileRow = {
    id: string;
    user_id: string;
    name: string;
    email: string;
    specialty: string | null;
    license_number: string | null;
    default_appointment_duration_minutes: 30 | 60;
    is_active: number;
};

type DoctorAppointmentRow = {
    id: string;
    patient_id: string;
    patient_user_id: string;
    patient_name: string;
    patient_email: string;
    patient_phone: string | null;
    patient_birth_date: string | null;
    scheduled_date: string;
    start_time: string;
    end_time: string;
    duration_minutes: 30 | 60;
    status: DoctorAppointmentStatus;
    reason: string | null;
    cancellation_reason: string | null;
    created_at: string;
    updated_at: string;
    has_medical_note: number;
};

function mapDoctorProfileRow(
    row: DoctorProfileRow
): DoctorProfileDTO {
    return {
        id: row.id,
        userId: row.user_id,
        name: row.name,
        email: row.email,
        specialty: row.specialty,
        licenseNumber: row.license_number,
        defaultAppointmentDurationMinutes:
            row.default_appointment_duration_minutes,
        isActive: row.is_active === 1,
    };
}

function mapDoctorAppointmentRow(
    row: DoctorAppointmentRow
): DoctorAppointmentDTO {
    return {
        id: row.id,
        patientId: row.patient_id,
        patientUserId: row.patient_user_id,
        patientName: row.patient_name,
        patientEmail: row.patient_email,
        patientPhone: row.patient_phone,
        patientBirthDate: row.patient_birth_date,
        scheduledDate: row.scheduled_date,
        startTime: row.start_time,
        endTime: row.end_time,
        durationMinutes: row.duration_minutes,
        status: row.status,
        reason: row.reason,
        cancellationReason: row.cancellation_reason,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        hasMedicalNote: row.has_medical_note === 1,
    };
}

export function findDoctorProfileByUserId(
    userId: string
): DoctorProfileDTO | null {
    const row = db
        .prepare(
            `
            SELECT
                doctor_profiles.id,
                doctor_profiles.user_id,
                users.name,
                users.email,
                doctor_profiles.specialty,
                doctor_profiles.license_number,
                doctor_profiles.default_appointment_duration_minutes,
                users.is_active
            FROM doctor_profiles
            INNER JOIN users
                ON users.id = doctor_profiles.user_id
            WHERE doctor_profiles.user_id = ?
              AND users.role = 'DOCTOR'
            LIMIT 1
            `
        )
        .get(userId) as DoctorProfileRow | undefined;

    return row ? mapDoctorProfileRow(row) : null;
}

export function listAppointmentsForDoctor(params: {
    doctorId: string;
    scheduledDate?: string;
    status?: DoctorAppointmentStatus;
}): DoctorAppointmentDTO[] {
    const conditions = [
        "appointments.doctor_id = ?",
    ];

    const values: string[] = [params.doctorId];

    if (params.scheduledDate) {
        conditions.push(
            "appointments.scheduled_date = ?"
        );
        values.push(params.scheduledDate);
    }

    if (params.status) {
        conditions.push("appointments.status = ?");
        values.push(params.status);
    }

    const rows = db
        .prepare(
            `
            SELECT
                appointments.id,
                appointments.patient_id,
                patient_users.id AS patient_user_id,
                patient_users.name AS patient_name,
                patient_users.email AS patient_email,
                patient_profiles.phone AS patient_phone,
                patient_profiles.birth_date AS patient_birth_date,
                appointments.scheduled_date,
                appointments.start_time,
                appointments.end_time,
                appointments.duration_minutes,
                appointments.status,
                appointments.reason,
                appointments.cancellation_reason,
                appointments.created_at,
                appointments.updated_at,
                CASE
                    WHEN medical_notes.id IS NULL THEN 0
                    ELSE 1
                END AS has_medical_note
            FROM appointments
            INNER JOIN patient_profiles
                ON patient_profiles.id =
                    appointments.patient_id
            INNER JOIN users AS patient_users
                ON patient_users.id =
                    patient_profiles.user_id
            LEFT JOIN medical_notes
                ON medical_notes.appointment_id =
                    appointments.id
            WHERE ${conditions.join(" AND ")}
            ORDER BY
                appointments.scheduled_date ASC,
                appointments.start_time ASC
            `
        )
        .all(...values) as DoctorAppointmentRow[];

    return rows.map(mapDoctorAppointmentRow);
}