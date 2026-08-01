import type { DoctorPatientRecordDTO, DoctorRelatedPatientDTO, UpdateDoctorPatientRecordRepositoryInput, } from "@/shared/dtos/doctor-patient.dtos";
import { getDb } from "@/server/db/connection";
import { nanoid } from "nanoid";


const db = getDb();

type DoctorRelatedPatientRow = {
    patient_id: string;
    patient_user_id: string;

    name: string;
    email: string;
    phone: string | null;
    birth_date: string | null;

    appointment_count: number;
    medical_note_count: number;

    last_appointment_datetime:
    | string
    | null;

    next_appointment_datetime:
    | string
    | null;

    has_medical_record: number;
};

type DoctorPatientRecordRow = {
    id: string | null;

    patient_id: string;
    patient_user_id: string;

    patient_name: string;
    patient_email: string;
    patient_phone: string | null;
    patient_birth_date: string | null;

    allergies: string | null;
    chronic_diseases: string | null;
    current_medications: string | null;

    emergency_contact_name:
    | string
    | null;

    emergency_contact_phone:
    | string
    | null;

    created_at: string | null;
    updated_at: string | null;

    appointment_count: number;
    medical_note_count: number;

    last_appointment_datetime:
    | string
    | null;

    next_appointment_datetime:
    | string
    | null;
};

function mapDoctorRelatedPatientRow(
    row: DoctorRelatedPatientRow
): DoctorRelatedPatientDTO {
    return {
        patientId:
            row.patient_id,

        patientUserId:
            row.patient_user_id,

        name:
            row.name,

        email:
            row.email,

        phone:
            row.phone,

        birthDate:
            row.birth_date,

        appointmentCount:
            row.appointment_count,

        medicalNoteCount:
            row.medical_note_count,

        lastAppointmentDateTime:
            row.last_appointment_datetime,

        nextAppointmentDateTime:
            row.next_appointment_datetime,

        hasMedicalRecord:
            row.has_medical_record === 1,
    };
}

function mapDoctorPatientRecordRow(
    row: DoctorPatientRecordRow
): DoctorPatientRecordDTO {
    return {
        id:
            row.id,

        patientId:
            row.patient_id,

        patientUserId:
            row.patient_user_id,

        patientName:
            row.patient_name,

        patientEmail:
            row.patient_email,

        patientPhone:
            row.patient_phone,

        patientBirthDate:
            row.patient_birth_date,

        allergies:
            row.allergies,

        chronicDiseases:
            row.chronic_diseases,

        currentMedications:
            row.current_medications,

        emergencyContactName:
            row.emergency_contact_name,

        emergencyContactPhone:
            row.emergency_contact_phone,

        createdAt:
            row.created_at,

        updatedAt:
            row.updated_at,

        appointmentCount:
            row.appointment_count,

        medicalNoteCount:
            row.medical_note_count,

        lastAppointmentDateTime:
            row.last_appointment_datetime,

        nextAppointmentDateTime:
            row.next_appointment_datetime,
    };
}

export function listRelatedPatientsForDoctor(
    params: {
        doctorId: string;
        searchQuery?: string;
        currentDateTime: string;
    }
): DoctorRelatedPatientDTO[] {
    const normalizedSearch =
        params.searchQuery
            ?.trim() ?? "";

    const likeSearch =
        `%${normalizedSearch}%`;

    const rows = db
        .prepare(
            `
            SELECT
                patient_profiles.id
                    AS patient_id,

                patient_users.id
                    AS patient_user_id,

                patient_users.name,
                patient_users.email,

                patient_profiles.phone,
                patient_profiles.birth_date,

                COUNT(
                    DISTINCT appointments.id
                ) AS appointment_count,

                COUNT(
                    DISTINCT medical_notes.id
                ) AS medical_note_count,

                MAX(
                    CASE
                        WHEN (
                            appointments.scheduled_date
                            || 'T'
                            || appointments.start_time
                        ) < ?
                        THEN (
                            appointments.scheduled_date
                            || 'T'
                            || appointments.start_time
                        )
                        ELSE NULL
                    END
                ) AS last_appointment_datetime,

                MIN(
                    CASE
                        WHEN appointments.status =
                            'SCHEDULED'
                        AND (
                            appointments.scheduled_date
                            || 'T'
                            || appointments.start_time
                        ) >= ?
                        THEN (
                            appointments.scheduled_date
                            || 'T'
                            || appointments.start_time
                        )
                        ELSE NULL
                    END
                ) AS next_appointment_datetime,

                CASE
                    WHEN medical_records.id
                        IS NULL
                    THEN 0
                    ELSE 1
                END AS has_medical_record

            FROM appointments

            INNER JOIN patient_profiles
                ON patient_profiles.id =
                    appointments.patient_id

            INNER JOIN users
                AS patient_users
                ON patient_users.id =
                    patient_profiles.user_id

            LEFT JOIN medical_notes
                ON medical_notes.appointment_id =
                    appointments.id

            LEFT JOIN medical_records
                ON medical_records.patient_id =
                    patient_profiles.id

            WHERE appointments.doctor_id = ?
              AND (
                  ? = ''
                  OR patient_users.name
                      LIKE ?
                      COLLATE NOCASE
                  OR patient_users.email
                      LIKE ?
                      COLLATE NOCASE
                  OR COALESCE(
                      patient_profiles.phone,
                      ''
                  ) LIKE ?
              )

            GROUP BY
                patient_profiles.id,
                patient_users.id,
                patient_users.name,
                patient_users.email,
                patient_profiles.phone,
                patient_profiles.birth_date,
                medical_records.id

            ORDER BY
                patient_users.name
                    COLLATE NOCASE ASC
            `
        )
        .all(
            params.currentDateTime,
            params.currentDateTime,
            params.doctorId,
            normalizedSearch,
            likeSearch,
            likeSearch,
            likeSearch
        ) as DoctorRelatedPatientRow[];

    return rows.map(
        mapDoctorRelatedPatientRow
    );
}

export function findPatientRecordForDoctor(
    params: {
        doctorId: string;
        patientId: string;
        currentDateTime: string;
    }
): DoctorPatientRecordDTO | null {
    const row = db
        .prepare(
            `
            SELECT
                medical_records.id,

                patient_profiles.id
                    AS patient_id,

                patient_users.id
                    AS patient_user_id,

                patient_users.name
                    AS patient_name,

                patient_users.email
                    AS patient_email,

                patient_profiles.phone
                    AS patient_phone,

                patient_profiles.birth_date
                    AS patient_birth_date,

                medical_records.allergies,

                medical_records.chronic_diseases,

                medical_records.current_medications,

                medical_records.emergency_contact_name,

                medical_records.emergency_contact_phone,

                medical_records.created_at,
                medical_records.updated_at,

                (
                    SELECT COUNT(*)
                    FROM appointments
                        AS appointment_count_source
                    WHERE appointment_count_source.doctor_id = ?
                      AND appointment_count_source.patient_id =
                          patient_profiles.id
                ) AS appointment_count,

                (
                    SELECT COUNT(*)
                    FROM medical_notes
                    INNER JOIN appointments
                        AS note_appointments
                        ON note_appointments.id =
                            medical_notes.appointment_id
                    WHERE medical_notes.doctor_id = ?
                      AND note_appointments.patient_id =
                          patient_profiles.id
                ) AS medical_note_count,

                (
                    SELECT MAX(
                        past_appointments.scheduled_date
                        || 'T'
                        || past_appointments.start_time
                    )
                    FROM appointments
                        AS past_appointments
                    WHERE past_appointments.doctor_id = ?
                      AND past_appointments.patient_id =
                          patient_profiles.id
                      AND (
                          past_appointments.scheduled_date
                          || 'T'
                          || past_appointments.start_time
                      ) < ?
                ) AS last_appointment_datetime,

                (
                    SELECT MIN(
                        future_appointments.scheduled_date
                        || 'T'
                        || future_appointments.start_time
                    )
                    FROM appointments
                        AS future_appointments
                    WHERE future_appointments.doctor_id = ?
                      AND future_appointments.patient_id =
                          patient_profiles.id
                      AND future_appointments.status =
                          'SCHEDULED'
                      AND (
                          future_appointments.scheduled_date
                          || 'T'
                          || future_appointments.start_time
                      ) >= ?
                ) AS next_appointment_datetime

            FROM patient_profiles

            INNER JOIN users
                AS patient_users
                ON patient_users.id =
                    patient_profiles.user_id

            LEFT JOIN medical_records
                ON medical_records.patient_id =
                    patient_profiles.id

            WHERE patient_profiles.id = ?
              AND EXISTS (
                  SELECT 1
                  FROM appointments
                  WHERE appointments.doctor_id = ?
                    AND appointments.patient_id =
                        patient_profiles.id
              )

            LIMIT 1
            `
        )
        .get(
            params.doctorId,
            params.doctorId,
            params.doctorId,
            params.currentDateTime,
            params.doctorId,
            params.currentDateTime,
            params.patientId,
            params.doctorId
        ) as
        | DoctorPatientRecordRow
        | undefined;

    return row
        ? mapDoctorPatientRecordRow(row)
        : null;
}

export function upsertDoctorPatientRecord(
    params:
        UpdateDoctorPatientRecordRepositoryInput
): void {
    const recordId =
        nanoid();

    db.prepare(
        `
        INSERT INTO medical_records (
            id,
            patient_id,
            allergies,
            chronic_diseases,
            current_medications,
            emergency_contact_name,
            emergency_contact_phone
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)

        ON CONFLICT (patient_id)
        DO UPDATE SET
            allergies =
                excluded.allergies,

            chronic_diseases =
                excluded.chronic_diseases,

            current_medications =
                excluded.current_medications,

            emergency_contact_name =
                excluded.emergency_contact_name,

            emergency_contact_phone =
                excluded.emergency_contact_phone,

            updated_at =
                CURRENT_TIMESTAMP
        `
    ).run(
        recordId,
        params.patientId,

        params.allergies ||
        null,

        params.chronicDiseases ||
        null,

        params.currentMedications ||
        null,

        params.emergencyContactName ||
        null,

        params.emergencyContactPhone ||
        null
    );
}