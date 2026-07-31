import { z } from "zod";


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
    z
        .string()
        .regex(
            /^\d{4}-\d{2}-\d{2}$/,
            "La fecha debe tener el formato YYYY-MM-DD."
        )
        .optional()
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

export type DoctorAppointmentStatus = z.infer<
    typeof DoctorAppointmentStatusSchema
>;

export type DoctorAgendaFilterInput = z.infer<
    typeof DoctorAgendaFilterSchema
>;

export type UpsertDoctorScheduleInput = z.infer<
    typeof UpsertDoctorScheduleSchema
>;