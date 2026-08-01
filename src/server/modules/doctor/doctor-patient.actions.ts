"use server";

import {
    revalidatePath,
} from "next/cache";
import {
    redirect,
} from "next/navigation";

import {
    requireRole,
} from "@/server/auth/session";
import {
    DoctorPatientDomainError,
    updatePatientRecordForDoctor,
} from "@/server/modules/doctor/doctor-patient.service";
import {
    ROLES,
} from "@/shared/constants/roles";
import {
    UpdateDoctorPatientRecordSchema,
} from "@/shared/schemas/doctor-patient.schemas";

export type DoctorPatientActionState = {
    ok: boolean;
    message: string;
};

function getErrorState(
    error: unknown
): DoctorPatientActionState {
    if (
        error instanceof
        DoctorPatientDomainError
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
            "Ocurrió un error inesperado al guardar el expediente.",
    };
}

export async function updateDoctorPatientRecordAction(
    _previousState:
        DoctorPatientActionState,
    formData: FormData
): Promise<DoctorPatientActionState> {
    const session =
        await requireRole([
            ROLES.DOCTOR,
        ]);

    const rawData = {
        patientId:
            String(
                formData.get(
                    "patientId"
                ) ?? ""
            ),

        allergies:
            String(
                formData.get(
                    "allergies"
                ) ?? ""
            ),

        chronicDiseases:
            String(
                formData.get(
                    "chronicDiseases"
                ) ?? ""
            ),

        currentMedications:
            String(
                formData.get(
                    "currentMedications"
                ) ?? ""
            ),

        emergencyContactName:
            String(
                formData.get(
                    "emergencyContactName"
                ) ?? ""
            ),

        emergencyContactPhone:
            String(
                formData.get(
                    "emergencyContactPhone"
                ) ?? ""
            ),
    };

    const parsed =
        UpdateDoctorPatientRecordSchema.safeParse(
            rawData
        );

    if (!parsed.success) {
        return {
            ok: false,

            message:
                parsed.error.issues[0]
                    ?.message ??
                "Los datos del expediente no son válidos.",
        };
    }

    try {
        updatePatientRecordForDoctor({
            userId:
                session.user.id,

            input:
                parsed.data,
        });
    } catch (error) {
        return getErrorState(
            error
        );
    }

    revalidatePath(
        "/doctor"
    );

    revalidatePath(
        "/doctor/patients"
    );

    revalidatePath(
        "/doctor/patients/record"
    );

    revalidatePath(
        "/patient"
    );

    redirect(
        `/doctor/patients/record?patientId=${encodeURIComponent(
            parsed.data.patientId
        )}&updated=1`
    );
}