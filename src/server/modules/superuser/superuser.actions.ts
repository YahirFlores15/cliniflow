"use server";

import { requireRole } from "@/server/auth/session";
import {
    createUserWithProfile,
    emailExists,
    emailExistsForAnotherUser,
    findAdminUserById,
    setUserActiveStatus,
    updateAdminUser,
} from "@/server/modules/superuser/superuser.repository";
import {
    CreateUserSchema,
    UpdateUserSchema,
    UpdateUserStatusSchema,
} from "@/shared/schemas/auth.schemas";
import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";

export type SuperuserActionState = {
    ok: boolean;
    message: string;
};

export async function createUserAction(
    _previousState: SuperuserActionState,
    formData: FormData
): Promise<SuperuserActionState> {
    await requireRole(["SUPERUSER"]);

    const rawData = {
        name: String(formData.get("name") ?? ""),
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
        role: String(formData.get("role") ?? ""),
    };

    const parsed = CreateUserSchema.safeParse(rawData);

    if (!parsed.success) {
        return {
            ok: false,
            message: parsed.error.issues[0]?.message ?? "Datos inválidos.",
        };
    }

    const normalizedEmail = parsed.data.email.toLowerCase();

    if (emailExists(normalizedEmail)) {
        return {
            ok: false,
            message: "Ya existe un usuario con ese email.",
        };
    }

    const passwordHash = await hash(parsed.data.password, 10);

    createUserWithProfile({
        name: parsed.data.name,
        email: normalizedEmail,
        passwordHash,
        role: parsed.data.role,
    });

    revalidatePath("/superuser");

    return {
        ok: true,
        message: "Usuario creado correctamente.",
    };
}

export async function updateUserAction(
    _previousState: SuperuserActionState,
    formData: FormData
): Promise<SuperuserActionState> {
    await requireRole(["SUPERUSER"]);

    const rawData = {
        userId: String(formData.get("userId") ?? ""),
        name: String(formData.get("name") ?? ""),
        email: String(formData.get("email") ?? ""),
    };

    const parsed = UpdateUserSchema.safeParse(rawData);

    if (!parsed.success) {
        return {
            ok: false,
            message: parsed.error.issues[0]?.message ?? "Datos inválidos.",
        };
    }

    const normalizedEmail = parsed.data.email.toLowerCase();

    const user = findAdminUserById(parsed.data.userId);

    if (!user) {
        return {
            ok: false,
            message: "El usuario no existe.",
        };
    }

    if (
        emailExistsForAnotherUser({
            email: normalizedEmail,
            userId: parsed.data.userId,
        })
    ) {
        return {
            ok: false,
            message: "Otro usuario ya usa ese email.",
        };
    }

    updateAdminUser({
        userId: parsed.data.userId,
        name: parsed.data.name,
        email: normalizedEmail,
    });

    revalidatePath("/superuser");

    return {
        ok: true,
        message: "Usuario actualizado correctamente.",
    };
}

export async function updateUserStatusAction(
    _previousState: SuperuserActionState,
    formData: FormData
): Promise<SuperuserActionState> {
    const session = await requireRole(["SUPERUSER"]);

    const rawData = {
        userId: String(formData.get("userId") ?? ""),
        isActive: String(formData.get("isActive") ?? "") === "true",
    };

    const parsed = UpdateUserStatusSchema.safeParse(rawData);

    if (!parsed.success) {
        return {
            ok: false,
            message: "Datos inválidos.",
        };
    }

    if (parsed.data.userId === session.user.id && parsed.data.isActive === false) {
        return {
            ok: false,
            message: "No puedes desactivar tu propio usuario activo.",
        };
    }

    const user = findAdminUserById(parsed.data.userId);

    if (!user) {
        return {
            ok: false,
            message: "El usuario no existe.",
        };
    }

    setUserActiveStatus(parsed.data);

    revalidatePath("/superuser");

    return {
        ok: true,
        message: parsed.data.isActive
            ? "Usuario activado correctamente."
            : "Usuario desactivado correctamente.",
    };
}