import type { PatientAppointmentDTO, PatientMedicalNoteDTO, PatientProfileDTO, } from "@/shared/dtos/patient.dtos";
import { listPatientAppointments, listPatientMedicalNotes, } from "@/server/modules/patient/patient.repository";
import { getPatientProfileOrThrow, } from "@/server/modules/patient/patient-context.service";


export type PatientHistoryItemDTO = {
    appointment:
    PatientAppointmentDTO;
    medicalNote:
    PatientMedicalNoteDTO | null;
};

export type PatientHistorySummaryDTO = {
    totalAppointments: number;
    completedAppointments: number;
    cancelledAppointments: number;
    pendingStatusAppointments: number;
    appointmentsWithMedicalNote: number;
};

export type PatientHistoryWorkspaceDTO = {
    profile:
    PatientProfileDTO;
    items:
    PatientHistoryItemDTO[];
    summary:
    PatientHistorySummaryDTO;
};

function parseAppointmentDateTime(
    appointment:
        PatientAppointmentDTO
): Date | null {
    const value =
        new Date(
            `${appointment.scheduledDate}T${appointment.startTime}:00`
        );

    if (
        Number.isNaN(
            value.getTime()
        )
    ) {
        return null;
    }

    return value;
}

function compareAppointmentsDescending(
    first:
        PatientAppointmentDTO,
    second:
        PatientAppointmentDTO
): number {
    const firstDate =
        parseAppointmentDateTime(
            first
        );

    const secondDate =
        parseAppointmentDateTime(
            second
        );

    if (
        !firstDate &&
        !secondDate
    ) {
        return 0;
    }

    if (!firstDate) {
        return 1;
    }

    if (!secondDate) {
        return -1;
    }

    return (
        secondDate.getTime() -
        firstDate.getTime()
    );
}

function isHistoricalAppointment(
    appointment:
        PatientAppointmentDTO,
    now:
        Date
): boolean {
    if (
        appointment.status !==
        "SCHEDULED"
    ) {
        return true;
    }

    const appointmentDateTime =
        parseAppointmentDateTime(
            appointment
        );

    return Boolean(
        !appointmentDateTime ||
        appointmentDateTime <=
        now
    );
}

export function getPatientHistory(
    userId: string
): PatientHistoryWorkspaceDTO {
    const profile =
        getPatientProfileOrThrow(
            userId
        );

    const appointments =
        listPatientAppointments(
            profile.id
        );

    const medicalNotes =
        listPatientMedicalNotes(
            profile.id
        );

    const medicalNotesByAppointmentId =
        new Map<
            string,
            PatientMedicalNoteDTO
        >(
            medicalNotes.map(
                (
                    note
                ) => [
                        note.appointmentId,
                        note,
                    ]
            )
        );

    const now =
        new Date();

    const historicalAppointments =
        appointments
            .filter(
                (
                    appointment
                ) =>
                    isHistoricalAppointment(
                        appointment,
                        now
                    )
            )
            .sort(
                compareAppointmentsDescending
            );

    const items =
        historicalAppointments.map(
            (
                appointment
            ): PatientHistoryItemDTO => ({
                appointment,
                medicalNote:
                    medicalNotesByAppointmentId.get(
                        appointment.id
                    ) ??
                    null,
            })
        );

    return {
        profile,
        items,
        summary: {
            totalAppointments:
                items.length,

            completedAppointments:
                items.filter(
                    (
                        item
                    ) =>
                        item.appointment
                            .status ===
                        "COMPLETED"
                ).length,

            cancelledAppointments:
                items.filter(
                    (
                        item
                    ) =>
                        item.appointment
                            .status ===
                        "CANCELLED"
                ).length,

            pendingStatusAppointments:
                items.filter(
                    (
                        item
                    ) =>
                        item.appointment
                            .status ===
                        "SCHEDULED"
                ).length,

            appointmentsWithMedicalNote:
                items.filter(
                    (
                        item
                    ) =>
                        item.medicalNote !==
                        null
                ).length,
        },
    };
}