import { z } from "zod";


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

export type DoctorAppointmentStatus = z.infer<
    typeof DoctorAppointmentStatusSchema
>;

export type DoctorAgendaFilterInput = z.infer<
    typeof DoctorAgendaFilterSchema
>;