import type { PatientMedicalRecordDTO, PatientProfileDTO, } from "@/shared/dtos/patient.dtos";
import { getPatientProfileOrThrow, } from "@/server/modules/patient/patient-context.service";
import { findPatientMedicalRecord, } from "@/server/modules/patient/patient.repository";


export type PatientProfileWorkspaceDTO = {
    profile:
    PatientProfileDTO;
    medicalRecord:
    PatientMedicalRecordDTO;
    profileCompletionPercentage:
    number;
    editableFieldsCompleted:
    number;
    editableFieldsTotal:
    number;
};

function hasRegisteredValue(
    value:
        string
        | null
): boolean {
    return Boolean(
        value?.trim()
    );
}

function calculateProfileCompletion(
    profile:
        PatientProfileDTO
): {
    percentage: number;
    completed: number;
    total: number;
} {
    const fields = [
        profile.name,
        profile.email,
        profile.phone,
        profile.birthDate,
        profile.sex,
        profile.address,
    ];

    const completed =
        fields.filter(
            hasRegisteredValue
        ).length;

    const total =
        fields.length;

    return {
        percentage:
            Math.round(
                (
                    completed /
                    total
                ) *
                100
            ),
        completed,
        total,
    };
}

export function getPatientProfileWorkspace(
    userId: string
): PatientProfileWorkspaceDTO {
    const profile =
        getPatientProfileOrThrow(
            userId
        );

    const medicalRecord =
        findPatientMedicalRecord(
            profile.id
        );

    const completion =
        calculateProfileCompletion(
            profile
        );

    return {
        profile,
        medicalRecord,
        profileCompletionPercentage:
            completion.percentage,
        editableFieldsCompleted:
            completion.completed,
        editableFieldsTotal:
            completion.total,
    };
}