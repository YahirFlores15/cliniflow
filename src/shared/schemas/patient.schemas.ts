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
        message: "El sexo del paciente no es válido.",
    }
);

export const PatientAppointmentStatusSchema = z.enum(
    ["SCHEDULED", "CANCELLED", "COMPLETED"],
    {
        message: "El estado de la cita no es válido.",
    }
);

export const PatientUpdateProfileSchema = z.object({
    phone: z
        .string()
        .trim()
        .min(7, "El teléfono debe tener al menos 7 caracteres.")
        .max(30, "El teléfono no puede superar los 30 caracteres."),
    address: z
        .string()
        .trim()
        .max(250, "La dirección no puede superar los 250 caracteres.")
        .optional()
        .default(""),
});

export const PatientCancelAppointmentSchema = z.object({
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

export const PatientRescheduleAppointmentSchema = z.object({
    appointmentId: z
        .string()
        .trim()
        .min(1, "La cita es obligatoria."),
    scheduledDate: DateSchema,
    startTime: TimeSchema,
});

export type PatientSex = z.infer<typeof PatientSexSchema>;

export type PatientAppointmentStatus = z.infer<
    typeof PatientAppointmentStatusSchema
>;

export type PatientUpdateProfileInput = z.infer<
    typeof PatientUpdateProfileSchema
>;

export type PatientCancelAppointmentInput = z.infer<
    typeof PatientCancelAppointmentSchema
>;

export type PatientRescheduleAppointmentInput = z.infer<
    typeof PatientRescheduleAppointmentSchema
>;