"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/server/auth/session";
import {
    DoctorDomainError,
    saveDoctorSchedule,
} from "@/server/modules/doctor/doctor.service";
import { ROLES } from "@/shared/constants/roles";
import {
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