import type { DoctorProfileDTO, DoctorScheduleDTO, UpsertDoctorScheduleRepositoryInput, } from "@/shared/dtos/doctor.dtos";
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
    default_appointment_duration_minutes:
    | 30
    | 60;
    is_active: number;
};

type DoctorScheduleRow = {
    id: string;
    doctor_id: string;
    weekday: number;
    start_time: string;
    end_time: string;
    appointment_duration_minutes:
    | 30
    | 60;
    is_active: number;
    created_at: string;
    updated_at: string;
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
        licenseNumber:
            row.license_number,
        defaultAppointmentDurationMinutes:
            row.default_appointment_duration_minutes,
        isActive:
            row.is_active === 1,
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
        isActive:
            row.is_active === 1,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

export function findScheduleDoctorProfileByUserId(
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
                ON users.id =
                    doctor_profiles.user_id
            WHERE doctor_profiles.user_id = ?
              AND users.role = 'DOCTOR'
            LIMIT 1
            `
        )
        .get(
            userId
        ) as
        | DoctorProfileRow
        | undefined;

    return row
        ? mapDoctorProfileRow(row)
        : null;
}

export function listSchedulesForDoctor(
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
            ORDER BY
                weekday ASC
            `
        )
        .all(
            doctorId
        ) as DoctorScheduleRow[];

    return rows.map(
        mapDoctorScheduleRow
    );
}

export function findScheduleForDoctorDay(
    params: {
        doctorId: string;
        weekday: number;
    }
): DoctorScheduleDTO | null {
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
        ) as
        | DoctorScheduleRow
        | undefined;

    return row
        ? mapDoctorScheduleRow(row)
        : null;
}

export function hasFutureScheduledAppointmentsOnWeekday(
    params: {
        doctorId: string;
        weekday: number;
        today: string;
    }
): boolean {
    const row = db
        .prepare(
            `
            SELECT
                appointments.id
            FROM appointments
            WHERE appointments.doctor_id = ?
              AND appointments.status =
                    'SCHEDULED'
              AND appointments.scheduled_date
                    >= ?
              AND (
                  CASE
                      WHEN CAST(
                          strftime(
                              '%w',
                              appointments.scheduled_date
                          )
                          AS INTEGER
                      ) = 0
                          THEN 7
                      ELSE CAST(
                          strftime(
                              '%w',
                              appointments.scheduled_date
                          )
                          AS INTEGER
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
        ) as
        | {
            id: string;
        }
        | undefined;

    return Boolean(
        row
    );
}

export function hasFutureAppointmentsOutsideNewSchedule(
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
            SELECT
                appointments.id
            FROM appointments
            WHERE appointments.doctor_id = ?
              AND appointments.status =
                    'SCHEDULED'
              AND appointments.scheduled_date
                    >= ?
              AND (
                  CASE
                      WHEN CAST(
                          strftime(
                              '%w',
                              appointments.scheduled_date
                          )
                          AS INTEGER
                      ) = 0
                          THEN 7
                      ELSE CAST(
                          strftime(
                              '%w',
                              appointments.scheduled_date
                          )
                          AS INTEGER
                      )
                  END
              ) = ?
              AND (
                  appointments.start_time
                    < ?
                  OR appointments.end_time
                    > ?
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
        ) as
        | {
            id: string;
        }
        | undefined;

    return Boolean(
        row
    );
}

export function upsertScheduleForDoctor(
    params:
        UpsertDoctorScheduleRepositoryInput
): DoctorScheduleDTO {
    const scheduleId =
        nanoid();

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

        ON CONFLICT (
            doctor_id,
            weekday
        )
        DO UPDATE SET
            start_time =
                excluded.start_time,
            end_time =
                excluded.end_time,
            appointment_duration_minutes =
                excluded.appointment_duration_minutes,
            is_active =
                excluded.is_active,
            updated_at =
                CURRENT_TIMESTAMP
        `
    ).run(
        scheduleId,
        params.doctorId,
        params.weekday,
        params.startTime,
        params.endTime,
        params.appointmentDurationMinutes,
        params.isActive
            ? 1
            : 0
    );

    const schedule =
        findScheduleForDoctorDay({
            doctorId:
                params.doctorId,
            weekday:
                params.weekday,
        });

    if (!schedule) {
        throw new Error(
            "No se pudo recuperar el horario guardado."
        );
    }

    return schedule;
}