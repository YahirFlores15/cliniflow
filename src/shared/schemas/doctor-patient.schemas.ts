import { z } from "zod";


export const DoctorPatientSearchSchema =
    z.object({
        query: z
            .string()
            .trim()
            .max(
                120,
                "La búsqueda no puede superar los 120 caracteres."
            )
            .optional()
            .default(""),
    });

export const DoctorPatientRecordQuerySchema =
    z.object({
        patientId: z
            .string()
            .trim()
            .min(
                1,
                "El paciente es obligatorio."
            ),
    });

export const UpdateDoctorPatientRecordSchema =
    z.object({
        patientId: z
            .string()
            .trim()
            .min(
                1,
                "El paciente es obligatorio."
            ),

        allergies: z
            .string()
            .trim()
            .max(
                2000,
                "Las alergias no pueden superar los 2000 caracteres."
            )
            .optional()
            .default(""),

        chronicDiseases: z
            .string()
            .trim()
            .max(
                2000,
                "Las enfermedades crónicas no pueden superar los 2000 caracteres."
            )
            .optional()
            .default(""),

        currentMedications: z
            .string()
            .trim()
            .max(
                2000,
                "Los medicamentos actuales no pueden superar los 2000 caracteres."
            )
            .optional()
            .default(""),

        emergencyContactName: z
            .string()
            .trim()
            .max(
                120,
                "El nombre del contacto no puede superar los 120 caracteres."
            )
            .optional()
            .default(""),

        emergencyContactPhone: z
            .string()
            .trim()
            .max(
                30,
                "El teléfono del contacto no puede superar los 30 caracteres."
            )
            .optional()
            .default(""),
    });

export type DoctorPatientSearchInput =
    z.infer<
        typeof DoctorPatientSearchSchema
    >;

export type DoctorPatientRecordQueryInput =
    z.infer<
        typeof DoctorPatientRecordQuerySchema
    >;

export type UpdateDoctorPatientRecordInput =
    z.infer<
        typeof UpdateDoctorPatientRecordSchema
    >;