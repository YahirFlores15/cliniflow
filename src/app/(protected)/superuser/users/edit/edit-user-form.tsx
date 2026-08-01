"use client";

import {
    LoaderCircle,
    Mail,
    Save,
    UserRound,
} from "lucide-react";
import { useActionState } from "react";

import { ActionMessage } from "@/components/feedback/action-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    updateUserAction,
    type SuperuserActionState,
} from "@/server/modules/superuser/superuser.actions";
import type { AdminUserDTO } from "@/shared/dtos/auth.dtos";

type EditUserFormProps = {
    user: AdminUserDTO;
};

const initialState: SuperuserActionState = {
    ok: false,
    message: "",
};

export function EditUserForm({
    user,
}: EditUserFormProps) {
    const [
        state,
        formAction,
        isPending,
    ] = useActionState(
        updateUserAction,
        initialState
    );

    const hasError =
        Boolean(state.message) && !state.ok;

    return (
        <form
            action={formAction}
            className="space-y-6"
        >
            <input
                type="hidden"
                name="userId"
                value={user.id}
            />

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
                            Datos administrativos
                        </h3>

                        <p className="mt-0.5 text-sm text-foreground-muted">
                            Actualiza la información utilizada para identificar la cuenta.
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
                            autoFocus
                            defaultValue={user.name}
                            disabled={isPending}
                            hasError={hasError}
                            leadingIcon={
                                <UserRound
                                    className="size-4.5"
                                    strokeWidth={1.9}
                                />
                            }
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
                            defaultValue={user.email}
                            disabled={isPending}
                            hasError={hasError}
                            leadingIcon={
                                <Mail
                                    className="size-4.5"
                                    strokeWidth={1.9}
                                />
                            }
                        />
                    </div>
                </div>
            </section>

            <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
                <Button
                    type="submit"
                    size="lg"
                    disabled={isPending}
                    className="sm:min-w-48"
                >
                    {isPending ? (
                        <>
                            <LoaderCircle className="size-4.5 animate-spin" />
                            Guardando cambios...
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