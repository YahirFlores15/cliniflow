import type { CancelAppointmentsForDoctorBlockRepositoryInput, CreateDoctorBlockRepositoryInput, DoctorAppointmentDTO, DoctorBlockDTO, DoctorProfileDTO, DoctorScheduleDTO, UpsertDoctorScheduleRepositoryInput, } from "@/shared/dtos/doctor.dtos";
import type { DoctorAppointmentStatus, } from "@/shared/schemas/doctor.schemas";
import { getDb } from "@/server/db/connection";
import { nanoid } from "nanoid";


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

type DoctorScheduleRow = {
    id: string;
    doctor_id: string;
    weekday: number;
    start_time: string;
    end_time: string;
    appointment_duration_minutes: 30 | 60;
    is_active: number;
    created_at: string;
    updated_at: string;
};

type DoctorBlockRow = {
    id: string;
    doctor_id: string;
    start_datetime: string;
    end_datetime: string;
    reason: string | null;
    created_at: string;
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

function mapDoctorScheduleRow(
    row: DoctorScheduleRow
): DoctorScheduleDTO {
    return {
        id: row.id,
        doctorId: row.doctor_id,
        weekday: row.weekday,
        startTime: row.start_time,
        endTime: row.end_time,
        appointmentDurationMinutes:
            row.appointment_duration_minutes,
        isActive: row.is_active === 1,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

function mapDoctorBlockRow(
    row: DoctorBlockRow
): DoctorBlockDTO {
    return {
        id: row.id,
        doctorId: row.doctor_id,
        startDateTime: row.start_datetime,
        endDateTime: row.end_datetime,
        reason: row.reason,
        createdAt: row.created_at,
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

export function listDoctorSchedules(
    doctorId: string
): DoctorScheduleDTO[] {
    const rows = db
        .prepare(
            `
            SELECT
                id,
                doctor_id,
                weekday,
                start_time,
                end_time,
                appointment_duration_minutes,
                is_active,
                created_at,
                updated_at
            FROM doctor_schedules
            WHERE doctor_id = ?
            ORDER BY weekday ASC
            `
        )
        .all(doctorId) as DoctorScheduleRow[];

    return rows.map(mapDoctorScheduleRow);
}

export function findDoctorSchedule(params: {
    doctorId: string;
    weekday: number;
}): DoctorScheduleDTO | null {
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
                is_active,
                created_at,
                updated_at
            FROM doctor_schedules
            WHERE doctor_id = ?
              AND weekday = ?
            LIMIT 1
            `
        )
        .get(
            params.doctorId,
            params.weekday
        ) as DoctorScheduleRow | undefined;

    return row ? mapDoctorScheduleRow(row) : null;
}

export function hasFutureScheduledAppointmentsForWeekday(
    params: {
        doctorId: string;
        weekday: number;
        today: string;
    }
): boolean {
    const row = db
        .prepare(
            `
            SELECT appointments.id
            FROM appointments
            WHERE appointments.doctor_id = ?
              AND appointments.status = 'SCHEDULED'
              AND appointments.scheduled_date >= ?
              AND (
                  CASE
                      WHEN CAST(
                          strftime(
                              '%w',
                              appointments.scheduled_date
                          ) AS INTEGER
                      ) = 0
                          THEN 7
                      ELSE CAST(
                          strftime(
                              '%w',
                              appointments.scheduled_date
                          ) AS INTEGER
                      )
                  END
              ) = ?
            LIMIT 1
            `
        )
        .get(
            params.doctorId,
            params.today,
            params.weekday
        ) as { id: string } | undefined;

    return Boolean(row);
}

export function hasFutureAppointmentsOutsideSchedule(
    params: {
        doctorId: string;
        weekday: number;
        today: string;
        startTime: string;
        endTime: string;
    }
): boolean {
    const row = db
        .prepare(
            `
            SELECT appointments.id
            FROM appointments
            WHERE appointments.doctor_id = ?
              AND appointments.status = 'SCHEDULED'
              AND appointments.scheduled_date >= ?
              AND (
                  CASE
                      WHEN CAST(
                          strftime(
                              '%w',
                              appointments.scheduled_date
                          ) AS INTEGER
                      ) = 0
                          THEN 7
                      ELSE CAST(
                          strftime(
                              '%w',
                              appointments.scheduled_date
                          ) AS INTEGER
                      )
                  END
              ) = ?
              AND (
                  appointments.start_time < ?
                  OR appointments.end_time > ?
              )
            LIMIT 1
            `
        )
        .get(
            params.doctorId,
            params.today,
            params.weekday,
            params.startTime,
            params.endTime
        ) as { id: string } | undefined;

    return Boolean(row);
}

export function upsertDoctorSchedule(
    params: UpsertDoctorScheduleRepositoryInput
): DoctorScheduleDTO {
    const scheduleId = nanoid();

    db.prepare(
        `
        INSERT INTO doctor_schedules (
            id,
            doctor_id,
            weekday,
            start_time,
            end_time,
            appointment_duration_minutes,
            is_active
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT (doctor_id, weekday)
        DO UPDATE SET
            start_time = excluded.start_time,
            end_time = excluded.end_time,
            appointment_duration_minutes =
                excluded.appointment_duration_minutes,
            is_active = excluded.is_active,
            updated_at = CURRENT_TIMESTAMP
        `
    ).run(
        scheduleId,
        params.doctorId,
        params.weekday,
        params.startTime,
        params.endTime,
        params.appointmentDurationMinutes,
        params.isActive ? 1 : 0
    );

    const schedule = findDoctorSchedule({
        doctorId: params.doctorId,
        weekday: params.weekday,
    });

    if (!schedule) {
        throw new Error(
            "No se pudo guardar el horario médico."
        );
    }

    return schedule;
}

export function listFutureDoctorBlocks(params: {
    doctorId: string;
    fromDateTime: string;
}): DoctorBlockDTO[] {
    const rows = db
        .prepare(
            `
            SELECT
                id,
                doctor_id,
                start_datetime,
                end_datetime,
                reason,
                created_at
            FROM doctor_blocks
            WHERE doctor_id = ?
              AND end_datetime > ?
            ORDER BY start_datetime ASC
            `
        )
        .all(
            params.doctorId,
            params.fromDateTime
        ) as DoctorBlockRow[];

    return rows.map(mapDoctorBlockRow);
}

export function findDoctorBlockById(params: {
    doctorId: string;
    blockId: string;
}): DoctorBlockDTO | null {
    const row = db
        .prepare(
            `
            SELECT
                id,
                doctor_id,
                start_datetime,
                end_datetime,
                reason,
                created_at
            FROM doctor_blocks
            WHERE doctor_id = ?
              AND id = ?
            LIMIT 1
            `
        )
        .get(
            params.doctorId,
            params.blockId
        ) as DoctorBlockRow | undefined;

    return row ? mapDoctorBlockRow(row) : null;
}

export function hasDoctorBlockOverlap(params: {
    doctorId: string;
    startDateTime: string;
    endDateTime: string;
}): boolean {
    const row = db
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
            params.endDateTime,
            params.startDateTime
        ) as { id: string } | undefined;

    return Boolean(row);
}

export function listScheduledAppointmentIdsAffectedByBlock(
    params: {
        doctorId: string;
        startDateTime: string;
        endDateTime: string;
    }
): string[] {
    const rows = db
        .prepare(
            `
            SELECT id
            FROM appointments
            WHERE doctor_id = ?
              AND status = 'SCHEDULED'
              AND (
                  scheduled_date || 'T' || start_time
              ) < ?
              AND (
                  scheduled_date || 'T' || end_time
              ) > ?
            ORDER BY
                scheduled_date ASC,
                start_time ASC
            `
        )
        .all(
            params.doctorId,
            params.endDateTime,
            params.startDateTime
        ) as Array<{ id: string }>;

    return rows.map((row) => row.id);
}

export function createDoctorBlock(
    params: CreateDoctorBlockRepositoryInput
): DoctorBlockDTO {
    const blockId = nanoid();

    db.prepare(
        `
        INSERT INTO doctor_blocks (
            id,
            doctor_id,
            start_datetime,
            end_datetime,
            reason
        )
        VALUES (?, ?, ?, ?, ?)
        `
    ).run(
        blockId,
        params.doctorId,
        params.startDateTime,
        params.endDateTime,
        params.reason || null
    );

    const block = findDoctorBlockById({
        doctorId: params.doctorId,
        blockId,
    });

    if (!block) {
        throw new Error(
            "No se pudo crear el bloqueo."
        );
    }

    return block;
}

export function cancelAppointmentsForDoctorBlock(
    params: CancelAppointmentsForDoctorBlockRepositoryInput
): number {
    if (params.appointmentIds.length === 0) {
        return 0;
    }

    const placeholders = params.appointmentIds
        .map(() => "?")
        .join(", ");

    const result = db
        .prepare(
            `
            UPDATE appointments
            SET status = 'CANCELLED',
                cancellation_reason = ?,
                cancelled_at = CURRENT_TIMESTAMP,
                cancelled_by_user_id = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE status = 'SCHEDULED'
              AND id IN (${placeholders})
            `
        )
        .run(
            params.cancellationReason,
            params.cancelledByUserId,
            ...params.appointmentIds
        );

    return result.changes;
}

export function deleteDoctorBlock(params: {
    doctorId: string;
    blockId: string;
}): boolean {
    const result = db
        .prepare(
            `
            DELETE FROM doctor_blocks
            WHERE doctor_id = ?
              AND id = ?
            `
        )
        .run(
            params.doctorId,
            params.blockId
        );

    return result.changes > 0;
}