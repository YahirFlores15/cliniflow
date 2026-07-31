"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/server/auth/session";
import {
    cancelAppointmentForPatient,
    PatientDomainError,
    rescheduleAppointmentForPatient,
    updateProfileForPatient,
} from "@/server/modules/patient/patient.service";
import { ROLES } from "@/shared/constants/roles";
import {
    PatientCancelAppointmentSchema,
    PatientRescheduleAppointmentSchema,
    PatientUpdateProfileSchema,
} from "@/shared/schemas/patient.schemas";

export type PatientActionState = {
    ok: boolean;
    message: string;
};

function getActionErrorMessage(error: unknown): string {
    if (error instanceof PatientDomainError) {
        return error.message;
    }

    if (error instanceof Error) {
        console.error(error);
    }

    return "Ocurrió un error inesperado. Intenta nuevamente.";
}

export async function updatePatientProfileAction(
    _previousState: PatientActionState,
    formData: FormData
): Promise<PatientActionState> {
    const session = await requireRole([ROLES.PATIENT]);

    const parsed = PatientUpdateProfileSchema.safeParse({
        phone: String(formData.get("phone") ?? ""),
        address: String(formData.get("address") ?? ""),
    });

    if (!parsed.success) {
        return {
            ok: false,
            message:
                parsed.error.issues[0]?.message ??
                "Los datos del perfil no son válidos.",
        };
    }

    try {
        updateProfileForPatient({
            userId: session.user.id,
            input: parsed.data,
        });

        revalidatePath("/patient");

        return {
            ok: true,
            message: "El perfil se actualizó correctamente.",
        };
    } catch (error) {
        return {
            ok: false,
            message: getActionErrorMessage(error),
        };
    }
}

export async function cancelPatientAppointmentAction(
    _previousState: PatientActionState,
    formData: FormData
): Promise<PatientActionState> {
    const session = await requireRole([ROLES.PATIENT]);

    const parsed =
        PatientCancelAppointmentSchema.safeParse({
            appointmentId: String(
                formData.get("appointmentId") ?? ""
            ),
            reason: String(formData.get("reason") ?? ""),
        });

    if (!parsed.success) {
        return {
            ok: false,
            message:
                parsed.error.issues[0]?.message ??
                "Los datos de cancelación no son válidos.",
        };
    }

    try {
        cancelAppointmentForPatient({
            userId: session.user.id,
            input: parsed.data,
        });

        revalidatePath("/patient");
        revalidatePath("/doctor");
        revalidatePath("/staff");

        return {
            ok: true,
            message: "La cita se canceló correctamente.",
        };
    } catch (error) {
        return {
            ok: false,
            message: getActionErrorMessage(error),
        };
    }
}

export async function reschedulePatientAppointmentAction(
    _previousState: PatientActionState,
    formData: FormData
): Promise<PatientActionState> {
    const session = await requireRole([ROLES.PATIENT]);

    const parsed =
        PatientRescheduleAppointmentSchema.safeParse({
            appointmentId: String(
                formData.get("appointmentId") ?? ""
            ),
            scheduledDate: String(
                formData.get("scheduledDate") ?? ""
            ),
            startTime: String(
                formData.get("startTime") ?? ""
            ),
        });

    if (!parsed.success) {
        return {
            ok: false,
            message:
                parsed.error.issues[0]?.message ??
                "Los datos de reagendado no son válidos.",
        };
    }

    try {
        rescheduleAppointmentForPatient({
            userId: session.user.id,
            input: parsed.data,
        });

        revalidatePath("/patient");
        revalidatePath("/doctor");
        revalidatePath("/staff");

        return {
            ok: true,
            message: "La cita se reagendó correctamente.",
        };
    } catch (error) {
        return {
            ok: false,
            message: getActionErrorMessage(error),
        };
    }
}