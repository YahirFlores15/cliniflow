import { ArrowLeft, CalendarClock, FileHeart, Mail, NotebookPen, Phone, ShieldCheck, UserRound, } from "lucide-react";
import { MedicalRecordForm, } from "@/app/(protected)/doctor/patients/record/medical-record-form";
import { getPatientRecordForDoctor, } from "@/server/modules/doctor/doctor-patient.service";
import { DoctorPatientRecordQuerySchema, } from "@/shared/schemas/doctor-patient.schemas";
import { ActionMessage, } from "@/components/feedback/action-message";
import { Card, CardContent, } from "@/components/ui/card";
import { buttonVariants, } from "@/components/ui/button";
import { requireRole, } from "@/server/auth/session";
import { ROLES, } from "@/shared/constants/roles";
import { Badge, } from "@/components/ui/badge";
import { notFound, } from "next/navigation";
import Link from "next/link";


type DoctorPatientRecordPageProps = {
    searchParams: Promise<{
        patientId?: string;
        updated?: string;
    }>;
};

function formatDate(
    value: string | null
): string {
    if (!value) {
        return "Sin registrar";
    }

    const normalizedValue =
        value.includes("T")
            ? value
            : `${value}T12:00`;

    const parsedDate =
        new Date(
            normalizedValue
        );

    if (
        Number.isNaN(
            parsedDate.getTime()
        )
    ) {
        return value;
    }

    return new Intl.DateTimeFormat(
        "es-MX",
        {
            dateStyle:
                value.includes("T")
                    ? "medium"
                    : "long",

            ...(value.includes("T")
                ? {
                    timeStyle:
                        "short" as const,
                }
                : {}),
        }
    ).format(parsedDate);
}

function calculateAge(
    birthDate: string | null
): number | null {
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

    const year =
        Number(match[1]);

    const month =
        Number(match[2]);

    const day =
        Number(match[3]);

    const today =
        new Date();

    let age =
        today.getFullYear() -
        year;

    const birthdayPending =
        today.getMonth() + 1 <
        month ||
        (
            today.getMonth() + 1 ===
            month &&
            today.getDate() <
            day
        );

    if (birthdayPending) {
        age -= 1;
    }

    return age;
}

export default async function DoctorPatientRecordPage({
    searchParams,
}: DoctorPatientRecordPageProps) {
    const session =
        await requireRole([
            ROLES.DOCTOR,
        ]);

    const resolvedSearchParams =
        await searchParams;

    const parsedQuery =
        DoctorPatientRecordQuerySchema.safeParse({
            patientId:
                resolvedSearchParams.patientId,
        });

    if (!parsedQuery.success) {
        notFound();
    }

    const record =
        getPatientRecordForDoctor({
            userId:
                session.user.id,

            patientId:
                parsedQuery.data.patientId,
        });

    if (!record) {
        notFound();
    }

    const age =
        calculateAge(
            record.patientBirthDate
        );

    return (
        <div className="flex flex-col gap-6">
            <section className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <div className="flex size-12 items-center justify-center rounded-2xl border border-primary-border bg-primary-soft text-primary">
                        <FileHeart
                            className="size-6"
                            strokeWidth={1.9}
                        />
                    </div>

                    <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-primary">
                        Área médica
                    </p>

                    <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                        Expediente clínico
                    </h2>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground-muted">
                        Consulta y actualiza la información clínica permanente del paciente.
                    </p>
                </div>

                <Link
                    href="/doctor/patients"
                    className={buttonVariants({
                        variant:
                            "outline",
                        size: "lg",
                    })}
                >
                    <ArrowLeft className="size-4.5" />

                    Volver a pacientes
                </Link>
            </section>

            {resolvedSearchParams.updated ===
                "1" ? (
                <ActionMessage variant="success">
                    El expediente clínico fue actualizado correctamente.
                </ActionMessage>
            ) : null}

            <Card>
                <CardContent className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
                    <div className="flex min-w-0 items-start gap-4">
                        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-primary-border bg-primary-soft text-primary">
                            <UserRound className="size-6" />
                        </div>

                        <div className="min-w-0">
                            <h3 className="truncate text-xl font-bold text-foreground">
                                {
                                    record.patientName
                                }
                            </h3>

                            <div className="mt-2 flex flex-col gap-1.5 text-sm text-foreground-muted">
                                <p className="flex items-center gap-2">
                                    <Mail className="size-4 shrink-0" />

                                    <span className="truncate">
                                        {
                                            record.patientEmail
                                        }
                                    </span>
                                </p>

                                {record.patientPhone ? (
                                    <p className="flex items-center gap-2">
                                        <Phone className="size-4 shrink-0" />

                                        {
                                            record.patientPhone
                                        }
                                    </p>
                                ) : null}
                            </div>

                            <div className="mt-4 flex flex-wrap gap-2">
                                {age !== null ? (
                                    <Badge variant="neutral">
                                        {age} años
                                    </Badge>
                                ) : null}

                                <Badge
                                    variant={
                                        record.id
                                            ? "success"
                                            : "warning"
                                    }
                                >
                                    {record.id
                                        ? "Expediente existente"
                                        : "Expediente nuevo"}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 rounded-xl border border-primary-border bg-primary-soft px-4 py-3 text-sm font-semibold text-primary">
                        <ShieldCheck className="size-4.5" />

                        Acceso autorizado por cita
                    </div>
                </CardContent>
            </Card>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Card>
                    <CardContent>
                        <CalendarClock className="size-5 text-primary" />

                        <p className="mt-4 text-2xl font-bold text-foreground">
                            {
                                record.appointmentCount
                            }
                        </p>

                        <p className="mt-1 text-sm text-foreground-muted">
                            Citas relacionadas
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent>
                        <NotebookPen className="size-5 text-secondary" />

                        <p className="mt-4 text-2xl font-bold text-foreground">
                            {
                                record.medicalNoteCount
                            }
                        </p>

                        <p className="mt-1 text-sm text-foreground-muted">
                            Notas médicas
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent>
                        <CalendarClock className="size-5 text-warning-hover" />

                        <p className="mt-4 text-sm font-bold text-foreground">
                            {record.nextAppointmentDateTime
                                ? formatDate(
                                    record.nextAppointmentDateTime
                                )
                                : "Sin cita próxima"}
                        </p>

                        <p className="mt-1 text-sm text-foreground-muted">
                            Próxima consulta
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent>
                        <CalendarClock className="size-5 text-foreground-muted" />

                        <p className="mt-4 text-sm font-bold text-foreground">
                            {record.lastAppointmentDateTime
                                ? formatDate(
                                    record.lastAppointmentDateTime
                                )
                                : "Sin cita anterior"}
                        </p>

                        <p className="mt-1 text-sm text-foreground-muted">
                            Última consulta
                        </p>
                    </CardContent>
                </Card>
            </section>

            <MedicalRecordForm
                record={
                    record
                }
            />
        </div>
    );
}