import { PatientAppointmentsCalendar, } from "@/app/(protected)/patient/appointments/patient-appointments-calendar";
import { getPatientAppointmentsWorkspace, } from "@/server/modules/patient/patient-appointments.service";
import { CalendarRange, Info, } from "lucide-react";
import { requireRole, } from "@/server/auth/session";
import { ROLES, } from "@/shared/constants/roles";
import { Badge, } from "@/components/ui/badge";


export default async function PatientAppointmentsPage() {
    const session =
        await requireRole([
            ROLES.PATIENT,
        ]);

    const workspace =
        getPatientAppointmentsWorkspace(
            session.user.id
        );

    const scheduledCount =
        workspace.appointments.filter(
            (
                appointment
            ) =>
                appointment.status ===
                "SCHEDULED"
        ).length;

    const completedCount =
        workspace.appointments.filter(
            (
                appointment
            ) =>
                appointment.status ===
                "COMPLETED"
        ).length;

    const cancelledCount =
        workspace.appointments.filter(
            (
                appointment
            ) =>
                appointment.status ===
                "CANCELLED"
        ).length;

    return (
        <div className="flex flex-col gap-6">
            <section className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <div className="flex size-12 items-center justify-center rounded-2xl border border-primary-border bg-primary-soft text-primary">
                        <CalendarRange
                            className="size-6"
                            strokeWidth={
                                1.9
                            }
                        />
                    </div>

                    <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-primary">
                        Portal del paciente
                    </p>

                    <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                        Mis citas
                    </h2>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground-muted">
                        Consulta tus citas en formato semanal o mensual y selecciona una consulta para revisar sus detalles.
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                        <Badge variant="primary">
                            {
                                scheduledCount
                            }{" "}
                            programadas
                        </Badge>

                        <Badge variant="success">
                            {
                                completedCount
                            }{" "}
                            completadas
                        </Badge>

                        <Badge variant="danger">
                            {
                                cancelledCount
                            }{" "}
                            canceladas
                        </Badge>
                    </div>
                </div>
            </section>

            {workspace.appointments.length >
                0 ? (
                <PatientAppointmentsCalendar
                    appointments={
                        workspace.appointments
                    }
                />
            ) : (
                <section className="rounded-3xl border border-dashed border-border bg-surface px-6 py-14 text-center shadow-[var(--shadow-sm)]">
                    <CalendarRange className="mx-auto size-10 text-primary" />

                    <h3 className="mt-4 text-lg font-semibold text-foreground">
                        No tienes citas registradas
                    </h3>

                    <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-foreground-muted">
                        Cuando recepción programe una consulta para tu cuenta, aparecerá en este calendario.
                    </p>
                </section>
            )}

            <section className="rounded-2xl border border-primary-border bg-primary-soft p-5">
                <div className="flex items-start gap-3">
                    <Info className="mt-0.5 size-5 shrink-0 text-primary" />

                    <div>
                        <p className="text-sm font-semibold text-foreground">
                            Administración de citas
                        </p>

                        <p className="mt-1 text-xs leading-5 text-foreground-muted">
                            Solo puedes cancelar o reagendar citas programadas que todavía no hayan comenzado. El nuevo horario debe respetar la jornada médica, los bloqueos, la disponibilidad y la anticipación mínima de ocho horas.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}