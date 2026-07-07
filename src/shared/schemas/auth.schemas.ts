import { ROLE_VALUES } from "@/shared/constants/roles";
import { z } from "zod";


export const LoginSchema = z.object({
    email: z
        .string()
        .trim()
        .min(1, "El email es obligatorio.")
        .email("El email no es válido."),
    password: z
        .string()
        .min(1, "La contraseña es obligatoria."),
});

export const CreateUserSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "El nombre debe tener al menos 2 caracteres."),
    email: z
        .string()
        .trim()
        .min(1, "El email es obligatorio.")
        .email("El email no es válido."),
    password: z
        .string()
        .min(8, "La contraseña debe tener al menos 8 caracteres."),
    role: z.enum(ROLE_VALUES, {
        message: "El rol seleccionado no es válido.",
    }),
});

export const UpdateUserSchema = z.object({
    userId: z
        .string()
        .trim()
        .min(1, "El usuario es obligatorio."),
    name: z
        .string()
        .trim()
        .min(2, "El nombre debe tener al menos 2 caracteres."),
    email: z
        .string()
        .trim()
        .min(1, "El email es obligatorio.")
        .email("El email no es válido."),
});

export const UpdateUserStatusSchema = z.object({
    userId: z
        .string()
        .trim()
        .min(1, "El usuario es obligatorio."),
    isActive: z
        .boolean(),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
export type UpdateUserStatusInput = z.infer<typeof UpdateUserStatusSchema>;