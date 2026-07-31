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

export const PatientSexSchema = z.enum(
    ["MALE", "FEMALE", "OTHER", "UNSPECIFIED"],
    {
        message: "El sexo seleccionado no es válido.",
    }
);

export const AppointmentDurationSchema = z
    .number()
    .int()
    .refine((value) => value === 30 || value === 60, {
        message: "La duración debe ser de 30 o 60 minutos.",
    });

export const AppointmentStatusSchema = z.enum(
    ["SCHEDULED", "CANCELLED", "COMPLETED"],
    {
        message: "El estado de la cita no es válido.",
    }
);

export const CreatePatientSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "El nombre debe tener al menos 2 caracteres.")
        .max(120, "El nombre no puede superar los 120 caracteres."),
    email: z
        .string()
        .trim()
        .min(1, "El email es obligatorio.")
        .email("El email no es válido."),
    password: z
        .string()
        .min(8, "La contraseña debe tener al menos 8 caracteres.")
        .max(100, "La contraseña es demasiado larga."),
    phone: z
        .string()
        .trim()
        .min(7, "El teléfono debe tener al menos 7 caracteres.")
        .max(30, "El teléfono no puede superar los 30 caracteres."),
    birthDate: DateSchema,
    sex: PatientSexSchema,
    address: z
        .string()
        .trim()
        .max(250, "La dirección no puede superar los 250 caracteres.")
        .optional()
        .default(""),
});

export const UpdatePatientSchema = z.object({
    patientId: z
        .string()
        .trim()
        .min(1, "El paciente es obligatorio."),
    name: z
        .string()
        .trim()
        .min(2, "El nombre debe tener al menos 2 caracteres.")
        .max(120, "El nombre no puede superar los 120 caracteres."),
    email: z
        .string()
        .trim()
        .min(1, "El email es obligatorio.")
        .email("El email no es válido."),
    phone: z
        .string()
        .trim()
        .min(7, "El teléfono debe tener al menos 7 caracteres.")
        .max(30, "El teléfono no puede superar los 30 caracteres."),
    birthDate: DateSchema,
    sex: PatientSexSchema,
    address: z
        .string()
        .trim()
        .max(250, "La dirección no puede superar los 250 caracteres.")
        .optional()
        .default(""),
});

export const PatientSearchSchema = z.object({
    query: z
        .string()
        .trim()
        .max(120, "La búsqueda no puede superar los 120 caracteres.")
        .default(""),
});

export const CreateAppointmentSchema = z.object({
    patientId: z
        .string()
        .trim()
        .min(1, "El paciente es obligatorio."),
    doctorId: z
        .string()
        .trim()
        .min(1, "El doctor es obligatorio."),
    scheduledDate: DateSchema,
    startTime: TimeSchema,
    durationMinutes: z.coerce
        .number()
        .int()
        .refine((value) => value === 30 || value === 60, {
            message: "La duración debe ser de 30 o 60 minutos.",
        }),
    reason: z
        .string()
        .trim()
        .min(3, "El motivo debe tener al menos 3 caracteres.")
        .max(500, "El motivo no puede superar los 500 caracteres."),
});

export const RescheduleAppointmentSchema = z.object({
    appointmentId: z
        .string()
        .trim()
        .min(1, "La cita es obligatoria."),
    scheduledDate: DateSchema,
    startTime: TimeSchema,
});

export const CancelAppointmentSchema = z.object({
    appointmentId: z
        .string()
        .trim()
        .min(1, "La cita es obligatoria."),
    reason: z
        .string()
        .trim()
        .max(
            500,
            "El motivo de cancelación no puede superar los 500 caracteres."
        )
        .optional()
        .default(""),
});

export const AppointmentFilterSchema = z.object({
    date: DateSchema.optional(),
    doctorId: z.string().trim().optional(),
    patientId: z.string().trim().optional(),
    status: AppointmentStatusSchema.optional(),
});

export type PatientSex = z.infer<typeof PatientSexSchema>;
export type AppointmentStatus = z.infer<typeof AppointmentStatusSchema>;
export type AppointmentDuration = z.infer<
    typeof AppointmentDurationSchema
>;

export type CreatePatientInput = z.infer<typeof CreatePatientSchema>;
export type UpdatePatientInput = z.infer<typeof UpdatePatientSchema>;
export type PatientSearchInput = z.infer<typeof PatientSearchSchema>;

export type CreateAppointmentInput = z.infer<
    typeof CreateAppointmentSchema
>;

export type RescheduleAppointmentInput = z.infer<
    typeof RescheduleAppointmentSchema
>;

export type CancelAppointmentInput = z.infer<
    typeof CancelAppointmentSchema
>;

export type AppointmentFilterInput = z.infer<
    typeof AppointmentFilterSchema
>;