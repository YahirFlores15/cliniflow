import { findPatientRecordForDoctor, listRelatedPatientsForDoctor, upsertDoctorPatientRecord, } from "@/server/modules/doctor/doctor-patient.repository";
import type { DoctorPatientRecordDTO, DoctorRelatedPatientDTO, } from "@/shared/dtos/doctor-patient.dtos";
import type { UpdateDoctorPatientRecordInput, } from "@/shared/schemas/doctor-patient.schemas";
import { findDoctorProfileByUserId, } from "@/server/modules/doctor/doctor.repository";
import { getDb } from "@/server/db/connection";


export class DoctorPatientDomainError extends Error {
    constructor(message: string) {
        super(message);

        this.name =
            "DoctorPatientDomainError";
    }
}

function getLocalDateTime(
    date = new Date()
): string {
    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");

    const hours =
        String(
            date.getHours()
        ).padStart(2, "0");

    const minutes =
        String(
            date.getMinutes()
        ).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function getDoctorIdOrThrow(
    userId: string
): string {
    const doctor =
        findDoctorProfileByUserId(
            userId
        );

    if (!doctor) {
        throw new DoctorPatientDomainError(
            "No se encontró el perfil médico de la cuenta autenticada."
        );
    }

    if (!doctor.isActive) {
        throw new DoctorPatientDomainError(
            "La cuenta médica se encuentra desactivada."
        );
    }

    return doctor.id;
}

export function getRelatedPatientsForDoctor(
    params: {
        userId: string;
        searchQuery?: string;
    }
): DoctorRelatedPatientDTO[] {
    const doctorId =
        getDoctorIdOrThrow(
            params.userId
        );

    return listRelatedPatientsForDoctor({
        doctorId,

        searchQuery:
            params.searchQuery,

        currentDateTime:
            getLocalDateTime(),
    });
}

export function getPatientRecordForDoctor(
    params: {
        userId: string;
        patientId: string;
    }
): DoctorPatientRecordDTO | null {
    const doctorId =
        getDoctorIdOrThrow(
            params.userId
        );

    return findPatientRecordForDoctor({
        doctorId,

        patientId:
            params.patientId,

        currentDateTime:
            getLocalDateTime(),
    });
}

export function updatePatientRecordForDoctor(
    params: {
        userId: string;
        input:
        UpdateDoctorPatientRecordInput;
    }
): DoctorPatientRecordDTO {
    const doctorId =
        getDoctorIdOrThrow(
            params.userId
        );

    const currentRecord =
        findPatientRecordForDoctor({
            doctorId,

            patientId:
                params.input.patientId,

            currentDateTime:
                getLocalDateTime(),
        });

    if (!currentRecord) {
        throw new DoctorPatientDomainError(
            "No tienes acceso al expediente de este paciente."
        );
    }

    const database =
        getDb();

    const transaction =
        database.transaction(
            () => {
                upsertDoctorPatientRecord({
                    patientId:
                        params.input.patientId,

                    allergies:
                        params.input.allergies.trim(),

                    chronicDiseases:
                        params.input.chronicDiseases.trim(),

                    currentMedications:
                        params.input.currentMedications.trim(),

                    emergencyContactName:
                        params.input.emergencyContactName.trim(),

                    emergencyContactPhone:
                        params.input.emergencyContactPhone.trim(),
                });

                const updatedRecord =
                    findPatientRecordForDoctor({
                        doctorId,

                        patientId:
                            params.input.patientId,

                        currentDateTime:
                            getLocalDateTime(),
                    });

                if (!updatedRecord) {
                    throw new DoctorPatientDomainError(
                        "No se pudo recuperar el expediente actualizado."
                    );
                }

                return updatedRecord;
            }
        );

    return transaction();
}