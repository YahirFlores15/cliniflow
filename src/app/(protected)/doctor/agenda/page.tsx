import { DoctorAppointmentsCalendar } from "@/app/(protected)/doctor/agenda/doctor-appointments-calendar";
import { CalendarRange, Clock3, FileHeart, NotebookPen, } from "lucide-react";
import { getDoctorAgenda } from "@/server/modules/doctor/doctor.service";
import { buttonVariants, } from "@/components/ui/button";
import { requireRole } from "@/server/auth/session";
import { ROLES } from "@/shared/constants/roles";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";


export default async function DoctorAgendaPage() {
    const session =
        await requireRole([
            ROLES.DOCTOR,
        ]);

    const agenda =
        getDoctorAgenda({
            userId:
                session.user.id,
        });

    const calendarAppointments =
        agenda.appointments.map(
            (appointment) => ({
                id:
                    appointment.id,
                title:
                    appointment.patientName,
                subtitle:
                    appointment.reason ??
                    "Sin motivo registrado",

                doctorId:
                    agenda.doctor.id,
                doctorName:
                    agenda.doctor.name,
                doctorSpecialty:
                    agenda.doctor.specialty,

                patientId:
                    appointment.patientId,
                patientName:
                    appointment.patientName,
                patientEmail:
                    appointment.patientEmail,
                patientPhone:
                    appointment.patientPhone,
                patientBirthDate:
                    appointment.patientBirthDate,

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

                hasMedicalNote:
                    appointment.hasMedicalNote,
            })
        );

    const calendarDoctor = {
        id:
            agenda.doctor.id,
        name:
            agenda.doctor.name,
        specialty:
            agenda.doctor.specialty,
    };

    const scheduledCount =
        agenda.appointments.filter(
            (appointment) =>
                appointment.status ===
                "SCHEDULED"
        ).length;

    const withoutNoteCount =
        agenda.appointments.filter(
            (appointment) =>
                appointment.status !==
                "CANCELLED" &&
                !appointment.hasMedicalNote
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
                        Área médica
                    </p>

                    <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                        Agenda de consultas
                    </h2>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground-muted">
                        Consulta tus citas en formato semanal o mensual y abre los datos clínicos desde cada evento.
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                        <Badge variant="primary">
                            {
                                scheduledCount
                            }{" "}
                            programadas
                        </Badge>

                        <Badge variant="warning">
                            {
                                withoutNoteCount
                            }{" "}
                            sin nota
                        </Badge>

                        <Badge variant="neutral">
                            {
                                agenda.appointments
                                    .length
                            }{" "}
                            citas totales
                        </Badge>
                    </div>
                </div>

                <div className="flex flex-col gap-3 sm:min-w-56">
                    <Link
                        href="/doctor/patients"
                        className={cn(
                            buttonVariants({
                                variant:
                                    "outline",
                                size: "lg",
                            }),
                            "w-full justify-start"
                        )}
                    >
                        <FileHeart className="size-4.5" />
                        Ver pacientes
                    </Link>

                    <Link
                        href="/doctor/schedule"
                        className={cn(
                            buttonVariants({
                                variant:
                                    "outline",
                                size: "lg",
                            }),
                            "w-full justify-start"
                        )}
                    >
                        <Clock3 className="size-4.5" />
                        Ver horarios
                    </Link>
                </div>
            </section>

            {agenda.appointments.length ===
                0 ? (
                <section className="rounded-3xl border border-dashed border-border bg-surface p-8 text-center shadow-[var(--shadow-sm)]">
                    <CalendarRange className="mx-auto size-10 text-primary" />

                    <h3 className="mt-4 text-lg font-semibold text-foreground">
                        No tienes citas registradas
                    </h3>

                    <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-foreground-muted">
                        Cuando recepción programe una consulta para tu perfil médico, aparecerá en este calendario.
                    </p>
                </section>
            ) : (
                <DoctorAppointmentsCalendar
                    appointments={
                        calendarAppointments
                    }
                    doctor={
                        calendarDoctor
                    }
                    schedules={
                        agenda.schedules
                    }
                    blocks={
                        agenda.blocks
                    }
                />
            )}

            <section className="rounded-2xl border border-primary-border bg-primary-soft p-5">
                <div className="flex items-start gap-3">
                    <NotebookPen className="mt-0.5 size-5 shrink-0 text-primary" />

                    <div>
                        <p className="text-sm font-semibold text-foreground">
                            Flujo clínico
                        </p>

                        <p className="mt-1 text-xs leading-5 text-foreground-muted">
                            Selecciona una cita para consultar al paciente, abrir su expediente o registrar la nota médica correspondiente.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}