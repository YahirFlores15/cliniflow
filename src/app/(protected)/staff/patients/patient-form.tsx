"use client";

import {
    CalendarDays,
    Eye,
    EyeOff,
    KeyRound,
    LoaderCircle,
    Mail,
    MapPin,
    Phone,
    Save,
    UserPlus,
    UserRound,
} from "lucide-react";
import {
    useActionState,
    useState,
} from "react";

import { ActionMessage } from "@/components/feedback/action-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
    createPatientAction,
    type StaffActionState,
    updatePatientAction,
} from "@/server/modules/staff/staff.actions";
import type { PatientDTO } from "@/shared/dtos/staff.dtos";
import type { PatientSex } from "@/shared/schemas/staff.schemas";

type PatientFormMode =
    | "create"
    | "edit";

type PatientFormProps = {
    mode: PatientFormMode;
    patient?: PatientDTO;
};

const initialState: StaffActionState = {
    ok: false,
    message: "",
};

const PATIENT_SEX_LABELS: Record<
    PatientSex,
    string
> = {
    MALE: "Masculino",
    FEMALE: "Femenino",
    OTHER: "Otro",
    UNSPECIFIED: "Prefiere no especificar",
};

export function PatientForm({
    mode,
    patient,
}: PatientFormProps) {
    const [showPassword, setShowPassword] =
        useState(false);

    const action =
        mode === "create"
            ? createPatientAction
            : updatePatientAction;

    const [
        state,
        formAction,
        isPending,
    ] = useActionState(
        action,
        initialState
    );

    const hasError =
        Boolean(state.message) && !state.ok;

    return (
        <form
            action={formAction}
            className="space-y-6"
        >
            {mode === "edit" && patient ? (
                <input
                    type="hidden"
                    name="patientId"
                    value={patient.id}
                />
            ) : null}

            {hasError ? (
                <ActionMessage variant="error">
                    {state.message}
                </ActionMessage>
            ) : null}

            <section>
                <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl border border-primary-border bg-primary-soft text-primary">
                        <UserRound
                            className="size-5"
                            strokeWidth={1.9}
                        />
                    </div>

                    <div>
                        <h3 className="text-base font-semibold text-foreground">
                            Datos personales
                        </h3>

                        <p className="mt-0.5 text-sm text-foreground-muted">
                            Información administrativa para identificar al paciente.
                        </p>
                    </div>
                </div>

                <div className="mt-5 grid gap-5 md:grid-cols-2">
                    <div>
                        <label
                            htmlFor="name"
                            className="mb-2 block text-sm font-semibold text-foreground"
                        >
                            Nombre completo
                        </label>

                        <Input
                            id="name"
                            name="name"
                            type="text"
                            autoComplete="name"
                            required
                            minLength={2}
                            maxLength={120}
                            autoFocus
                            disabled={isPending}
                            hasError={hasError}
                            defaultValue={
                                patient?.name ?? ""
                            }
                            leadingIcon={
                                <UserRound
                                    className="size-4.5"
                                    strokeWidth={1.9}
                                />
                            }
                            placeholder="Nombre del paciente"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="birthDate"
                            className="mb-2 block text-sm font-semibold text-foreground"
                        >
                            Fecha de nacimiento
                        </label>

                        <Input
                            id="birthDate"
                            name="birthDate"
                            type="date"
                            required
                            disabled={isPending}
                            hasError={hasError}
                            defaultValue={
                                patient?.birthDate ?? ""
                            }
                            leadingIcon={
                                <CalendarDays
                                    className="size-4.5"
                                    strokeWidth={1.9}
                                />
                            }
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="sex"
                            className="mb-2 block text-sm font-semibold text-foreground"
                        >
                            Sexo
                        </label>

                        <Select
                            id="sex"
                            name="sex"
                            required
                            disabled={isPending}
                            hasError={hasError}
                            defaultValue={
                                patient?.sex ??
                                "UNSPECIFIED"
                            }
                        >
                            {Object.entries(
                                PATIENT_SEX_LABELS
                            ).map(
                                ([value, label]) => (
                                    <option
                                        key={value}
                                        value={value}
                                    >
                                        {label}
                                    </option>
                                )
                            )}
                        </Select>
                    </div>
                </div>
            </section>

            <div className="border-t border-border" />

            <section>
                <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl border border-secondary-border bg-secondary-soft text-secondary">
                        <Phone
                            className="size-5"
                            strokeWidth={1.9}
                        />
                    </div>

                    <div>
                        <h3 className="text-base font-semibold text-foreground">
                            Contacto
                        </h3>

                        <p className="mt-0.5 text-sm text-foreground-muted">
                            Medios utilizados por recepción para comunicarse con el paciente.
                        </p>
                    </div>
                </div>

                <div className="mt-5 grid gap-5 md:grid-cols-2">
                    <div>
                        <label
                            htmlFor="email"
                            className="mb-2 block text-sm font-semibold text-foreground"
                        >
                            Correo electrónico
                        </label>

                        <Input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            disabled={isPending}
                            hasError={hasError}
                            defaultValue={
                                patient?.email ?? ""
                            }
                            leadingIcon={
                                <Mail
                                    className="size-4.5"
                                    strokeWidth={1.9}
                                />
                            }
                            placeholder="paciente@correo.com"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="phone"
                            className="mb-2 block text-sm font-semibold text-foreground"
                        >
                            Teléfono
                        </label>

                        <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            autoComplete="tel"
                            required
                            minLength={7}
                            maxLength={30}
                            disabled={isPending}
                            hasError={hasError}
                            defaultValue={
                                patient?.phone ?? ""
                            }
                            leadingIcon={
                                <Phone
                                    className="size-4.5"
                                    strokeWidth={1.9}
                                />
                            }
                            placeholder="Número de contacto"
                        />
                    </div>
                </div>

                <div className="mt-5">
                    <label
                        htmlFor="address"
                        className="mb-2 block text-sm font-semibold text-foreground"
                    >
                        Dirección
                    </label>

                    <div className="relative">
                        <MapPin
                            className="pointer-events-none absolute left-3.5 top-3.5 size-4.5 text-foreground-muted"
                            strokeWidth={1.9}
                        />

                        <Textarea
                            id="address"
                            name="address"
                            maxLength={250}
                            rows={4}
                            disabled={isPending}
                            hasError={hasError}
                            defaultValue={
                                patient?.address ?? ""
                            }
                            className="pl-11"
                            placeholder="Dirección opcional"
                        />
                    </div>
                </div>
            </section>

            {mode === "create" ? (
                <>
                    <div className="border-t border-border" />

                    <section>
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-xl border border-warning-border bg-warning-soft text-warning-hover">
                                <KeyRound
                                    className="size-5"
                                    strokeWidth={1.9}
                                />
                            </div>

                            <div>
                                <h3 className="text-base font-semibold text-foreground">
                                    Acceso al portal
                                </h3>

                                <p className="mt-0.5 text-sm text-foreground-muted">
                                    Contraseña temporal para que el paciente pueda iniciar sesión.
                                </p>
                            </div>
                        </div>

                        <div className="mt-5 max-w-xl">
                            <label
                                htmlFor="password"
                                className="mb-2 block text-sm font-semibold text-foreground"
                            >
                                Contraseña temporal
                            </label>

                            <Input
                                id="password"
                                name="password"
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                autoComplete="new-password"
                                required
                                minLength={8}
                                maxLength={100}
                                disabled={isPending}
                                hasError={hasError}
                                leadingIcon={
                                    <KeyRound
                                        className="size-4.5"
                                        strokeWidth={1.9}
                                    />
                                }
                                trailingElement={
                                    <button
                                        type="button"
                                        disabled={
                                            isPending
                                        }
                                        onClick={() =>
                                            setShowPassword(
                                                (
                                                    currentValue
                                                ) =>
                                                    !currentValue
                                            )
                                        }
                                        className="flex size-9 items-center justify-center rounded-lg text-foreground-muted transition hover:bg-surface-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                                        aria-label={
                                            showPassword
                                                ? "Ocultar contraseña"
                                                : "Mostrar contraseña"
                                        }
                                        aria-pressed={
                                            showPassword
                                        }
                                    >
                                        {showPassword ? (
                                            <EyeOff
                                                className="size-4.5"
                                                strokeWidth={
                                                    1.9
                                                }
                                            />
                                        ) : (
                                            <Eye
                                                className="size-4.5"
                                                strokeWidth={
                                                    1.9
                                                }
                                            />
                                        )}
                                    </button>
                                }
                                placeholder="Mínimo 8 caracteres"
                            />

                            <p className="mt-2 text-xs leading-5 text-foreground-muted">
                                La contraseña se almacenará utilizando un hash seguro.
                            </p>
                        </div>
                    </section>
                </>
            ) : null}

            <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
                <Button
                    type="submit"
                    size="lg"
                    disabled={isPending}
                    className="sm:min-w-52"
                >
                    {isPending ? (
                        <>
                            <LoaderCircle className="size-4.5 animate-spin" />

                            {mode === "create"
                                ? "Registrando paciente..."
                                : "Guardando cambios..."}
                        </>
                    ) : mode === "create" ? (
                        <>
                            <UserPlus className="size-4.5" />
                            Registrar paciente
                        </>
                    ) : (
                        <>
                            <Save className="size-4.5" />
                            Guardar cambios
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}