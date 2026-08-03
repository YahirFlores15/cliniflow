import { CheckCircle2, ClipboardList, FileText, History, XCircle, } from "lucide-react";
import { PatientHistoryList, } from "@/app/(protected)/patient/history/patient-history-list";
import { getPatientHistory, } from "@/server/modules/patient/patient-history.service";
import { Card, CardContent, } from "@/components/ui/card";
import { requireRole, } from "@/server/auth/session";
import { ROLES, } from "@/shared/constants/roles";
import { cn, } from "@/lib/utils";


export default async function PatientHistoryPage() {
    const session =
        await requireRole([
            ROLES.PATIENT,
        ]);

    const workspace =
        getPatientHistory(
            session.user.id
        );

    const stats = [
        {
            label:
                "Consultas registradas",
            value:
                workspace.summary
                    .totalAppointments,
            description:
                "Citas anteriores en tu historial",
            icon:
                History,
            iconClassName:
                "border-primary-border bg-primary-soft text-primary",
        },
        {
            label:
                "Completadas",
            value:
                workspace.summary
                    .completedAppointments,
            description:
                "Consultas atendidas",
            icon:
                CheckCircle2,
            iconClassName:
                "border-secondary-border bg-secondary-soft text-secondary",
        },
        {
            label:
                "Canceladas",
            value:
                workspace.summary
                    .cancelledAppointments,
            description:
                "Citas que no se realizaron",
            icon:
                XCircle,
            iconClassName:
                "border-danger-border bg-danger-soft text-danger",
        },
        {
            label:
                "Con nota médica",
            value:
                workspace.summary
                    .appointmentsWithMedicalNote,
            description:
                "Consultas con información clínica",
            icon:
                FileText,
            iconClassName:
                "border-primary-border bg-primary-soft text-primary",
        },
    ] as const;

    return (
        <div className="flex flex-col gap-6">
            <section>
                <div className="flex size-12 items-center justify-center rounded-2xl border border-primary-border bg-primary-soft text-primary">
                    <ClipboardList
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
                    Historial de consultas
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground-muted">
                    Consulta tus citas anteriores, estados de atención y notas médicas asociadas. La información clínica se presenta únicamente en modo de lectura.
                </p>
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

            <PatientHistoryList
                workspace={
                    workspace
                }
            />
        </div>
    );
}