import type { PatientMedicalRecordDTO, PatientProfileDTO, } from "@/shared/dtos/patient.dtos";
import { getPatientProfileOrThrow, } from "@/server/modules/patient/patient-context.service";
import { findPatientMedicalRecord, } from "@/server/modules/patient/patient.repository";


export type PatientMedicalRecordSummaryDTO = {
    hasMedicalRecord: boolean;
    completedSections: number;
    totalSections: number;
};

export type PatientMedicalRecordWorkspaceDTO = {
    profile:
    PatientProfileDTO;
    medicalRecord:
    PatientMedicalRecordDTO;
    summary:
    PatientMedicalRecordSummaryDTO;
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

export function getPatientMedicalRecordWorkspace(
    userId: string
): PatientMedicalRecordWorkspaceDTO {
    const profile =
        getPatientProfileOrThrow(
            userId
        );

    const medicalRecord =
        findPatientMedicalRecord(
            profile.id
        );

    const completedSections = [
        medicalRecord.allergies,
        medicalRecord.chronicDiseases,
        medicalRecord.currentMedications,
        medicalRecord.emergencyContactName ||
        medicalRecord.emergencyContactPhone,
    ].filter(
        hasRegisteredValue
    ).length;

    return {
        profile,
        medicalRecord,
        summary: {
            hasMedicalRecord:
                medicalRecord.id !==
                null,
            completedSections,
            totalSections:
                4,
        },
    };
}