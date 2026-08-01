"use server";

import {
    revalidatePath,
} from "next/cache";

import {
    requireRole,
} from "@/server/auth/session";
import {
    DoctorScheduleDomainError,
    saveScheduleForDoctor,
} from "@/server/modules/doctor/doctor-schedule.service";
import {
    ROLES,
} from "@/shared/constants/roles";
import {
    UpsertDoctorScheduleSchema,
} from "@/shared/schemas/doctor.schemas";

export type DoctorScheduleActionState = {
    ok: boolean;
    message: string;
};

function getScheduleActionErrorState(
    error: unknown
): DoctorScheduleActionState {
    if (
        error instanceof
        DoctorScheduleDomainError
    ) {
        return {
            ok: false,
            message:
                error.message,
        };
    }

    console.error(
        error
    );

    return {
        ok: false,
        message:
            "Ocurrió un error inesperado al guardar el horario.",
    };
}

export async function saveDoctorScheduleAction(
    _previousState:
        DoctorScheduleActionState,
    formData: FormData
): Promise<DoctorScheduleActionState> {
    const session =
        await requireRole([
            ROLES.DOCTOR,
        ]);

    const rawData = {
        weekday:
            String(
                formData.get(
                    "weekday"
                ) ?? ""
            ),

        startTime:
            String(
                formData.get(
                    "startTime"
                ) ?? ""
            ),

        endTime:
            String(
                formData.get(
                    "endTime"
                ) ?? ""
            ),

        appointmentDurationMinutes:
            String(
                formData.get(
                    "appointmentDurationMinutes"
                ) ?? ""
            ),

        isActive:
            formData.get(
                "isActive"
            ) === "on",
    };

    const parsed =
        UpsertDoctorScheduleSchema.safeParse(
            rawData
        );

    if (
        !parsed.success
    ) {
        return {
            ok: false,
            message:
                parsed.error
                    .issues[0]
                    ?.message ??
                "Los datos del horario no son válidos.",
        };
    }

    try {
        saveScheduleForDoctor({
            userId:
                session.user.id,
            input:
                parsed.data,
        });

        revalidatePath(
            "/doctor"
        );

        revalidatePath(
            "/doctor/agenda"
        );

        revalidatePath(
            "/doctor/schedule"
        );

        revalidatePath(
            "/staff"
        );

        revalidatePath(
            "/staff/appointments"
        );

        revalidatePath(
            "/staff/availability"
        );

        return {
            ok: true,
            message:
                "El horario fue guardado correctamente.",
        };
    } catch (error) {
        return getScheduleActionErrorState(
            error
        );
    }
}