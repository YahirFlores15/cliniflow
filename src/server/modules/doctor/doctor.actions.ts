"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/server/auth/session";
import {
    createBlockForDoctor,
    deleteBlockForDoctor,
    DoctorDomainError,
    saveDoctorSchedule,
} from "@/server/modules/doctor/doctor.service";
import { ROLES } from "@/shared/constants/roles";
import {
    CreateDoctorBlockSchema,
    DeleteDoctorBlockSchema,
    UpsertDoctorScheduleSchema,
} from "@/shared/schemas/doctor.schemas";

export type DoctorActionState = {
    ok: boolean;
    message: string;
};

function getActionErrorState(
    error: unknown
): DoctorActionState {
    if (error instanceof DoctorDomainError) {
        return {
            ok: false,
            message: error.message,
        };
    }

    console.error(error);

    return {
        ok: false,
        message:
            "Ocurrió un error inesperado. Intenta nuevamente.",
    };
}

export async function saveDoctorScheduleAction(
    _previousState: DoctorActionState,
    formData: FormData
): Promise<DoctorActionState> {
    const session = await requireRole([
        ROLES.DOCTOR,
    ]);

    const rawData = {
        weekday: String(
            formData.get("weekday") ?? ""
        ),
        startTime: String(
            formData.get("startTime") ?? ""
        ),
        endTime: String(
            formData.get("endTime") ?? ""
        ),
        appointmentDurationMinutes: String(
            formData.get(
                "appointmentDurationMinutes"
            ) ?? ""
        ),
        isActive:
            formData.get("isActive") === "on",
    };

    const parsed =
        UpsertDoctorScheduleSchema.safeParse(
            rawData
        );

    if (!parsed.success) {
        return {
            ok: false,
            message:
                parsed.error.issues[0]?.message ??
                "Los datos del horario no son válidos.",
        };
    }

    try {
        saveDoctorSchedule({
            userId: session.user.id,
            input: parsed.data,
        });

        revalidatePath("/doctor");

        return {
            ok: true,
            message:
                "Horario guardado correctamente.",
        };
    } catch (error) {
        return getActionErrorState(error);
    }
}

export async function createDoctorBlockAction(
    _previousState: DoctorActionState,
    formData: FormData
): Promise<DoctorActionState> {
    const session = await requireRole([
        ROLES.DOCTOR,
    ]);

    const rawData = {
        startDate: String(
            formData.get("startDate") ?? ""
        ),
        startTime: String(
            formData.get("startTime") ?? ""
        ),
        endDate: String(
            formData.get("endDate") ?? ""
        ),
        endTime: String(
            formData.get("endTime") ?? ""
        ),
        reason: String(
            formData.get("reason") ?? ""
        ),
    };

    const parsed =
        CreateDoctorBlockSchema.safeParse(
            rawData
        );

    if (!parsed.success) {
        return {
            ok: false,
            message:
                parsed.error.issues[0]?.message ??
                "Los datos del bloqueo no son válidos.",
        };
    }

    try {
        const result = createBlockForDoctor({
            userId: session.user.id,
            input: parsed.data,
        });

        revalidatePath("/doctor");
        revalidatePath("/staff");

        if (
            result.cancelledAppointments > 0
        ) {
            return {
                ok: true,
                message:
                    `Bloqueo creado. Se cancelaron ${result.cancelledAppointments} citas afectadas.`,
            };
        }

        return {
            ok: true,
            message:
                "Bloqueo creado correctamente. No había citas afectadas.",
        };
    } catch (error) {
        return getActionErrorState(error);
    }
}

export async function deleteDoctorBlockAction(
    _previousState: DoctorActionState,
    formData: FormData
): Promise<DoctorActionState> {
    const session = await requireRole([
        ROLES.DOCTOR,
    ]);

    const rawData = {
        blockId: String(
            formData.get("blockId") ?? ""
        ),
    };

    const parsed =
        DeleteDoctorBlockSchema.safeParse(
            rawData
        );

    if (!parsed.success) {
        return {
            ok: false,
            message:
                parsed.error.issues[0]?.message ??
                "El bloqueo no es válido.",
        };
    }

    try {
        deleteBlockForDoctor({
            userId: session.user.id,
            input: parsed.data,
        });

        revalidatePath("/doctor");
        revalidatePath("/staff");

        return {
            ok: true,
            message:
                "Bloqueo eliminado correctamente. Las citas canceladas previamente no fueron reactivadas.",
        };
    } catch (error) {
        return getActionErrorState(error);
    }
}