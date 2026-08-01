import { CalendarCheck2, FileCheck2, FileText, NotebookText, Pill, ShieldCheck, Stethoscope, } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import type { MedicalNoteDTO, } from "@/shared/dtos/doctor.dtos";


type MedicalNoteViewProps = {
    note: MedicalNoteDTO;
};

function formatDateTime(
    value: string
): string {
    const parsedDate =
        new Date(value);

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
            dateStyle: "long",
            timeStyle: "short",
        }
    ).format(parsedDate);
}

function ClinicalText({
    value,
    emptyText,
}: {
    value: string | null;
    emptyText: string;
}) {
    return (
        <p className="whitespace-pre-wrap text-sm leading-7 text-foreground">
            {value?.trim() ||
                emptyText}
        </p>
    );
}

export function MedicalNoteView({
    note,
}: MedicalNoteViewProps) {
    return (
        <div className="flex flex-col gap-6">
            <section className="rounded-3xl border border-secondary-border bg-secondary-soft p-5 shadow-[var(--shadow-sm)]">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-white">
                            <FileCheck2 className="size-5" />
                        </div>

                        <div>
                            <h3 className="text-base font-semibold text-foreground">
                                Nota médica registrada
                            </h3>

                            <p className="mt-1 text-sm leading-6 text-foreground-muted">
                                La información clínica está cerrada y disponible en modo de consulta.
                            </p>
                        </div>
                    </div>

                    <div className="inline-flex items-center gap-2 rounded-xl border border-secondary-border bg-surface px-4 py-2 text-sm font-semibold text-secondary">
                        <ShieldCheck className="size-4" />
                        Solo lectura
                    </div>
                </div>
            </section>

            <Card>
                <CardHeader>
                    <div className="flex items-start gap-3">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary-border bg-primary-soft text-primary">
                            <NotebookText className="size-5" />
                        </div>

                        <div>
                            <CardTitle>
                                Evaluación clínica
                            </CardTitle>

                            <CardDescription>
                                Motivo de consulta y diagnóstico registrado.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="grid gap-5">
                    <section className="rounded-2xl border border-border bg-surface-muted p-5">
                        <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-foreground-muted">
                            Motivo de consulta
                        </h3>

                        <div className="mt-3">
                            <ClinicalText
                                value={
                                    note.reason
                                }
                                emptyText="Sin motivo registrado."
                            />
                        </div>
                    </section>

                    <section className="rounded-2xl border border-border bg-surface-muted p-5">
                        <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-foreground-muted">
                            Diagnóstico
                        </h3>

                        <div className="mt-3">
                            <ClinicalText
                                value={
                                    note.diagnosis
                                }
                                emptyText="Sin diagnóstico registrado."
                            />
                        </div>
                    </section>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex items-start gap-3">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-secondary-border bg-secondary-soft text-secondary">
                            <Stethoscope className="size-5" />
                        </div>

                        <div>
                            <CardTitle>
                                Tratamiento
                            </CardTitle>

                            <CardDescription>
                                Plan terapéutico documentado durante la consulta.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>

                <CardContent>
                    <div className="rounded-2xl border border-border bg-surface-muted p-5">
                        <ClinicalText
                            value={
                                note.treatment
                            }
                            emptyText="No se registró tratamiento."
                        />
                    </div>
                </CardContent>
            </Card>

            <section className="grid gap-6 xl:grid-cols-2">
                <Card>
                    <CardHeader>
                        <div className="flex items-start gap-3">
                            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary-border bg-primary-soft text-primary">
                                <Pill className="size-5" />
                            </div>

                            <div>
                                <CardTitle>
                                    Receta
                                </CardTitle>

                                <CardDescription>
                                    Medicamentos indicados.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <div className="min-h-40 rounded-2xl border border-border bg-surface-muted p-5">
                            <ClinicalText
                                value={
                                    note.prescriptionText
                                }
                                emptyText="No se registró receta médica."
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-start gap-3">
                            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-warning-border bg-warning-soft text-warning-hover">
                                <FileText className="size-5" />
                            </div>

                            <div>
                                <CardTitle>
                                    Indicaciones
                                </CardTitle>

                                <CardDescription>
                                    Cuidados y recomendaciones.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <div className="min-h-40 rounded-2xl border border-border bg-surface-muted p-5">
                            <ClinicalText
                                value={
                                    note.instructionsText
                                }
                                emptyText="No se registraron indicaciones."
                            />
                        </div>
                    </CardContent>
                </Card>
            </section>

            <section className="rounded-2xl border border-border bg-surface-muted p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                        <CalendarCheck2 className="size-4 text-secondary" />

                        <p className="text-sm font-semibold text-foreground">
                            Registro clínico cerrado
                        </p>
                    </div>

                    <p className="text-xs text-foreground-muted">
                        Creada el{" "}
                        {formatDateTime(
                            note.createdAt
                        )}
                    </p>
                </div>
            </section>
        </div>
    );
}