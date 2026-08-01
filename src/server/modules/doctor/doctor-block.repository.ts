import type { DoctorBlockAffectedAppointmentDTO, } from "@/shared/dtos/doctor-block.dtos";
import { getDb } from "@/server/db/connection";


const db = getDb();

type DoctorBlockAffectedAppointmentRow = {
    id: string;
    patient_id: string;
    patient_name: string;
    patient_email: string;
    scheduled_date: string;
    start_time: string;
    end_time: string;
    duration_minutes: 30 | 60;
    reason: string | null;
};

function mapAffectedAppointmentRow(
    row: DoctorBlockAffectedAppointmentRow
): DoctorBlockAffectedAppointmentDTO {
    return {
        id: row.id,
        patientId:
            row.patient_id,
        patientName:
            row.patient_name,
        patientEmail:
            row.patient_email,
        scheduledDate:
            row.scheduled_date,
        startTime:
            row.start_time,
        endTime:
            row.end_time,
        durationMinutes:
            row.duration_minutes,
        reason:
            row.reason,
    };
}

export function listScheduledAppointmentsAffectedByDoctorBlock(
    params: {
        doctorId: string;
        startDateTime: string;
        endDateTime: string;
    }
): DoctorBlockAffectedAppointmentDTO[] {
    const rows = db
        .prepare(
            `
            SELECT
                appointments.id,
                appointments.patient_id,
                patient_users.name
                    AS patient_name,
                patient_users.email
                    AS patient_email,
                appointments.scheduled_date,
                appointments.start_time,
                appointments.end_time,
                appointments.duration_minutes,
                appointments.reason
            FROM appointments
            INNER JOIN patient_profiles
                ON patient_profiles.id =
                    appointments.patient_id
            INNER JOIN users
                AS patient_users
                ON patient_users.id =
                    patient_profiles.user_id
            WHERE appointments.doctor_id = ?
              AND appointments.status =
                    'SCHEDULED'
              AND (
                  appointments.scheduled_date
                  || 'T'
                  || appointments.start_time
              ) < ?
              AND (
                  appointments.scheduled_date
                  || 'T'
                  || appointments.end_time
              ) > ?
            ORDER BY
                appointments.scheduled_date
                    ASC,
                appointments.start_time
                    ASC
            `
        )
        .all(
            params.doctorId,
            params.endDateTime,
            params.startDateTime
        ) as DoctorBlockAffectedAppointmentRow[];

    return rows.map(
        mapAffectedAppointmentRow
    );
}