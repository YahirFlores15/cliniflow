import type { PatientAppointmentDTO, PatientProfileDTO, } from "@/shared/dtos/patient.dtos";
import { getPatientProfileOrThrow, } from "@/server/modules/patient/patient-context.service";
import { listPatientAppointments, } from "@/server/modules/patient/patient.repository";


export type PatientAppointmentsWorkspaceDTO = {
    profile: PatientProfileDTO;
    appointments:
    PatientAppointmentDTO[];
};

export function getPatientAppointmentsWorkspace(
    userId: string
): PatientAppointmentsWorkspaceDTO {
    const profile =
        getPatientProfileOrThrow(
            userId
        );

    const appointments =
        listPatientAppointments(
            profile.id
        );

    return {
        profile,
        appointments,
    };
}