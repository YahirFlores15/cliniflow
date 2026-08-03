import type { PatientMedicalNoteDTO, PatientProfileDTO, } from "@/shared/dtos/patient.dtos";
import { getPatientProfileOrThrow, } from "@/server/modules/patient/patient-context.service";
import { listPatientMedicalNotes, } from "@/server/modules/patient/patient.repository";


export type PatientPrescriptionDTO = {
    noteId: string;
    appointmentId: string;
    doctorId: string;
    doctorName: string;
    doctorSpecialty:
    string
    | null;
    scheduledDate: string;
    startTime: string;
    consultationReason: string;
    diagnosis: string;
    prescriptionText:
    string
    | null;
    instructionsText:
    string
    | null;
    treatment:
    string
    | null;
    createdAt: string;
};

export type PatientPrescriptionsSummaryDTO = {
    totalMedicalNotes: number;
    prescriptionsCount: number;
    instructionsCount: number;
    treatmentsCount: number;
};

export type PatientPrescriptionsWorkspaceDTO = {
    profile:
    PatientProfileDTO;
    prescriptions:
    PatientPrescriptionDTO[];
    summary:
    PatientPrescriptionsSummaryDTO;
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

function mapMedicalNoteToPrescription(
    note:
        PatientMedicalNoteDTO
): PatientPrescriptionDTO {
    return {
        noteId:
            note.id,
        appointmentId:
            note.appointmentId,
        doctorId:
            note.doctorId,
        doctorName:
            note.doctorName,
        doctorSpecialty:
            note.doctorSpecialty,
        scheduledDate:
            note.scheduledDate,
        startTime:
            note.startTime,
        consultationReason:
            note.consultationReason,
        diagnosis:
            note.diagnosis,
        prescriptionText:
            note.prescriptionText,
        instructionsText:
            note.instructionsText,
        treatment:
            note.treatment,
        createdAt:
            note.createdAt,
    };
}

export function getPatientPrescriptionsWorkspace(
    userId: string
): PatientPrescriptionsWorkspaceDTO {
    const profile =
        getPatientProfileOrThrow(
            userId
        );

    const medicalNotes =
        listPatientMedicalNotes(
            profile.id
        );

    const prescriptionNotes =
        medicalNotes.filter(
            (
                note
            ) =>
                hasRegisteredValue(
                    note.prescriptionText
                ) ||
                hasRegisteredValue(
                    note.instructionsText
                ) ||
                hasRegisteredValue(
                    note.treatment
                )
        );

    return {
        profile,
        prescriptions:
            prescriptionNotes.map(
                mapMedicalNoteToPrescription
            ),
        summary: {
            totalMedicalNotes:
                medicalNotes.length,
            prescriptionsCount:
                medicalNotes.filter(
                    (
                        note
                    ) =>
                        hasRegisteredValue(
                            note.prescriptionText
                        )
                ).length,
            instructionsCount:
                medicalNotes.filter(
                    (
                        note
                    ) =>
                        hasRegisteredValue(
                            note.instructionsText
                        )
                ).length,
            treatmentsCount:
                medicalNotes.filter(
                    (
                        note
                    ) =>
                        hasRegisteredValue(
                            note.treatment
                        )
                ).length,
        },
    };
}