"use client";

import {
    ClipboardPlus,
    FileText,
    LoaderCircle,
    NotebookPen,
    Pill,
    Save,
    ShieldCheck,
    Stethoscope,
} from "lucide-react";
import {
    useActionState,
} from "react";

import { ActionMessage } from "@/components/feedback/action-message";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
    createDoctorMedicalNoteAction,
    type DoctorNoteActionState,
} from "@/server/modules/doctor/doctor-note.actions";
import type {
    DoctorAppointmentDTO,
} from "@/shared/dtos/doctor.dtos";

type MedicalNoteFormProps = {
    appointment: DoctorAppointmentDTO;
};

const initialActionState: DoctorNoteActionState = {
    ok: false,
    message: "",
};

export function MedicalNoteForm({
    appointment,
}: MedicalNoteFormProps) {
    const [
        state,
        formAction,
        pending,
    ] = useActionState(
        createDoctorMedicalNoteAction,
        initialActionState
    );

    return (
        <form
            action={formAction}
            className="flex flex-col gap-6"
        >
            <input
                type="hidden"
                name="appointmentId"
                value={appointment.id}
            />

            <section className="rounded-3xl border border-primary-border bg-primary-soft p-5 shadow-[var(--shadow-sm)]">
                <div className="flex items-start gap-3">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-white">
                        <ClipboardPlus className="size-5" />
                    </div>

                    <div>
                        <h3 className="text-base font-semibold text-foreground">
                            Registro clínico
                        </h3>

                        <p className="mt-1 text-sm leading-6 text-foreground-muted">
                            La nota se guardará de forma permanente y la cita cambiará automáticamente a completada.
                        </p>
                    </div>
                </div>
            </section>

            <Card>
                <CardHeader>
                    <div className="flex items-start gap-3">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary-border bg-primary-soft text-primary">
                            <NotebookPen className="size-5" />
                        </div>

                        <div>
                            <CardTitle>
                                Evaluación médica
                            </CardTitle>

                            <CardDescription>
                                Registra el motivo definitivo y el diagnóstico de la consulta.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="grid gap-5">
                    <label className="block">
                        <span className="text-sm font-semibold text-foreground">
                            Motivo de consulta
                        </span>

                        <span className="ml-1 text-danger">
                            *
                        </span>

                        <p className="mt-1 text-xs leading-5 text-foreground-muted">
                            Puedes ajustar el motivo registrado originalmente por recepción.
                        </p>

                        <Textarea
                            name="reason"
                            required
                            minLength={3}
                            maxLength={500}
                            rows={4}
                            defaultValue={
                                appointment.reason ??
                                ""
                            }
                            className="mt-2"
                            placeholder="Describe el motivo principal de la consulta."
                        />
                    </label>

                    <label className="block">
                        <span className="text-sm font-semibold text-foreground">
                            Diagnóstico
                        </span>

                        <span className="ml-1 text-danger">
                            *
                        </span>

                        <p className="mt-1 text-xs leading-5 text-foreground-muted">
                            Registra la impresión diagnóstica o el diagnóstico clínico final.
                        </p>

                        <Textarea
                            name="diagnosis"
                            required
                            minLength={3}
                            maxLength={3000}
                            rows={7}
                            className="mt-2"
                            placeholder="Diagnóstico, hallazgos relevantes y criterio clínico."
                        />
                    </label>
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
                                Plan terapéutico
                            </CardTitle>

                            <CardDescription>
                                Documenta el manejo realizado o recomendado.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>

                <CardContent>
                    <label className="block">
                        <span className="text-sm font-semibold text-foreground">
                            Tratamiento
                        </span>

                        <p className="mt-1 text-xs leading-5 text-foreground-muted">
                            Campo opcional para procedimientos, cuidados o plan de tratamiento.
                        </p>

                        <Textarea
                            name="treatment"
                            maxLength={3000}
                            rows={6}
                            className="mt-2"
                            placeholder="Plan terapéutico, procedimientos realizados o seguimiento sugerido."
                        />
                    </label>
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
                                    Medicamentos y esquema de administración.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <label className="block">
                            <span className="sr-only">
                                Receta médica
                            </span>

                            <Textarea
                                name="prescriptionText"
                                maxLength={3000}
                                rows={9}
                                placeholder="Medicamento, presentación, dosis, vía, frecuencia y duración."
                            />
                        </label>
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
                                    Cuidados, signos de alarma y seguimiento.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <label className="block">
                            <span className="sr-only">
                                Indicaciones médicas
                            </span>

                            <Textarea
                                name="instructionsText"
                                maxLength={3000}
                                rows={9}
                                placeholder="Recomendaciones, cuidados, signos de alarma y fecha de seguimiento."
                            />
                        </label>
                    </CardContent>
                </Card>
            </section>

            {state.message ? (
                <ActionMessage
                    variant={
                        state.ok
                            ? "success"
                            : "error"
                    }
                >
                    {state.message}
                </ActionMessage>
            ) : null}

            <section className="rounded-3xl border border-border bg-surface p-5 shadow-[var(--shadow-sm)]">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start gap-3">
                        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" />

                        <div>
                            <p className="text-sm font-semibold text-foreground">
                                Confirmación clínica
                            </p>

                            <p className="mt-1 max-w-2xl text-xs leading-5 text-foreground-muted">
                                Al registrar la nota, la consulta quedará marcada como completada. La nota será de solo lectura y no podrá reemplazarse.
                            </p>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        disabled={pending}
                        className="w-full lg:w-auto"
                    >
                        {pending ? (
                            <LoaderCircle className="size-4 animate-spin" />
                        ) : (
                            <Save className="size-4" />
                        )}

                        {pending
                            ? "Registrando nota..."
                            : "Registrar nota médica"}
                    </Button>
                </div>
            </section>
        </form>
    );
}