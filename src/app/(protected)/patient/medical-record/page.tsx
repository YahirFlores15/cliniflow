import { Activity, AlertTriangle, CalendarDays, CheckCircle2, ClipboardList, FileHeart, HeartPulse, Info, Phone, Pill, ShieldCheck, UserRound, } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { getPatientMedicalRecordWorkspace, } from "@/server/modules/patient/patient-medical-record.service";
import { buttonVariants, } from "@/components/ui/button";
import { requireRole, } from "@/server/auth/session";
import { ROLES, } from "@/shared/constants/roles";
import { Badge, } from "@/components/ui/badge";
import { cn, } from "@/lib/utils";
import Link from "next/link";


type ClinicalSectionProps = {
    title: string;
    description: string;
    value:
    string
    | null;
    emptyMessage: string;
    icon:
    typeof Activity;
    variant:
    | "primary"
    | "success"
    | "warning"
    | "danger";
};

function formatCalendarDateTime(
    value:
        string
        | null
): string {
    if (!value) {
        return "Sin actualización registrada";
    }

    const normalizedValue =
        value.includes(
            " "
        )
            ? value.replace(
                " ",
                "T"
            )
            : value;

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
                "long",
            timeStyle:
                "short",
        }
    ).format(
        parsedDate
    );
}

function getSectionStyles(
    variant:
        ClinicalSectionProps["variant"]
): {
    container: string;
    icon: string;
} {
    if (
        variant ===
        "success"
    ) {
        return {
            container:
                "border-secondary-border bg-secondary-soft",
            icon:
                "border-secondary-border bg-surface text-secondary",
        };
    }

    if (
        variant ===
        "warning"
    ) {
        return {
            container:
                "border-warning-border bg-warning-soft",
            icon:
                "border-warning-border bg-surface text-warning-hover",
        };
    }

    if (
        variant ===
        "danger"
    ) {
        return {
            container:
                "border-danger-border bg-danger-soft",
            icon:
                "border-danger-border bg-surface text-danger",
        };
    }

    return {
        container:
            "border-primary-border bg-primary-soft",
        icon:
            "border-primary-border bg-surface text-primary",
    };
}

function ClinicalSection({
    title,
    description,
    value,
    emptyMessage,
    icon:
    Icon,
    variant,
}: ClinicalSectionProps) {
    const styles =
        getSectionStyles(
            variant
        );

    const normalizedValue =
        value?.trim() ??
        "";

    const hasValue =
        normalizedValue.length >
        0;

    return (
        <Card
            className={cn(
                "overflow-hidden",
                hasValue &&
                styles.container
            )}
        >
            <CardContent className="flex h-full flex-col">
                <div className="flex items-start justify-between gap-4">
                    <div
                        className={cn(
                            "flex size-11 shrink-0 items-center justify-center rounded-xl border",
                            hasValue
                                ? styles.icon
                                : "border-border bg-surface-muted text-foreground-muted"
                        )}
                    >
                        <Icon
                            className="size-5"
                            strokeWidth={
                                1.9
                            }
                        />
                    </div>

                    <Badge
                        variant={
                            hasValue
                                ? "success"
                                : "neutral"
                        }
                    >
                        {hasValue
                            ? "Registrado"
                            : "Sin datos"}
                    </Badge>
                </div>

                <div className="mt-5">
                    <h3 className="text-base font-bold text-foreground">
                        {title}
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-foreground-muted">
                        {description}
                    </p>
                </div>

                <div className="mt-4 flex-1 rounded-xl border border-border/80 bg-surface/80 p-4">
                    <p
                        className={cn(
                            "whitespace-pre-wrap text-sm leading-6",
                            hasValue
                                ? "text-foreground"
                                : "italic text-foreground-muted"
                        )}
                    >
                        {hasValue
                            ? normalizedValue
                            : emptyMessage}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}

function formatEmergencyContact(
    name:
        string
        | null,
    phone:
        string
        | null
): string | null {
    const values = [
        name?.trim(),
        phone?.trim(),
    ].filter(
        (
            value
        ): value is string =>
            Boolean(
                value
            )
    );

    if (
        values.length ===
        0
    ) {
        return null;
    }

    return values.join(
        "\n"
    );
}

export default async function PatientMedicalRecordPage() {
    const session =
        await requireRole([
            ROLES.PATIENT,
        ]);

    const workspace =
        getPatientMedicalRecordWorkspace(
            session.user.id
        );

    const emergencyContact =
        formatEmergencyContact(
            workspace
                .medicalRecord
                .emergencyContactName,
            workspace
                .medicalRecord
                .emergencyContactPhone
        );

    const completionPercentage =
        Math.round(
            workspace.summary
                .completedSections /
            workspace.summary
                .totalSections *
            100
        );

    return (
        <div className="flex flex-col gap-6">
            <section className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <div className="flex size-12 items-center justify-center rounded-2xl border border-primary-border bg-primary-soft text-primary">
                        <FileHeart
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
                        Expediente clínico
                    </h2>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground-muted">
                        Consulta la información clínica permanente registrada por los médicos que te han atendido.
                    </p>
                </div>

                <Link
                    href="/patient/history"
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
                    <ClipboardList className="size-4.5" />
                    Ver historial
                </Link>
            </section>

            {!workspace.summary
                .hasMedicalRecord ? (
                <Card>
                    <CardContent className="flex min-h-80 flex-col items-center justify-center text-center">
                        <div className="flex size-14 items-center justify-center rounded-2xl border border-primary-border bg-primary-soft text-primary">
                            <FileHeart className="size-7" />
                        </div>

                        <h3 className="mt-5 text-lg font-bold text-foreground">
                            Aún no existe un expediente clínico
                        </h3>

                        <p className="mt-2 max-w-lg text-sm leading-6 text-foreground-muted">
                            Cuando un médico registre tus antecedentes, alergias, medicamentos o contacto de emergencia, la información aparecerá en esta sección.
                        </p>

                        <div className="mt-6 rounded-xl border border-primary-border bg-primary-soft px-4 py-3 text-left">
                            <div className="flex items-start gap-3">
                                <Info className="mt-0.5 size-5 shrink-0 text-primary" />

                                <p className="text-sm leading-6 text-foreground">
                                    El expediente únicamente puede ser creado o modificado por personal médico autorizado.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <>
                    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <Card>
                            <CardContent className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm font-medium text-foreground-muted">
                                        Secciones registradas
                                    </p>

                                    <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">
                                        {
                                            workspace
                                                .summary
                                                .completedSections
                                        }
                                        /
                                        {
                                            workspace
                                                .summary
                                                .totalSections
                                        }
                                    </p>

                                    <p className="mt-2 text-xs leading-5 text-foreground-muted">
                                        Información clínica disponible
                                    </p>
                                </div>

                                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary-border bg-primary-soft text-primary">
                                    <ClipboardList className="size-5" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm font-medium text-foreground-muted">
                                        Integridad del expediente
                                    </p>

                                    <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">
                                        {
                                            completionPercentage
                                        }
                                        %
                                    </p>

                                    <p className="mt-2 text-xs leading-5 text-foreground-muted">
                                        Campos clínicos completados
                                    </p>
                                </div>

                                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-secondary-border bg-secondary-soft text-secondary">
                                    <CheckCircle2 className="size-5" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm font-medium text-foreground-muted">
                                        Tipo de acceso
                                    </p>

                                    <p className="mt-2 text-lg font-bold tracking-tight text-foreground">
                                        Solo lectura
                                    </p>

                                    <p className="mt-2 text-xs leading-5 text-foreground-muted">
                                        Sin permisos de modificación
                                    </p>
                                </div>

                                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary-border bg-primary-soft text-primary">
                                    <ShieldCheck className="size-5" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm font-medium text-foreground-muted">
                                        Última actualización
                                    </p>

                                    <p className="mt-2 text-sm font-bold leading-6 text-foreground">
                                        {formatCalendarDateTime(
                                            workspace
                                                .medicalRecord
                                                .updatedAt
                                        )}
                                    </p>

                                    <p className="mt-2 text-xs leading-5 text-foreground-muted">
                                        Fecha registrada por el sistema
                                    </p>
                                </div>

                                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-warning-border bg-warning-soft text-warning-hover">
                                    <CalendarDays className="size-5" />
                                </div>
                            </CardContent>
                        </Card>
                    </section>

                    <section className="grid gap-4 lg:grid-cols-2">
                        <ClinicalSection
                            title="Alergias"
                            description="Sustancias, medicamentos o elementos que pueden provocar una reacción."
                            value={
                                workspace
                                    .medicalRecord
                                    .allergies
                            }
                            emptyMessage="No se han registrado alergias."
                            icon={
                                AlertTriangle
                            }
                            variant="danger"
                        />

                        <ClinicalSection
                            title="Enfermedades crónicas"
                            description="Padecimientos permanentes o de seguimiento prolongado."
                            value={
                                workspace
                                    .medicalRecord
                                    .chronicDiseases
                            }
                            emptyMessage="No se han registrado enfermedades crónicas."
                            icon={
                                Activity
                            }
                            variant="warning"
                        />

                        <ClinicalSection
                            title="Medicamentos actuales"
                            description="Tratamientos farmacológicos que se encuentran activos."
                            value={
                                workspace
                                    .medicalRecord
                                    .currentMedications
                            }
                            emptyMessage="No se han registrado medicamentos actuales."
                            icon={
                                Pill
                            }
                            variant="primary"
                        />

                        <ClinicalSection
                            title="Contacto de emergencia"
                            description="Persona a quien la clínica puede contactar en una situación urgente."
                            value={
                                emergencyContact
                            }
                            emptyMessage="No se ha registrado un contacto de emergencia."
                            icon={
                                Phone
                            }
                            variant="success"
                        />
                    </section>

                    <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    Información del paciente
                                </CardTitle>

                                <CardDescription>
                                    Datos vinculados al expediente clínico.
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="grid gap-4 sm:grid-cols-2">
                                <div className="rounded-xl border border-border bg-surface-muted p-4">
                                    <div className="flex items-center gap-2 text-primary">
                                        <UserRound className="size-4.5" />

                                        <p className="text-xs font-bold uppercase tracking-[0.1em]">
                                            Paciente
                                        </p>
                                    </div>

                                    <p className="mt-3 text-sm font-semibold text-foreground">
                                        {
                                            workspace
                                                .profile
                                                .name
                                        }
                                    </p>
                                </div>

                                <div className="rounded-xl border border-border bg-surface-muted p-4">
                                    <div className="flex items-center gap-2 text-primary">
                                        <CalendarDays className="size-4.5" />

                                        <p className="text-xs font-bold uppercase tracking-[0.1em]">
                                            Fecha de nacimiento
                                        </p>
                                    </div>

                                    <p className="mt-3 text-sm font-semibold text-foreground">
                                        {workspace
                                            .profile
                                            .birthDate ??
                                            "No registrada"}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    Protección de datos
                                </CardTitle>

                                <CardDescription>
                                    Restricciones de acceso clínico.
                                </CardDescription>
                            </CardHeader>

                            <CardContent>
                                <div className="flex items-start gap-3 rounded-xl border border-primary-border bg-primary-soft p-4">
                                    <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" />

                                    <div>
                                        <p className="text-sm font-semibold text-foreground">
                                            Información protegida
                                        </p>

                                        <p className="mt-1 text-xs leading-5 text-foreground-muted">
                                            Puedes consultar tu expediente, pero únicamente un médico relacionado puede modificar la información clínica.
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4 flex items-start gap-3 rounded-xl border border-secondary-border bg-secondary-soft p-4">
                                    <HeartPulse className="mt-0.5 size-5 shrink-0 text-secondary" />

                                    <div>
                                        <p className="text-sm font-semibold text-foreground">
                                            Correcciones clínicas
                                        </p>

                                        <p className="mt-1 text-xs leading-5 text-foreground-muted">
                                            Solicita cualquier corrección durante una consulta o directamente con la clínica.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </section>
                </>
            )}
        </div>
    );
}