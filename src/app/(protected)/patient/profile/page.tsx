import { Activity, CalendarDays, CheckCircle2, FileHeart, HeartPulse, LockKeyhole, Mail, MapPin, Phone, ShieldCheck, UserRound, } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { getPatientProfileWorkspace, } from "@/server/modules/patient/patient-profile.service";
import { PatientProfileForm, } from "@/app/(protected)/patient/profile/patient-profile-form";
import { buttonVariants, } from "@/components/ui/button";
import { requireRole, } from "@/server/auth/session";
import { ROLES, } from "@/shared/constants/roles";
import { cn, } from "@/lib/utils";
import Link from "next/link";


function formatCalendarDate(
    value:
        string
        | null
): string {
    if (!value) {
        return "No registrada";
    }

    const match =
        /^(\d{4})-(\d{2})-(\d{2})$/.exec(
            value
        );

    if (!match) {
        return value;
    }

    return new Intl.DateTimeFormat(
        "es-MX",
        {
            day:
                "numeric",
            month:
                "long",
            year:
                "numeric",
        }
    ).format(
        new Date(
            Number(
                match[1]
            ),
            Number(
                match[2]
            ) - 1,
            Number(
                match[3]
            )
        )
    );
}

function getPatientSexLabel(
    sex:
        "MALE"
        | "FEMALE"
        | "OTHER"
        | "UNSPECIFIED"
        | null
): string {
    if (
        sex ===
        "MALE"
    ) {
        return "Masculino";
    }

    if (
        sex ===
        "FEMALE"
    ) {
        return "Femenino";
    }

    if (
        sex ===
        "OTHER"
    ) {
        return "Otro";
    }

    if (
        sex ===
        "UNSPECIFIED"
    ) {
        return "Sin especificar";
    }

    return "No registrado";
}

function getRegisteredValue(
    value:
        string
        | null
): string {
    return (
        value?.trim() ||
        "No registrado"
    );
}

export default async function PatientProfilePage() {
    const session =
        await requireRole([
            ROLES.PATIENT,
        ]);

    const workspace =
        getPatientProfileWorkspace(
            session.user.id
        );

    const profile =
        workspace.profile;

    const medicalRecord =
        workspace.medicalRecord;

    return (
        <div className="flex flex-col gap-6">
            <section className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <div className="flex size-12 items-center justify-center rounded-2xl border border-primary-border bg-primary-soft text-primary">
                        <UserRound
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
                        Mi perfil
                    </h2>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground-muted">
                        Consulta tus datos personales y mantén actualizada la información de contacto utilizada por la clínica.
                    </p>
                </div>

                <Link
                    href="/patient/medical-record"
                    className={cn(
                        buttonVariants({
                            variant:
                                "outline",
                            size:
                                "lg",
                        }),
                        "w-full sm:w-auto"
                    )}
                >
                    <FileHeart className="size-4.5" />
                    Ver expediente
                </Link>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Card>
                    <CardContent className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-sm font-medium text-foreground-muted">
                                Perfil completado
                            </p>

                            <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">
                                {
                                    workspace
                                        .profileCompletionPercentage
                                }
                                %
                            </p>

                            <p className="mt-2 text-xs leading-5 text-foreground-muted">
                                {
                                    workspace
                                        .editableFieldsCompleted
                                }{" "}
                                de{" "}
                                {
                                    workspace
                                        .editableFieldsTotal
                                }{" "}
                                datos registrados
                            </p>
                        </div>

                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary-border bg-primary-soft text-primary">
                            <Activity className="size-5" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-sm font-medium text-foreground-muted">
                                Estado de cuenta
                            </p>

                            <p className="mt-2 text-xl font-bold tracking-tight text-foreground">
                                {profile.isActive
                                    ? "Activa"
                                    : "Inactiva"}
                            </p>

                            <p className="mt-2 text-xs leading-5 text-foreground-muted">
                                Acceso actual al portal
                            </p>
                        </div>

                        <div
                            className={cn(
                                "flex size-11 shrink-0 items-center justify-center rounded-xl border",
                                profile.isActive
                                    ? "border-secondary-border bg-secondary-soft text-secondary"
                                    : "border-danger-border bg-danger-soft text-danger"
                            )}
                        >
                            <CheckCircle2 className="size-5" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-sm font-medium text-foreground-muted">
                                Teléfono
                            </p>

                            <p className="mt-2 truncate text-base font-bold text-foreground">
                                {getRegisteredValue(
                                    profile.phone
                                )}
                            </p>

                            <p className="mt-2 text-xs leading-5 text-foreground-muted">
                                Contacto principal
                            </p>
                        </div>

                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary-border bg-primary-soft text-primary">
                            <Phone className="size-5" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-sm font-medium text-foreground-muted">
                                Expediente clínico
                            </p>

                            <p className="mt-2 text-xl font-bold tracking-tight text-foreground">
                                {medicalRecord.id
                                    ? "Disponible"
                                    : "Pendiente"}
                            </p>

                            <p className="mt-2 text-xs leading-5 text-foreground-muted">
                                Información médica básica
                            </p>
                        </div>

                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-secondary-border bg-secondary-soft text-secondary">
                            <HeartPulse className="size-5" />
                        </div>
                    </CardContent>
                </Card>
            </section>

            <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                <PatientProfileForm
                    profile={
                        profile
                    }
                />

                <aside className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                Datos protegidos
                            </CardTitle>

                            <CardDescription>
                                Información administrada por personal autorizado.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <div className="flex items-start gap-3 rounded-xl border border-border bg-surface-muted p-4">
                                <Mail className="mt-0.5 size-5 shrink-0 text-primary" />

                                <div className="min-w-0">
                                    <p className="text-xs font-bold uppercase tracking-[0.1em] text-foreground-muted">
                                        Correo electrónico
                                    </p>

                                    <p className="mt-2 break-all text-sm font-semibold text-foreground">
                                        {
                                            profile.email
                                        }
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 rounded-xl border border-border bg-surface-muted p-4">
                                <CalendarDays className="mt-0.5 size-5 shrink-0 text-primary" />

                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.1em] text-foreground-muted">
                                        Fecha de nacimiento
                                    </p>

                                    <p className="mt-2 text-sm font-semibold capitalize text-foreground">
                                        {formatCalendarDate(
                                            profile.birthDate
                                        )}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 rounded-xl border border-border bg-surface-muted p-4">
                                <UserRound className="mt-0.5 size-5 shrink-0 text-primary" />

                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.1em] text-foreground-muted">
                                        Sexo
                                    </p>

                                    <p className="mt-2 text-sm font-semibold text-foreground">
                                        {getPatientSexLabel(
                                            profile.sex
                                        )}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 rounded-xl border border-primary-border bg-primary-soft p-4">
                                <LockKeyhole className="mt-0.5 size-5 shrink-0 text-primary" />

                                <p className="text-xs leading-5 text-foreground-muted">
                                    Para corregir tu nombre, correo, fecha de nacimiento o sexo, solicita el cambio directamente en recepción.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>
                                Contacto de emergencia
                            </CardTitle>

                            <CardDescription>
                                Información registrada en tu expediente clínico.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.1em] text-foreground-muted">
                                    Nombre
                                </p>

                                <p className="mt-2 text-sm font-semibold text-foreground">
                                    {getRegisteredValue(
                                        medicalRecord
                                            .emergencyContactName
                                    )}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.1em] text-foreground-muted">
                                    Teléfono
                                </p>

                                <p className="mt-2 text-sm font-semibold text-foreground">
                                    {getRegisteredValue(
                                        medicalRecord
                                            .emergencyContactPhone
                                    )}
                                </p>
                            </div>

                            <div className="rounded-xl border border-warning-border bg-warning-soft p-4">
                                <div className="flex items-start gap-3">
                                    <ShieldCheck className="mt-0.5 size-5 shrink-0 text-warning-hover" />

                                    <p className="text-xs leading-5 text-foreground-muted">
                                        El contacto de emergencia forma parte del expediente y solo puede modificarlo un médico autorizado.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {profile.address ? (
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    Dirección registrada
                                </CardTitle>
                            </CardHeader>

                            <CardContent>
                                <div className="flex items-start gap-3">
                                    <MapPin className="mt-0.5 size-5 shrink-0 text-primary" />

                                    <p className="whitespace-pre-wrap text-sm leading-6 text-foreground">
                                        {
                                            profile.address
                                        }
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : null}
                </aside>
            </section>
        </div>
    );
}