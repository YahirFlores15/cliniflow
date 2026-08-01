import { ArrowLeft, CalendarClock, Clock3, FileCheck2, Mail, NotebookPen, Phone, ShieldCheck, Stethoscope, UserRound, } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { MedicalNoteView } from "@/app/(protected)/doctor/appointments/note/medical-note-view";
import { MedicalNoteForm } from "@/app/(protected)/doctor/appointments/note/medical-note-form";
import { getDoctorMedicalNotePage } from "@/server/modules/doctor/doctor-note.service";
import type { DoctorAppointmentDTO, } from "@/shared/dtos/doctor.dtos";
import { formatFullDate } from "@/components/calendar/calendar.utils";
import { buttonVariants, } from "@/components/ui/button";
import { requireRole } from "@/server/auth/session";
import { ROLES } from "@/shared/constants/roles";
import { Badge } from "@/components/ui/badge";
import { notFound } from "next/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";


type DoctorMedicalNotePageProps = {
    searchParams: Promise<{
        appointmentId?: string;
    }>;
};

function getAppointmentStatusLabel(
    status: DoctorAppointmentDTO["status"]
): string {
    if (status === "COMPLETED") {
        return "Completada";
    }

    if (status === "CANCELLED") {
        return "Cancelada";
    }

    return "Programada";
}

function getAppointmentStatusVariant(
    status: DoctorAppointmentDTO["status"]
):
    | "success"
    | "danger"
    | "primary" {
    if (status === "COMPLETED") {
        return "success";
    }

    if (status === "CANCELLED") {
        return "danger";
    }

    return "primary";
}

function getPatientAge(
    birthDate: string | null
): string | null {
    if (!birthDate) {
        return null;
    }

    const match =
        /^(\d{4})-(\d{2})-(\d{2})$/.exec(
            birthDate
        );

    if (!match) {
        return null;
    }

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);

    const today = new Date();

    let age =
        today.getFullYear() -
        year;

    const birthdayHasNotPassed =
        today.getMonth() + 1 <
        month ||
        (
            today.getMonth() + 1 ===
            month &&
            today.getDate() <
            day
        );

    if (birthdayHasNotPassed) {
        age -= 1;
    }

    return `${age} años`;
}

export default async function DoctorMedicalNotePage({
    searchParams,
}: DoctorMedicalNotePageProps) {
    const session =
        await requireRole([
            ROLES.DOCTOR,
        ]);

    const resolvedSearchParams =
        await searchParams;

    const appointmentId =
        resolvedSearchParams
            .appointmentId
            ?.trim();

    if (!appointmentId) {
        notFound();
    }

    const pageData =
        getDoctorMedicalNotePage({
            userId:
                session.user.id,
            appointmentId,
        });

    if (!pageData) {
        notFound();
    }

    const {
        doctor,
        appointment,
        note,
        canCreateNote,
        creationBlockedReason,
    } = pageData;

    const patientAge =
        getPatientAge(
            appointment.patientBirthDate
        );

    return (
        <div className="flex flex-col gap-6">
            <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <Link
                        href="/doctor/agenda"
                        className={cn(
                            buttonVariants({
                                variant:
                                    "ghost",
                                size: "sm",
                            }),
                            "-ml-3"
                        )}
                    >
                        <ArrowLeft className="size-4" />
                        Volver a la agenda
                    </Link>

                    <div className="mt-5 flex size-12 items-center justify-center rounded-2xl border border-primary-border bg-primary-soft text-primary">
                        {note ? (
                            <FileCheck2
                                className="size-6"
                                strokeWidth={1.9}
                            />
                        ) : (
                            <NotebookPen
                                className="size-6"
                                strokeWidth={1.9}
                            />
                        )}
                    </div>

                    <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-primary">
                        Consulta médica
                    </p>

                    <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                        {note
                            ? "Nota médica"
                            : "Registrar nota médica"}
                    </h2>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground-muted">
                        {note
                            ? "Consulta la información clínica registrada para esta cita."
                            : "Documenta el resultado clínico de la consulta y completa la cita."}
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Badge
                        variant={getAppointmentStatusVariant(
                            appointment.status
                        )}
                    >
                        {getAppointmentStatusLabel(
                            appointment.status
                        )}
                    </Badge>

                    {note ? (
                        <Badge variant="success">
                            Nota registrada
                        </Badge>
                    ) : (
                        <Badge variant="neutral">
                            Sin nota
                        </Badge>
                    )}
                </div>
            </section>

            <section className="grid gap-4 xl:grid-cols-[1.4fr_0.6fr]">
                <Card>
                    <CardHeader>
                        <div className="flex items-start gap-3">
                            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary-border bg-primary-soft text-primary">
                                <UserRound className="size-5" />
                            </div>

                            <div className="min-w-0">
                                <CardTitle>
                                    {appointment.patientName}
                                </CardTitle>

                                <CardDescription>
                                    Paciente asociado a la consulta seleccionada.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-2xl border border-border bg-surface-muted p-4">
                            <div className="flex items-center gap-2 text-primary">
                                <Mail className="size-4" />

                                <p className="text-xs font-bold uppercase tracking-[0.1em]">
                                    Correo
                                </p>
                            </div>

                            <p className="mt-2 break-all text-sm font-semibold text-foreground">
                                {appointment.patientEmail}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-border bg-surface-muted p-4">
                            <div className="flex items-center gap-2 text-secondary">
                                <Phone className="size-4" />

                                <p className="text-xs font-bold uppercase tracking-[0.1em]">
                                    Contacto
                                </p>
                            </div>

                            <p className="mt-2 text-sm font-semibold text-foreground">
                                {appointment.patientPhone ??
                                    "Sin teléfono registrado"}
                            </p>

                            {patientAge ? (
                                <p className="mt-1 text-xs text-foreground-muted">
                                    {patientAge}
                                </p>
                            ) : null}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>
                            Médico responsable
                        </CardTitle>

                        <CardDescription>
                            La nota quedará asociada a este perfil.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <div className="flex items-start gap-3">
                            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-secondary-border bg-secondary-soft text-secondary">
                                <Stethoscope className="size-5" />
                            </div>

                            <div>
                                <p className="text-sm font-semibold text-foreground">
                                    {doctor.name}
                                </p>

                                <p className="mt-1 text-xs text-foreground-muted">
                                    {doctor.specialty ??
                                        "Especialidad no registrada"}
                                </p>

                                {doctor.licenseNumber ? (
                                    <p className="mt-2 text-xs font-medium text-foreground-muted">
                                        Cédula{" "}
                                        {doctor.licenseNumber}
                                    </p>
                                ) : null}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </section>

            <section className="grid gap-4 sm:grid-cols-2">
                <Card>
                    <CardContent className="flex items-start gap-3">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary-border bg-primary-soft text-primary">
                            <CalendarClock className="size-5" />
                        </div>

                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.1em] text-foreground-muted">
                                Fecha de consulta
                            </p>

                            <p className="mt-2 text-sm font-semibold capitalize text-foreground">
                                {formatFullDate(
                                    appointment.scheduledDate
                                )}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="flex items-start gap-3">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-secondary-border bg-secondary-soft text-secondary">
                            <Clock3 className="size-5" />
                        </div>

                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.1em] text-foreground-muted">
                                Horario
                            </p>

                            <p className="mt-2 text-sm font-semibold text-foreground">
                                {appointment.startTime}
                                {" – "}
                                {appointment.endTime}
                            </p>

                            <p className="mt-1 text-xs text-foreground-muted">
                                {appointment.durationMinutes} minutos
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </section>

            <Card>
                <CardHeader>
                    <CardTitle>
                        Motivo registrado en la cita
                    </CardTitle>

                    <CardDescription>
                        Información proporcionada al momento de programar la consulta.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <div className="rounded-2xl border border-border bg-surface-muted p-4">
                        <p className="whitespace-pre-wrap text-sm leading-6 text-foreground">
                            {appointment.reason ??
                                "No se registró un motivo para esta consulta."}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {note ? (
                <MedicalNoteView
                    note={note}
                />
            ) : canCreateNote ? (
                <MedicalNoteForm
                    appointment={appointment}
                />
            ) : (
                <section className="rounded-3xl border border-warning-border bg-warning-soft p-6 shadow-[var(--shadow-sm)]">
                    <div className="flex items-start gap-3">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-warning-border bg-surface text-warning-hover">
                            <ShieldCheck className="size-5" />
                        </div>

                        <div>
                            <h3 className="text-base font-semibold text-foreground">
                                La nota médica no puede registrarse
                            </h3>

                            <p className="mt-2 text-sm leading-6 text-foreground-muted">
                                {creationBlockedReason ??
                                    "La consulta no cumple las condiciones necesarias para registrar una nota."}
                            </p>

                            <Link
                                href="/doctor/agenda"
                                className={cn(
                                    buttonVariants({
                                        variant:
                                            "outline",
                                        size: "md",
                                    }),
                                    "mt-5"
                                )}
                            >
                                <ArrowLeft className="size-4" />
                                Regresar a la agenda
                            </Link>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}