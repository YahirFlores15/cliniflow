import { getStaffAppointments, getStaffDoctors, } from "@/server/modules/staff/staff.service";
import { AppointmentCalendar } from "@/components/calendar/appointment-calendar";
import { CalendarPlus, CalendarRange, } from "lucide-react";
import { requireRole } from "@/server/auth/session";
import { ROLES } from "@/shared/constants/roles";
import { Button } from "@/components/ui/button";


export default async function StaffAppointmentsPage() {
    await requireRole([ROLES.STAFF]);

    const appointments =
        getStaffAppointments();

    const doctors =
        getStaffDoctors();

    const calendarAppointments =
        appointments.map(
            (appointment) => ({
                id: appointment.id,
                title:
                    appointment.patientName,
                subtitle:
                    appointment.doctorName,
                doctorId:
                    appointment.doctorId,
                doctorName:
                    appointment.doctorName,
                patientName:
                    appointment.patientName,
                scheduledDate:
                    appointment.scheduledDate,
                startTime:
                    appointment.startTime,
                endTime:
                    appointment.endTime,
                durationMinutes:
                    appointment.durationMinutes,
                status:
                    appointment.status,
                reason:
                    appointment.reason,
            })
        );

    const calendarDoctors =
        doctors.map((doctor) => ({
            id: doctor.id,
            name: doctor.name,
            specialty:
                doctor.specialty,
        }));

    return (
        <div className="flex flex-col gap-6">
            <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <div className="flex size-12 items-center justify-center rounded-2xl border border-primary-border bg-primary-soft text-primary">
                        <CalendarRange
                            className="size-6"
                            strokeWidth={1.9}
                        />
                    </div>

                    <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-primary">
                        Recepción
                    </p>

                    <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                        Calendario de citas
                    </h2>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground-muted">
                        Consulta la agenda semanal o mensual y filtra las citas por médico.
                    </p>
                </div>

                <Button
                    type="button"
                    size="lg"
                    disabled
                    title="Disponible en el siguiente bloque"
                >
                    <CalendarPlus className="size-4.5" />
                    Nueva cita
                </Button>
            </section>

            <AppointmentCalendar
                appointments={
                    calendarAppointments
                }
                doctors={
                    calendarDoctors
                }
            />
        </div>
    );
}