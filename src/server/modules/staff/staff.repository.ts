import type { AppointmentAvailabilityDTO, AppointmentDTO, CancelAppointmentRepositoryInput, CreateAppointmentRepositoryInput, CreatePatientRepositoryInput, DoctorBlockDTO, DoctorOptionDTO, DoctorScheduleDTO, PatientDTO, RescheduleAppointmentRepositoryInput, UpdatePatientRepositoryInput, } from "@/shared/dtos/staff.dtos";
import type { AppointmentStatus, PatientSex, } from "@/shared/schemas/staff.schemas";
import { getDb } from "@/server/db/connection";
import { nanoid } from "nanoid";


const db = getDb();

type PatientRow = {
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

type DoctorOptionRow = {
    id: string;
    user_id: string;
    name: string;
    email: string;
    specialty: string | null;
    license_number: string | null;
    default_appointment_duration_minutes: 30 | 60;
    is_active: number;
};

type DoctorScheduleRow = {
    id: string;
    doctor_id: string;
    weekday: number;
    start_time: string;
    end_time: string;
    appointment_duration_minutes: 30 | 60;
    is_active: number;
};

type DoctorBlockRow = {
    id: string;
    doctor_id: string;
    start_datetime: string;
    end_datetime: string;
    reason: string | null;
};

type AppointmentRow = {
    id: string;
    patient_id: string;
    patient_user_id: string;
    patient_name: string;
    patient_email: string;
    doctor_id: string;
    doctor_user_id: string;
    doctor_name: string;
    specialty: string | null;
    scheduled_date: string;
    start_time: string;
    end_time: string;
    duration_minutes: 30 | 60;
    status: AppointmentStatus;
    reason: string | null;
    cancellation_reason: string | null;
    cancelled_at: string | null;
    cancelled_by_user_id: string | null;
    created_by_user_id: string;
    created_at: string;
    updated_at: string;
};

function mapPatientRow(row: PatientRow): PatientDTO {
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

function mapDoctorOptionRow(row: DoctorOptionRow): DoctorOptionDTO {
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
    };
}

function mapDoctorBlockRow(row: DoctorBlockRow): DoctorBlockDTO {
    return {
        id: row.id,
        doctorId: row.doctor_id,
        startDateTime: row.start_datetime,
        endDateTime: row.end_datetime,
        reason: row.reason,
    };
}

function mapAppointmentRow(row: AppointmentRow): AppointmentDTO {
    return {
        id: row.id,
        patientId: row.patient_id,
        patientUserId: row.patient_user_id,
        patientName: row.patient_name,
        patientEmail: row.patient_email,
        doctorId: row.doctor_id,
        doctorUserId: row.doctor_user_id,
        doctorName: row.doctor_name,
        specialty: row.specialty,
        scheduledDate: row.scheduled_date,
        startTime: row.start_time,
        endTime: row.end_time,
        durationMinutes: row.duration_minutes,
        status: row.status,
        reason: row.reason,
        cancellationReason: row.cancellation_reason,
        cancelledAt: row.cancelled_at,
        cancelledByUserId: row.cancelled_by_user_id,
        createdByUserId: row.created_by_user_id,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

const appointmentSelect = `
    SELECT
        appointments.id,
        appointments.patient_id,
        patient_users.id AS patient_user_id,
        patient_users.name AS patient_name,
        patient_users.email AS patient_email,
        appointments.doctor_id,
        doctor_users.id AS doctor_user_id,
        doctor_users.name AS doctor_name,
        doctor_profiles.specialty,
        appointments.scheduled_date,
        appointments.start_time,
        appointments.end_time,
        appointments.duration_minutes,
        appointments.status,
        appointments.reason,
        appointments.cancellation_reason,
        appointments.cancelled_at,
        appointments.cancelled_by_user_id,
        appointments.created_by_user_id,
        appointments.created_at,
        appointments.updated_at
    FROM appointments
    INNER JOIN patient_profiles
        ON patient_profiles.id = appointments.patient_id
    INNER JOIN users AS patient_users
        ON patient_users.id = patient_profiles.user_id
    INNER JOIN doctor_profiles
        ON doctor_profiles.id = appointments.doctor_id
    INNER JOIN users AS doctor_users
        ON doctor_users.id = doctor_profiles.user_id
`;

export function listPatients(searchQuery = ""): PatientDTO[] {
    const normalizedQuery = searchQuery.trim();

    if (!normalizedQuery) {
        const rows = db
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
                WHERE users.role = 'PATIENT'
                ORDER BY users.name COLLATE NOCASE ASC
                `
            )
            .all() as PatientRow[];

        return rows.map(mapPatientRow);
    }

    const likeQuery = `%${normalizedQuery}%`;

    const rows = db
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
            WHERE users.role = 'PATIENT'
              AND (
                  users.name LIKE ? COLLATE NOCASE
                  OR users.email LIKE ? COLLATE NOCASE
                  OR COALESCE(patient_profiles.phone, '') LIKE ?
              )
            ORDER BY users.name COLLATE NOCASE ASC
            `
        )
        .all(likeQuery, likeQuery, likeQuery) as PatientRow[];

    return rows.map(mapPatientRow);
}

export function findPatientById(
    patientId: string
): PatientDTO | null {
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
        .get(patientId) as PatientRow | undefined;

    return row ? mapPatientRow(row) : null;
}

export function patientEmailExists(email: string): boolean {
    const row = db
        .prepare(
            `
            SELECT id
            FROM users
            WHERE email = ?
            LIMIT 1
            `
        )
        .get(email) as { id: string } | undefined;

    return Boolean(row);
}

export function patientEmailExistsForAnotherUser(params: {
    email: string;
    patientId: string;
}): boolean {
    const row = db
        .prepare(
            `
            SELECT users.id
            FROM users
            INNER JOIN patient_profiles
                ON patient_profiles.user_id = users.id
            WHERE users.email = ?
              AND patient_profiles.id != ?
            LIMIT 1
            `
        )
        .get(params.email, params.patientId) as
        | { id: string }
        | undefined;

    return Boolean(row);
}

export function createPatient(
    params: CreatePatientRepositoryInput
): PatientDTO {
    const createTransaction = db.transaction(() => {
        const userId = nanoid();
        const patientId = nanoid();

        db.prepare(
            `
            INSERT INTO users (
                id,
                name,
                email,
                password_hash,
                role,
                is_active
            )
            VALUES (?, ?, ?, ?, 'PATIENT', 1)
            `
        ).run(
            userId,
            params.name,
            params.email,
            params.passwordHash
        );

        db.prepare(
            `
            INSERT INTO patient_profiles (
                id,
                user_id,
                phone,
                birth_date,
                sex,
                address
            )
            VALUES (?, ?, ?, ?, ?, ?)
            `
        ).run(
            patientId,
            userId,
            params.phone,
            params.birthDate,
            params.sex,
            params.address || null
        );

        const patient = findPatientById(patientId);

        if (!patient) {
            throw new Error("No se pudo crear el paciente.");
        }

        return patient;
    });

    return createTransaction();
}

export function updatePatient(
    params: UpdatePatientRepositoryInput
): PatientDTO {
    const updateTransaction = db.transaction(() => {
        const patient = findPatientById(params.patientId);

        if (!patient) {
            throw new Error("El paciente no existe.");
        }

        db.prepare(
            `
            UPDATE users
            SET name = ?,
                email = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
            `
        ).run(params.name, params.email, patient.userId);

        db.prepare(
            `
            UPDATE patient_profiles
            SET phone = ?,
                birth_date = ?,
                sex = ?,
                address = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
            `
        ).run(
            params.phone,
            params.birthDate,
            params.sex,
            params.address || null,
            params.patientId
        );

        const updatedPatient = findPatientById(params.patientId);

        if (!updatedPatient) {
            throw new Error("No se pudo actualizar el paciente.");
        }

        return updatedPatient;
    });

    return updateTransaction();
}

export function listActiveDoctors(): DoctorOptionDTO[] {
    const rows = db
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
            WHERE users.role = 'DOCTOR'
              AND users.is_active = 1
            ORDER BY users.name COLLATE NOCASE ASC
            `
        )
        .all() as DoctorOptionRow[];

    return rows.map(mapDoctorOptionRow);
}

export function findDoctorById(
    doctorId: string
): DoctorOptionDTO | null {
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
            WHERE doctor_profiles.id = ?
              AND users.role = 'DOCTOR'
            LIMIT 1
            `
        )
        .get(doctorId) as DoctorOptionRow | undefined;

    return row ? mapDoctorOptionRow(row) : null;
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
                is_active
            FROM doctor_schedules
            WHERE doctor_id = ?
              AND weekday = ?
              AND is_active = 1
            LIMIT 1
            `
        )
        .get(params.doctorId, params.weekday) as
        | DoctorScheduleRow
        | undefined;

    return row ? mapDoctorScheduleRow(row) : null;
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
                is_active
            FROM doctor_schedules
            WHERE doctor_id = ?
            ORDER BY weekday ASC
            `
        )
        .all(doctorId) as DoctorScheduleRow[];

    return rows.map(mapDoctorScheduleRow);
}

export function listDoctorBlocks(params: {
    doctorId: string;
    fromDateTime?: string;
    toDateTime?: string;
}): DoctorBlockDTO[] {
    if (params.fromDateTime && params.toDateTime) {
        const rows = db
            .prepare(
                `
                SELECT
                    id,
                    doctor_id,
                    start_datetime,
                    end_datetime,
                    reason
                FROM doctor_blocks
                WHERE doctor_id = ?
                  AND start_datetime < ?
                  AND end_datetime > ?
                ORDER BY start_datetime ASC
                `
            )
            .all(
                params.doctorId,
                params.toDateTime,
                params.fromDateTime
            ) as DoctorBlockRow[];

        return rows.map(mapDoctorBlockRow);
    }

    const rows = db
        .prepare(
            `
            SELECT
                id,
                doctor_id,
                start_datetime,
                end_datetime,
                reason
            FROM doctor_blocks
            WHERE doctor_id = ?
            ORDER BY start_datetime ASC
            `
        )
        .all(params.doctorId) as DoctorBlockRow[];

    return rows.map(mapDoctorBlockRow);
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

export function hasAppointmentOverlap(params: {
    doctorId: string;
    scheduledDate: string;
    startTime: string;
    endTime: string;
    excludedAppointmentId?: string;
}): boolean {
    if (params.excludedAppointmentId) {
        const row = db
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

        return Boolean(row);
    }

    const row = db
        .prepare(
            `
            SELECT id
            FROM appointments
            WHERE doctor_id = ?
              AND scheduled_date = ?
              AND status = 'SCHEDULED'
              AND start_time < ?
              AND end_time > ?
            LIMIT 1
            `
        )
        .get(
            params.doctorId,
            params.scheduledDate,
            params.endTime,
            params.startTime
        ) as { id: string } | undefined;

    return Boolean(row);
}

export function checkAppointmentAvailability(params: {
    doctorId: string;
    weekday: number;
    scheduledDate: string;
    startTime: string;
    endTime: string;
    excludedAppointmentId?: string;
}): AppointmentAvailabilityDTO {
    const doctor = findDoctorById(params.doctorId);

    if (!doctor) {
        return {
            isAvailable: false,
            reason: "DOCTOR_NOT_FOUND",
        };
    }

    if (!doctor.isActive) {
        return {
            isAvailable: false,
            reason: "DOCTOR_INACTIVE",
        };
    }

    const schedule = findDoctorSchedule({
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

    const startDateTime = `${params.scheduledDate}T${params.startTime}`;
    const endDateTime = `${params.scheduledDate}T${params.endTime}`;

    if (
        hasDoctorBlockOverlap({
            doctorId: params.doctorId,
            startDateTime,
            endDateTime,
        })
    ) {
        return {
            isAvailable: false,
            reason: "BLOCKED",
        };
    }

    if (
        hasAppointmentOverlap({
            doctorId: params.doctorId,
            scheduledDate: params.scheduledDate,
            startTime: params.startTime,
            endTime: params.endTime,
            excludedAppointmentId: params.excludedAppointmentId,
        })
    ) {
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

export function listAppointments(params?: {
    scheduledDate?: string;
    doctorId?: string;
    patientId?: string;
    status?: AppointmentStatus;
}): AppointmentDTO[] {
    const conditions: string[] = [];
    const values: string[] = [];

    if (params?.scheduledDate) {
        conditions.push("appointments.scheduled_date = ?");
        values.push(params.scheduledDate);
    }

    if (params?.doctorId) {
        conditions.push("appointments.doctor_id = ?");
        values.push(params.doctorId);
    }

    if (params?.patientId) {
        conditions.push("appointments.patient_id = ?");
        values.push(params.patientId);
    }

    if (params?.status) {
        conditions.push("appointments.status = ?");
        values.push(params.status);
    }

    const whereClause =
        conditions.length > 0
            ? `WHERE ${conditions.join(" AND ")}`
            : "";

    const rows = db
        .prepare(
            `
            ${appointmentSelect}
            ${whereClause}
            ORDER BY
                appointments.scheduled_date ASC,
                appointments.start_time ASC
            `
        )
        .all(...values) as AppointmentRow[];

    return rows.map(mapAppointmentRow);
}

export function findAppointmentById(
    appointmentId: string
): AppointmentDTO | null {
    const row = db
        .prepare(
            `
            ${appointmentSelect}
            WHERE appointments.id = ?
            LIMIT 1
            `
        )
        .get(appointmentId) as AppointmentRow | undefined;

    return row ? mapAppointmentRow(row) : null;
}

export function createAppointment(
    params: CreateAppointmentRepositoryInput
): AppointmentDTO {
    const appointmentId = nanoid();

    db.prepare(
        `
        INSERT INTO appointments (
            id,
            patient_id,
            doctor_id,
            scheduled_date,
            start_time,
            end_time,
            duration_minutes,
            status,
            reason,
            created_by_user_id
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, 'SCHEDULED', ?, ?)
        `
    ).run(
        appointmentId,
        params.patientId,
        params.doctorId,
        params.scheduledDate,
        params.startTime,
        params.endTime,
        params.durationMinutes,
        params.reason,
        params.createdByUserId
    );

    const appointment = findAppointmentById(appointmentId);

    if (!appointment) {
        throw new Error("No se pudo crear la cita.");
    }

    return appointment;
}

export function cancelAppointment(
    params: CancelAppointmentRepositoryInput
): AppointmentDTO {
    db.prepare(
        `
        UPDATE appointments
        SET status = 'CANCELLED',
            cancellation_reason = ?,
            cancelled_at = CURRENT_TIMESTAMP,
            cancelled_by_user_id = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        `
    ).run(
        params.cancellationReason || null,
        params.cancelledByUserId,
        params.appointmentId
    );

    const appointment = findAppointmentById(params.appointmentId);

    if (!appointment) {
        throw new Error("No se pudo cancelar la cita.");
    }

    return appointment;
}

export function rescheduleAppointment(
    params: RescheduleAppointmentRepositoryInput
): AppointmentDTO {
    db.prepare(
        `
        UPDATE appointments
        SET scheduled_date = ?,
            start_time = ?,
            end_time = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        `
    ).run(
        params.scheduledDate,
        params.startTime,
        params.endTime,
        params.appointmentId
    );

    const appointment = findAppointmentById(params.appointmentId);

    if (!appointment) {
        throw new Error("No se pudo reagendar la cita.");
    }

    return appointment;
}