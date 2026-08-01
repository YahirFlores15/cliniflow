"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/server/auth/session";
import {
    createDoctorMedicalNote,
    DoctorNoteDomainError,
} from "@/server/modules/doctor/doctor-note.service";
import { ROLES } from "@/shared/constants/roles";
import {
    CreateMedicalNoteSchema,
} from "@/shared/schemas/doctor.schemas";

export type DoctorNoteActionState = {
    ok: boolean;
    message: string;
};

function getErrorState(
    error: unknown
): DoctorNoteActionState {
    if (
        error instanceof
        DoctorNoteDomainError
    ) {
        return {
            ok: false,
            message:
                error.message,
        };
    }

    console.error(error);

    return {
        ok: false,
        message:
            "Ocurrió un error inesperado al registrar la nota médica.",
    };
}

export async function createDoctorMedicalNoteAction(
    _previousState: DoctorNoteActionState,
    formData: FormData
): Promise<DoctorNoteActionState> {
    const session =
        await requireRole([
            ROLES.DOCTOR,
        ]);

    const rawData = {
        appointmentId: String(
            formData.get(
                "appointmentId"
            ) ?? ""
        ),
        reason: String(
            formData.get(
                "reason"
            ) ?? ""
        ),
        diagnosis: String(
            formData.get(
                "diagnosis"
            ) ?? ""
        ),
        treatment: String(
            formData.get(
                "treatment"
            ) ?? ""
        ),
        prescriptionText: String(
            formData.get(
                "prescriptionText"
            ) ?? ""
        ),
        instructionsText: String(
            formData.get(
                "instructionsText"
            ) ?? ""
        ),
    };

    const parsed =
        CreateMedicalNoteSchema.safeParse(
            rawData
        );

    if (!parsed.success) {
        return {
            ok: false,
            message:
                parsed.error.issues[0]
                    ?.message ??
                "Los datos de la nota médica no son válidos.",
        };
    }

    try {
        createDoctorMedicalNote({
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
            "/doctor/patients"
        );

        revalidatePath(
            "/patient"
        );

        redirect(
            "/doctor/agenda?noteCreated=1"
        );
    } catch (error) {
        if (
            error instanceof Error &&
            error.message.includes(
                "NEXT_REDIRECT"
            )
        ) {
            throw error;
        }

        return getErrorState(
            error
        );
    }
}