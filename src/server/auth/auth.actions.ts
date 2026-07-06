"use server";

import { redirect } from "next/navigation";
import { LoginSchema } from "@/shared/schemas/auth.schemas";
import {
    getHomePathForRole,
    loginWithEmailAndPassword,
    logout,
} from "@/server/auth/session";

export type LoginActionState = {
    ok: boolean;
    message: string;
};

export async function loginAction(
    _previousState: LoginActionState,
    formData: FormData
): Promise<LoginActionState> {
    const rawData = {
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
    };

    const parsed = LoginSchema.safeParse(rawData);

    if (!parsed.success) {
        return {
            ok: false,
            message: parsed.error.issues[0]?.message ?? "Datos inválidos.",
        };
    }

    try {
        const session = await loginWithEmailAndPassword(parsed.data);
        const homePath = getHomePathForRole(session.user.role);

        redirect(homePath);
    } catch (error) {
        if (
            error instanceof Error &&
            error.message.includes("NEXT_REDIRECT")
        ) {
            throw error;
        }

        return {
            ok: false,
            message:
                error instanceof Error
                    ? error.message
                    : "No se pudo iniciar sesión.",
        };
    }
}

export async function logoutAction(): Promise<void> {
    await logout();
    redirect("/login");
}