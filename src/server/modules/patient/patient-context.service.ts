import {
    findPatientProfileByUserId,
} from "@/server/modules/patient/patient.repository";
import type {
    PatientProfileDTO,
} from "@/shared/dtos/patient.dtos";


export class PatientContextDomainError
    extends Error {
    constructor(
        message: string
    ) {
        super(
            message
        );

        this.name =
            "PatientContextDomainError";
    }
}

export function getPatientProfileOrThrow(
    userId: string
): PatientProfileDTO {
    const profile =
        findPatientProfileByUserId(
            userId
        );

    if (!profile) {
        throw new PatientContextDomainError(
            "No existe un perfil de paciente asociado a esta cuenta."
        );
    }

    if (!profile.isActive) {
        throw new PatientContextDomainError(
            "El perfil del paciente está desactivado."
        );
    }

    return profile;
}
