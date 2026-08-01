import { StaffAppointmentsCalendar } from "@/app/(protected)/staff/appointments/staff-appointments-calendar";
import { getStaffAppointments, getStaffDoctors, } from "@/server/modules/staff/staff.service";
import { getStaffCalendarAvailability } from "@/server/modules/staff/staff-calendar.service";
import { ActionMessage } from "@/components/feedback/action-message";
import { CalendarPlus, CalendarRange, } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { requireRole } from "@/server/auth/session";
import { ROLES } from "@/shared/constants/roles";
import Link from "next/link";


type StaffAppointmentsPageProps = {
    searchParams: Promise<{
        created?: string;
    }>;
};

export default async function StaffAppointmentsPage({
    searchParams,
}: StaffAppointmentsPageProps) {
    await requireRole([
        ROLES.STAFF,
    ]);

    const appointments =
        getStaffAppointments();

    const doctors =
        getStaffDoctors();

    const availability =
        getStaffCalendarAvailability();

    const resolvedSearchParams =
        await searchParams;

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
                doctorSpecialty:
                    appointment.specialty,

                patientId:
                    appointment.patientId,
                patientName:
                    appointment.patientName,
                patientEmail:
                    appointment.patientEmail,

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
                cancellationReason:
                    appointment.cancellationReason,
            })
        );

    const calendarDoctors =
        doctors.map(
            (doctor) => ({
                id: doctor.id,
                name: doctor.name,
                specialty:
                    doctor.specialty,
            })
        );

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
                        Selecciona un médico y pulsa una franja disponible para registrar una nueva cita.
                    </p>
                </div>

                <Link
                    href="/staff/appointments/new"
                    className={buttonVariants({
                        variant: "primary",
                        size: "lg",
                    })}
                >
                    <CalendarPlus className="size-4.5" />
                    Nueva cita
                </Link>
            </section>

            {resolvedSearchParams.created ===
                "1" ? (
                <ActionMessage variant="success">
                    La cita fue agendada correctamente y ya aparece en el calendario.
                </ActionMessage>
            ) : null}

            <StaffAppointmentsCalendar
                appointments={
                    calendarAppointments
                }
                doctors={
                    calendarDoctors
                }
                schedules={
                    availability.schedules
                }
                blocks={
                    availability.blocks
                }
            />
        </div>
    );
}