"use client";

import {
    Mail,
    MapPin,
    Phone,
    Save,
    UserRound,
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
    Input,
} from "@/components/ui/input";
import {
    Textarea,
} from "@/components/ui/textarea";
import {
    updatePatientProfileAction,
    type PatientActionState,
} from "@/server/modules/patient/patient.actions";
import type {
    PatientProfileDTO,
} from "@/shared/dtos/patient.dtos";


type PatientProfileFormProps = {
    profile:
    PatientProfileDTO;
};

const initialState:
    PatientActionState = {
    ok: false,
    message: "",
};

export function PatientProfileForm({
    profile,
}: PatientProfileFormProps) {
    const [
        state,
        formAction,
        isPending,
    ] =
        useActionState(
            updatePatientProfileAction,
            initialState
        );

    return (
        <form
            action={
                formAction
            }
            className="space-y-6"
        >
            <section className="rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-sm)] sm:p-6">
                <div className="flex items-start gap-4">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary-border bg-primary-soft text-primary">
                        <UserRound
                            className="size-5"
                            strokeWidth={
                                1.9
                            }
                        />
                    </div>

                    <div>
                        <h3 className="text-base font-bold text-foreground">
                            Datos de identificación
                        </h3>

                        <p className="mt-1 text-sm leading-6 text-foreground-muted">
                            El nombre y correo electrónico son administrados por la clínica y no pueden modificarse desde el portal.
                        </p>
                    </div>
                </div>

                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    <div>
                        <label
                            htmlFor="patient-name"
                            className="mb-2 block text-sm font-semibold text-foreground"
                        >
                            Nombre completo
                        </label>

                        <div className="relative">
                            <UserRound className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-foreground-muted" />

                            <Input
                                id="patient-name"
                                value={
                                    profile.name
                                }
                                readOnly
                                className="bg-surface-muted pl-10 text-foreground-muted"
                            />
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="patient-email"
                            className="mb-2 block text-sm font-semibold text-foreground"
                        >
                            Correo electrónico
                        </label>

                        <div className="relative">
                            <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-foreground-muted" />

                            <Input
                                id="patient-email"
                                type="email"
                                value={
                                    profile.email
                                }
                                readOnly
                                className="bg-surface-muted pl-10 text-foreground-muted"
                            />
                        </div>
                    </div>
                </div>
            </section>

            <section className="rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-sm)] sm:p-6">
                <div>
                    <h3 className="text-base font-bold text-foreground">
                        Información de contacto
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-foreground-muted">
                        Mantén estos datos actualizados para que recepción pueda comunicarse contigo.
                    </p>
                </div>

                <div className="mt-6 grid gap-5">
                    <div>
                        <label
                            htmlFor="patient-phone"
                            className="mb-2 block text-sm font-semibold text-foreground"
                        >
                            Teléfono
                        </label>

                        <div className="relative">
                            <Phone className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-foreground-muted" />

                            <Input
                                id="patient-phone"
                                name="phone"
                                type="tel"
                                required
                                minLength={
                                    7
                                }
                                maxLength={
                                    30
                                }
                                defaultValue={
                                    profile.phone ??
                                    ""
                                }
                                placeholder="Ej. 314 123 4567"
                                className="pl-10"
                            />
                        </div>

                        <p className="mt-2 text-xs text-foreground-muted">
                            Puede incluir código de país, espacios o guiones.
                        </p>
                    </div>

                    <div>
                        <label
                            htmlFor="patient-address"
                            className="mb-2 block text-sm font-semibold text-foreground"
                        >
                            Dirección
                        </label>

                        <div className="relative">
                            <MapPin className="pointer-events-none absolute left-3.5 top-3.5 size-4 text-foreground-muted" />

                            <Textarea
                                id="patient-address"
                                name="address"
                                rows={
                                    4
                                }
                                maxLength={
                                    250
                                }
                                defaultValue={
                                    profile.address ??
                                    ""
                                }
                                placeholder="Calle, número, colonia, ciudad y referencias"
                                className="pl-10"
                            />
                        </div>

                        <p className="mt-2 text-xs text-foreground-muted">
                            Máximo 250 caracteres.
                        </p>
                    </div>
                </div>

                {state.message ? (
                    <ActionMessage
                        variant={
                            state.ok
                                ? "success"
                                : "error"
                        }
                        className="mt-6"
                    >
                        {
                            state.message
                        }
                    </ActionMessage>
                ) : null}

                <div className="mt-6 flex justify-end">
                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        disabled={
                            isPending
                        }
                    >
                        <Save className="size-4.5" />

                        {isPending
                            ? "Guardando..."
                            : "Guardar cambios"}
                    </Button>
                </div>
            </section>
        </form>
    );
}