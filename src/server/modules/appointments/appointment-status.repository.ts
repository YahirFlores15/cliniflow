import { getDb, } from "@/server/db/connection";


const db =
    getDb();

export type CompletePastAppointmentsRepositoryInput = {
    currentDate: string;
    currentTime: string;
};

export function completePastScheduledAppointments(
    input:
        CompletePastAppointmentsRepositoryInput
): number {
    const result =
        db.prepare(
            `
            UPDATE appointments
            SET
                status = 'COMPLETED',
                updated_at = CURRENT_TIMESTAMP
            WHERE status = 'SCHEDULED'
              AND (
                  scheduled_date < ?
                  OR (
                      scheduled_date = ?
                      AND end_time <= ?
                  )
              )
            `
        ).run(
            input.currentDate,
            input.currentDate,
            input.currentTime
        );

    return result.changes;
}