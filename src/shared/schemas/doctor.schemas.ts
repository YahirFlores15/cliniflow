import { z } from "zod";


const DateSchema = z
    .string()
    .trim()
    .regex(
        /^\d{4}-\d{2}-\d{2}$/,
        "La fecha debe tener el formato YYYY-MM-DD."
    );

const TimeSchema = z
    .string()
    .trim()
    .regex(
        /^([01]\d|2[0-3]):[0-5]\d$/,
        "La hora debe tener el formato HH:mm."
    );

const OptionalDateSchema = z.preprocess(
    (value) => {
        if (typeof value !== "string") {
            return undefined;
        }

        const normalizedValue = value.trim();

        return normalizedValue || undefined;
    },
    DateSchema.optional()
);

const OptionalAppointmentStatusSchema = z.preprocess(
    (value) => {
        if (typeof value !== "string") {
            return undefined;
        }

        const normalizedValue = value.trim();

        return normalizedValue || undefined;
    },
    z
        .enum(
            ["SCHEDULED", "CANCELLED", "COMPLETED"],
            {
                message:
                    "El estado de la cita no es válido.",
            }
        )
        .optional()
);

export const DoctorAppointmentStatusSchema = z.enum(
    ["SCHEDULED", "CANCELLED", "COMPLETED"],
    {
        message: "El estado de la cita no es válido.",
    }
);

export const DoctorAgendaFilterSchema = z.object({
    date: OptionalDateSchema,
    status: OptionalAppointmentStatusSchema,
});

export const UpsertDoctorScheduleSchema = z.object({
    weekday: z.coerce
        .number()
        .int()
        .min(1, "El día de la semana no es válido.")
        .max(7, "El día de la semana no es válido."),
    startTime: TimeSchema,
    endTime: TimeSchema,
    appointmentDurationMinutes: z.coerce
        .number()
        .int()
        .refine(
            (value) => value === 30 || value === 60,
            {
                message:
                    "La duración debe ser de 30 o 60 minutos.",
            }
        ),
    isActive: z.boolean(),
});

export const CreateDoctorBlockSchema = z.object({
    startDate: DateSchema,
    startTime: TimeSchema,
    endDate: DateSchema,
    endTime: TimeSchema,
    reason: z
        .string()
        .trim()
        .max(
            500,
            "El motivo no puede superar los 500 caracteres."
        )
        .optional()
        .default(""),
});

export const DeleteDoctorBlockSchema = z.object({
    blockId: z
        .string()
        .trim()
        .min(1, "El bloqueo es obligatorio."),
});

export const UpdateMedicalRecordSchema = z.object({
    patientId: z
        .string()
        .trim()
        .min(1, "El paciente es obligatorio."),
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

export type DoctorAppointmentStatus = z.infer<
    typeof DoctorAppointmentStatusSchema
>;

export type DoctorAgendaFilterInput = z.infer<
    typeof DoctorAgendaFilterSchema
>;

export type UpsertDoctorScheduleInput = z.infer<
    typeof UpsertDoctorScheduleSchema
>;

export type CreateDoctorBlockInput = z.infer<
    typeof CreateDoctorBlockSchema
>;

export type DeleteDoctorBlockInput = z.infer<
    typeof DeleteDoctorBlockSchema
>;

export type UpdateMedicalRecordInput = z.infer<
    typeof UpdateMedicalRecordSchema
>;