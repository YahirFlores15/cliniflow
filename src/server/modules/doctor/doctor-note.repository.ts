import { getDb } from "@/server/db/connection";


const db = getDb();

export function markAppointmentAsCompleted(params: {
    appointmentId: string;
    doctorId: string;
}): boolean {
    const result = db
        .prepare(
            `
            UPDATE appointments
            SET
                status = 'COMPLETED',
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
              AND doctor_id = ?
              AND status = 'SCHEDULED'
            `
        )
        .run(
            params.appointmentId,
            params.doctorId
        );

    return result.changes === 1;
}