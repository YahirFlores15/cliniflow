"use client";

import {
    AlertCircle,
    Eye,
    EyeOff,
    KeyRound,
    LoaderCircle,
    LogIn,
    Mail,
} from "lucide-react";
import {
    useActionState,
    useState,
} from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    loginAction,
    type LoginActionState,
} from "@/server/auth/auth.actions";

const initialState: LoginActionState = {
    ok: false,
    message: "",
};

export function LoginForm() {
    const [showPassword, setShowPassword] =
        useState(false);

    const [state, formAction, isPending] =
        useActionState(
            loginAction,
            initialState
        );

    const hasError = Boolean(state.message);

    return (
        <form
            action={formAction}
            className="space-y-5"
        >
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
                    autoFocus
                    required
                    disabled={isPending}
                    hasError={hasError}
                    leadingIcon={
                        <Mail
                            className="size-4.5"
                            strokeWidth={1.9}
                        />
                    }
                    placeholder="usuario@cliniflow.local"
                />
            </div>

            <div>
                <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-semibold text-foreground"
                >
                    Contraseña
                </label>

                <Input
                    id="password"
                    name="password"
                    type={
                        showPassword
                            ? "text"
                            : "password"
                    }
                    autoComplete="current-password"
                    required
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
                            onClick={() =>
                                setShowPassword(
                                    (currentValue) =>
                                        !currentValue
                                )
                            }
                            disabled={isPending}
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
                    placeholder="Ingresa tu contraseña"
                />
            </div>

            {state.message ? (
                <div
                    role="alert"
                    aria-live="polite"
                    className="flex items-start gap-3 rounded-xl border border-danger-border bg-danger-soft px-4 py-3 text-sm text-danger"
                >
                    <AlertCircle
                        className="mt-0.5 size-4.5 shrink-0"
                        strokeWidth={2}
                    />

                    <p className="leading-5">
                        {state.message}
                    </p>
                </div>
            ) : null}

            <Button
                type="submit"
                size="lg"
                fullWidth
                disabled={isPending}
                className="mt-1"
            >
                {isPending ? (
                    <>
                        <LoaderCircle className="size-4.5 animate-spin" />
                        Iniciando sesión...
                    </>
                ) : (
                    <>
                        <LogIn className="size-4.5" />
                        Iniciar sesión
                    </>
                )}
            </Button>

            <p className="text-center text-xs leading-5 text-foreground-muted">
                El acceso está limitado a usuarios autorizados de ClinicFlow.
            </p>
        </form>
    );
}