"use client";

import {
    Eye,
    EyeOff,
    KeyRound,
    LoaderCircle,
    Mail,
    ShieldCheck,
    UserRound,
    UserPlus,
} from "lucide-react";
import {
    useActionState,
    useState,
} from "react";

import { ActionMessage } from "@/components/feedback/action-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
    createUserAction,
    type SuperuserActionState,
} from "@/server/modules/superuser/superuser.actions";
import {
    ROLE_LABELS,
    ROLE_VALUES,
} from "@/shared/constants/roles";

const initialState: SuperuserActionState = {
    ok: false,
    message: "",
};

export function CreateUserForm() {
    const [showPassword, setShowPassword] =
        useState(false);

    const [
        state,
        formAction,
        isPending,
    ] = useActionState(
        createUserAction,
        initialState
    );

    const hasError =
        Boolean(state.message) && !state.ok;

    return (
        <form
            action={formAction}
            className="space-y-6"
        >
            {hasError ? (
                <ActionMessage variant="error">
                    {state.message}
                </ActionMessage>
            ) : null}

            <section className="space-y-5">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl border border-primary-border bg-primary-soft text-primary">
                            <UserRound
                                className="size-5"
                                strokeWidth={1.9}
                            />
                        </div>

                        <div>
                            <h3 className="text-base font-semibold text-foreground">
                                Datos de la cuenta
                            </h3>

                            <p className="mt-0.5 text-sm text-foreground-muted">
                                Información utilizada para identificar al usuario.
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
                                autoFocus
                                required
                                disabled={isPending}
                                hasError={hasError}
                                leadingIcon={
                                    <UserRound
                                        className="size-4.5"
                                        strokeWidth={1.9}
                                    />
                                }
                                placeholder="Nombre del usuario"
                            />
                        </div>

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
                                leadingIcon={
                                    <Mail
                                        className="size-4.5"
                                        strokeWidth={1.9}
                                    />
                                }
                                placeholder="usuario@clinica.com"
                            />
                        </div>
                    </div>
                </div>
            </section>

            <div className="border-t border-border" />

            <section className="space-y-5">
                <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl border border-secondary-border bg-secondary-soft text-secondary">
                        <ShieldCheck
                            className="size-5"
                            strokeWidth={1.9}
                        />
                    </div>

                    <div>
                        <h3 className="text-base font-semibold text-foreground">
                            Acceso y permisos
                        </h3>

                        <p className="mt-0.5 text-sm text-foreground-muted">
                            Define las credenciales iniciales y el rol del usuario.
                        </p>
                    </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                    <div>
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
                                    disabled={isPending}
                                    onClick={() =>
                                        setShowPassword(
                                            (currentValue) =>
                                                !currentValue
                                        )
                                    }
                                    className="flex size-9 items-center justify-center rounded-lg text-foreground-muted transition hover:bg-surface-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                                    aria-label={
                                        showPassword
                                            ? "Ocultar contraseña"
                                            : "Mostrar contraseña"
                                    }
                                    aria-pressed={showPassword}
                                >
                                    {showPassword ? (
                                        <EyeOff
                                            className="size-4.5"
                                            strokeWidth={1.9}
                                        />
                                    ) : (
                                        <Eye
                                            className="size-4.5"
                                            strokeWidth={1.9}
                                        />
                                    )}
                                </button>
                            }
                            placeholder="Mínimo 8 caracteres"
                        />

                        <p className="mt-2 text-xs leading-5 text-foreground-muted">
                            El usuario utilizará esta contraseña para su primer acceso.
                        </p>
                    </div>

                    <div>
                        <label
                            htmlFor="role"
                            className="mb-2 block text-sm font-semibold text-foreground"
                        >
                            Rol inicial
                        </label>

                        <Select
                            id="role"
                            name="role"
                            required
                            defaultValue="STAFF"
                            disabled={isPending}
                            hasError={hasError}
                        >
                            {ROLE_VALUES.map((role) => (
                                <option
                                    key={role}
                                    value={role}
                                >
                                    {ROLE_LABELS[role]}
                                </option>
                            ))}
                        </Select>

                        <p className="mt-2 text-xs leading-5 text-foreground-muted">
                            El rol determina los módulos y datos a los que tendrá acceso.
                        </p>
                    </div>
                </div>
            </section>

            <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
                <Button
                    type="submit"
                    size="lg"
                    disabled={isPending}
                    className="sm:min-w-44"
                >
                    {isPending ? (
                        <>
                            <LoaderCircle className="size-4.5 animate-spin" />
                            Creando usuario...
                        </>
                    ) : (
                        <>
                            <UserPlus className="size-4.5" />
                            Crear usuario
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}