import { Activity, CalendarDays, ClipboardList, FileText, Info, Pill, ShieldCheck, Stethoscope, } from "lucide-react";
import { getPatientPrescriptionsWorkspace, type PatientPrescriptionDTO, } from "@/server/modules/patient/patient-prescriptions.service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { buttonVariants, } from "@/components/ui/button";
import { requireRole, } from "@/server/auth/session";
import { ROLES, } from "@/shared/constants/roles";
import { Badge, } from "@/components/ui/badge";
import { cn, } from "@/lib/utils";
import Link from "next/link";


function formatCalendarDate(
    value: string
): string {
    const match =
        /^(\d{4})-(\d{2})-(\d{2})$/.exec(
            value
        );

    if (!match) {
        return value;
    }

    const formattedValue =
        new Intl.DateTimeFormat(
            "es-MX",
            {
                weekday:
                    "long",
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

    return (
        formattedValue
            .charAt(
                0
            )
            .toUpperCase() +
        formattedValue.slice(
            1
        )
    );
}

function hasRegisteredValue(
    value:
        string
        | null
): boolean {
    return Boolean(
        value?.trim()
    );
}

type PrescriptionInformationProps = {
    title: string;
    description: string;
    value:
    string
    | null;
    emptyMessage: string;
    icon:
    typeof Pill;
    variant:
    | "primary"
    | "success"
    | "warning";
};

function getInformationStyles(
    variant:
        PrescriptionInformationProps["variant"]
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

    return {
        container:
            "border-primary-border bg-primary-soft",
        icon:
            "border-primary-border bg-surface text-primary",
    };
}

function PrescriptionInformation({
    title,
    description,
    value,
    emptyMessage,
    icon:
    Icon,
    variant,
}: PrescriptionInformationProps) {
    const hasValue =
        hasRegisteredValue(
            value
        );

    const styles =
        getInformationStyles(
            variant
        );

    return (
        <section
            className={cn(
                "rounded-2xl border p-5",
                hasValue
                    ? styles.container
                    : "border-border bg-surface-muted"
            )}
        >
            <div className="flex items-start justify-between gap-4">
                <div
                    className={cn(
                        "flex size-10 shrink-0 items-center justify-center rounded-xl border",
                        hasValue
                            ? styles.icon
                            : "border-border bg-surface text-foreground-muted"
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
                        ? "Disponible"
                        : "Sin registro"}
                </Badge>
            </div>

            <h4 className="mt-4 text-sm font-bold text-foreground">
                {title}
            </h4>

            <p className="mt-1 text-xs leading-5 text-foreground-muted">
                {description}
            </p>

            <div className="mt-4 rounded-xl border border-border/80 bg-surface/80 p-4">
                <p
                    className={cn(
                        "whitespace-pre-wrap text-sm leading-6",
                        hasValue
                            ? "text-foreground"
                            : "italic text-foreground-muted"
                    )}
                >
                    {value?.trim() ||
                        emptyMessage}
                </p>
            </div>
        </section>
    );
}

function PrescriptionCard({
    prescription,
}: {
    prescription:
    PatientPrescriptionDTO;
}) {
    return (
        <Card className="overflow-hidden">
            <CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 items-start gap-4">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary-border bg-primary-soft text-primary">
                        <Stethoscope
                            className="size-5"
                            strokeWidth={
                                1.9
                            }
                        />
                    </div>

                    <div className="min-w-0">
                        <CardTitle>
                            Dr.{" "}
                            {
                                prescription
                                    .doctorName
                            }
                        </CardTitle>

                        <CardDescription>
                            {prescription
                                .doctorSpecialty ??
                                "Especialidad no registrada"}
                        </CardDescription>
                    </div>
                </div>

                <div className="sm:text-right">
                    <p className="text-sm font-semibold capitalize text-foreground">
                        {formatCalendarDate(
                            prescription
                                .scheduledDate
                        )}
                    </p>

                    <p className="mt-1 text-xs text-foreground-muted">
                        {
                            prescription
                                .startTime
                        }
                    </p>
                </div>
            </CardHeader>

            <CardContent className="space-y-5">
                <section className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-border bg-surface-muted p-4">
                        <p className="text-xs font-bold uppercase tracking-[0.1em] text-foreground-muted">
                            Motivo de consulta
                        </p>

                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground">
                            {
                                prescription
                                    .consultationReason
                            }
                        </p>
                    </div>

                    <div className="rounded-xl border border-border bg-surface-muted p-4">
                        <p className="text-xs font-bold uppercase tracking-[0.1em] text-foreground-muted">
                            Diagnóstico
                        </p>

                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground">
                            {
                                prescription
                                    .diagnosis
                            }
                        </p>
                    </div>
                </section>

                <section className="grid gap-4 lg:grid-cols-3">
                    <PrescriptionInformation
                        title="Tratamiento"
                        description="Plan terapéutico indicado durante la consulta."
                        value={
                            prescription
                                .treatment
                        }
                        emptyMessage="No se registró un tratamiento específico."
                        icon={
                            Activity
                        }
                        variant="success"
                    />

                    <PrescriptionInformation
                        title="Receta médica"
                        description="Medicamentos y dosificación indicados por el médico."
                        value={
                            prescription
                                .prescriptionText
                        }
                        emptyMessage="No se registraron medicamentos en esta consulta."
                        icon={
                            Pill
                        }
                        variant="primary"
                    />

                    <PrescriptionInformation
                        title="Indicaciones"
                        description="Cuidados, seguimiento y recomendaciones posteriores."
                        value={
                            prescription
                                .instructionsText
                        }
                        emptyMessage="No se registraron indicaciones adicionales."
                        icon={
                            FileText
                        }
                        variant="warning"
                    />
                </section>
            </CardContent>
        </Card>
    );
}

export default async function PatientPrescriptionsPage() {
    const session =
        await requireRole([
            ROLES.PATIENT,
        ]);

    const workspace =
        getPatientPrescriptionsWorkspace(
            session.user.id
        );

    const stats = [
        {
            label:
                "Recetas médicas",
            value:
                workspace.summary
                    .prescriptionsCount,
            description:
                "Consultas con medicamentos indicados",
            icon:
                Pill,
            iconClassName:
                "border-primary-border bg-primary-soft text-primary",
        },
        {
            label:
                "Tratamientos",
            value:
                workspace.summary
                    .treatmentsCount,
            description:
                "Planes terapéuticos registrados",
            icon:
                Activity,
            iconClassName:
                "border-secondary-border bg-secondary-soft text-secondary",
        },
        {
            label:
                "Indicaciones",
            value:
                workspace.summary
                    .instructionsCount,
            description:
                "Recomendaciones posteriores",
            icon:
                FileText,
            iconClassName:
                "border-warning-border bg-warning-soft text-warning-hover",
        },
        {
            label:
                "Notas clínicas",
            value:
                workspace.summary
                    .totalMedicalNotes,
            description:
                "Consultas con nota médica",
            icon:
                ClipboardList,
            iconClassName:
                "border-primary-border bg-primary-soft text-primary",
        },
    ] as const;

    return (
        <div className="flex flex-col gap-6">
            <section className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <div className="flex size-12 items-center justify-center rounded-2xl border border-primary-border bg-primary-soft text-primary">
                        <Pill
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
                        Recetas e indicaciones
                    </h2>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground-muted">
                        Consulta los tratamientos, medicamentos e indicaciones registrados durante tus consultas médicas.
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
                    Ver historial completo
                </Link>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map(
                    (
                        stat
                    ) => {
                        const Icon =
                            stat.icon;

                        return (
                            <Card
                                key={
                                    stat.label
                                }
                            >
                                <CardContent className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-foreground-muted">
                                            {
                                                stat.label
                                            }
                                        </p>

                                        <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">
                                            {
                                                stat.value
                                            }
                                        </p>

                                        <p className="mt-2 text-xs leading-5 text-foreground-muted">
                                            {
                                                stat.description
                                            }
                                        </p>
                                    </div>

                                    <div
                                        className={cn(
                                            "flex size-11 shrink-0 items-center justify-center rounded-xl border",
                                            stat.iconClassName
                                        )}
                                    >
                                        <Icon
                                            className="size-5"
                                            strokeWidth={
                                                1.9
                                            }
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    }
                )}
            </section>

            <section className="rounded-2xl border border-primary-border bg-primary-soft p-5">
                <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" />

                    <div>
                        <p className="text-sm font-semibold text-foreground">
                            Información médica de solo lectura
                        </p>

                        <p className="mt-1 text-xs leading-5 text-foreground-muted">
                            Las recetas e indicaciones únicamente pueden ser registradas por el médico responsable de la consulta. Ante cualquier duda o reacción adversa, contacta directamente con la clínica.
                        </p>
                    </div>
                </div>
            </section>

            {workspace
                .prescriptions
                .length > 0 ? (
                <section className="space-y-4">
                    <div>
                        <h3 className="text-xl font-bold tracking-tight text-foreground">
                            Indicaciones por consulta
                        </h3>

                        <p className="mt-1 text-sm text-foreground-muted">
                            Los registros más recientes aparecen primero.
                        </p>
                    </div>

                    {workspace.prescriptions.map(
                        (
                            prescription
                        ) => (
                            <PrescriptionCard
                                key={
                                    prescription.noteId
                                }
                                prescription={
                                    prescription
                                }
                            />
                        )
                    )}
                </section>
            ) : (
                <Card>
                    <CardContent className="flex min-h-80 flex-col items-center justify-center text-center">
                        <div className="flex size-14 items-center justify-center rounded-2xl border border-primary-border bg-primary-soft text-primary">
                            <Pill className="size-7" />
                        </div>

                        <h3 className="mt-5 text-lg font-bold text-foreground">
                            No hay recetas o indicaciones disponibles
                        </h3>

                        <p className="mt-2 max-w-lg text-sm leading-6 text-foreground-muted">
                            Cuando un médico registre medicamentos, tratamientos o recomendaciones en una consulta, aparecerán en esta sección.
                        </p>

                        <div className="mt-6 flex items-start gap-3 rounded-xl border border-border bg-surface-muted px-4 py-3 text-left">
                            <Info className="mt-0.5 size-5 shrink-0 text-primary" />

                            <p className="text-sm leading-6 text-foreground">
                                Una consulta puede tener nota médica sin contener necesariamente una receta farmacológica.
                            </p>
                        </div>

                        <Link
                            href="/patient/appointments"
                            className={cn(
                                buttonVariants({
                                    variant:
                                        "outline",
                                    size:
                                        "md",
                                }),
                                "mt-6"
                            )}
                        >
                            <CalendarDays className="size-4" />
                            Consultar mis citas
                        </Link>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}