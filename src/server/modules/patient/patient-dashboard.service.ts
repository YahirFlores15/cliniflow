import {
    listPatientAppointments,
    listPatientMedicalNotes,
} from "@/server/modules/patient/patient.repository";
import {
    getPatientProfileOrThrow,
} from "@/server/modules/patient/patient-context.service";
import type {
    PatientAppointmentDTO,
    PatientPortalSummaryDTO,
    PatientProfileDTO,
} from "@/shared/dtos/patient.dtos";


export type PatientDashboardDTO = {
    profile: PatientProfileDTO;
    summary: PatientPortalSummaryDTO;
    nextAppointment:
        | PatientAppointmentDTO
        | null;
    recentAppointments:
        PatientAppointmentDTO[];
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

function sortAppointmentsAscending(
    appointments:
        PatientAppointmentDTO[]
): PatientAppointmentDTO[] {
    return [
        ...appointments,
    ].sort(
        (
            first,
            second
        ) => {
            const firstDate =
                parseAppointmentDateTime(
                    first
                );

            const secondDate =
                parseAppointmentDateTime(
                    second
                );

            if (
                !firstDate ||
                !secondDate
            ) {
                return 0;
            }

            return (
                firstDate.getTime() -
                secondDate.getTime()
            );
        }
    );
}

function sortAppointmentsDescending(
    appointments:
        PatientAppointmentDTO[]
): PatientAppointmentDTO[] {
    return [
        ...appointments,
    ].sort(
        (
            first,
            second
        ) => {
            const firstDate =
                parseAppointmentDateTime(
                    first
                );

            const secondDate =
                parseAppointmentDateTime(
                    second
                );

            if (
                !firstDate ||
                !secondDate
            ) {
                return 0;
            }

            return (
                secondDate.getTime() -
                firstDate.getTime()
            );
        }
    );
}

export function getPatientDashboard(
    userId: string
): PatientDashboardDTO {
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

    const now =
        new Date();

    const upcomingAppointments =
        sortAppointmentsAscending(
            appointments.filter(
                (
                    appointment
                ) => {
                    if (
                        appointment.status !==
                        "SCHEDULED"
                    ) {
                        return false;
                    }

                    const appointmentDateTime =
                        parseAppointmentDateTime(
                            appointment
                        );

                    return Boolean(
                        appointmentDateTime &&
                        appointmentDateTime >
                        now
                    );
                }
            )
        );

    const completedAppointments =
        appointments.filter(
            (
                appointment
            ) =>
                appointment.status ===
                "COMPLETED"
        );

    const cancelledAppointments =
        appointments.filter(
            (
                appointment
            ) =>
                appointment.status ===
                "CANCELLED"
        );

    const recentAppointments =
        sortAppointmentsDescending(
            appointments.filter(
                (
                    appointment
                ) => {
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
            )
        ).slice(
            0,
            3
        );

    return {
        profile,
        summary: {
            upcomingAppointments:
                upcomingAppointments.length,
            completedAppointments:
                completedAppointments.length,
            cancelledAppointments:
                cancelledAppointments.length,
            medicalNotes:
                medicalNotes.length,
        },
        nextAppointment:
            upcomingAppointments[0] ??
            null,
        recentAppointments,
    };
}
