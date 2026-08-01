"use client";

import {
    Save,
} from "lucide-react";
import {
    useActionState,
} from "react";

import {
    ActionMessage,
} from "@/components/feedback/action-message";
import {
    Button,
} from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Input,
} from "@/components/ui/input";
import {
    Textarea,
} from "@/components/ui/textarea";
import {
    updateDoctorPatientRecordAction,
    type DoctorPatientActionState,
} from "@/server/modules/doctor/doctor-patient.actions";
import type {
    DoctorPatientRecordDTO,
} from "@/shared/dtos/doctor-patient.dtos";

type MedicalRecordFormProps = {
    record:
    DoctorPatientRecordDTO;
};

const initialActionState:
    DoctorPatientActionState = {
    ok: false,
    message: "",
};

export function MedicalRecordForm({
    record,
}: MedicalRecordFormProps) {
    const [
        state,
        formAction,
        pending,
    ] = useActionState(
        updateDoctorPatientRecordAction,
        initialActionState
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    Información clínica permanente
                </CardTitle>

                <CardDescription>
                    Estos datos pertenecen al expediente general del paciente, no a una consulta individual.
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form
                    key={`${record.patientId}-${record.updatedAt ?? "new"}`}
                    action={
                        formAction
                    }
                    className="space-y-5"
                >
                    <input
                        type="hidden"
                        name="patientId"
                        value={
                            record.patientId
                        }
                    />

                    <div className="grid gap-5 xl:grid-cols-2">
                        <div>
                            <label
                                htmlFor="record-allergies"
                                className="text-sm font-semibold text-foreground"
                            >
                                Alergias
                            </label>

                            <Textarea
                                id="record-allergies"
                                name="allergies"
                                rows={6}
                                maxLength={2000}
                                defaultValue={
                                    record.allergies ??
                                    ""
                                }
                                placeholder="Medicamentos, alimentos, sustancias o sin alergias conocidas."
                                className="mt-2"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="record-chronic-diseases"
                                className="text-sm font-semibold text-foreground"
                            >
                                Enfermedades crónicas
                            </label>

                            <Textarea
                                id="record-chronic-diseases"
                                name="chronicDiseases"
                                rows={6}
                                maxLength={2000}
                                defaultValue={
                                    record.chronicDiseases ??
                                    ""
                                }
                                placeholder="Diabetes, hipertensión, asma u otros antecedentes."
                                className="mt-2"
                            />
                        </div>

                        <div className="xl:col-span-2">
                            <label
                                htmlFor="record-current-medications"
                                className="text-sm font-semibold text-foreground"
                            >
                                Medicamentos actuales
                            </label>

                            <Textarea
                                id="record-current-medications"
                                name="currentMedications"
                                rows={5}
                                maxLength={2000}
                                defaultValue={
                                    record.currentMedications ??
                                    ""
                                }
                                placeholder="Medicamento, dosis y frecuencia cuando se conozcan."
                                className="mt-2"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="record-emergency-name"
                                className="text-sm font-semibold text-foreground"
                            >
                                Contacto de emergencia
                            </label>

                            <Input
                                id="record-emergency-name"
                                name="emergencyContactName"
                                type="text"
                                maxLength={120}
                                defaultValue={
                                    record.emergencyContactName ??
                                    ""
                                }
                                placeholder="Nombre completo"
                                className="mt-2"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="record-emergency-phone"
                                className="text-sm font-semibold text-foreground"
                            >
                                Teléfono de emergencia
                            </label>

                            <Input
                                id="record-emergency-phone"
                                name="emergencyContactPhone"
                                type="tel"
                                maxLength={30}
                                defaultValue={
                                    record.emergencyContactPhone ??
                                    ""
                                }
                                placeholder="Número telefónico"
                                className="mt-2"
                            />
                        </div>
                    </div>

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

                    <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs leading-5 text-foreground-muted">
                            Los campos sin contenido se guardarán como información no registrada.
                        </p>

                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            disabled={
                                pending
                            }
                        >
                            <Save className="size-4.5" />

                            {pending
                                ? "Guardando..."
                                : "Guardar expediente"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}