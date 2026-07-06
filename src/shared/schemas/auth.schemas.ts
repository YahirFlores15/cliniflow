import { ROLE_VALUES } from "@/shared/constants/roles";
import { z } from "zod";


export const LoginSchema = z.object({
    email: z
        .string()
        .trim()
        .min(1, "El correo es requerido.")
        .email("Ingresa un correo válido.")
        .toLowerCase(),

    password: z
        .string()
        .min(1, "La contraseña es requerida."),
});

export const CreateUserSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "El nombre es requerido.")
        .max(120, "El nombre no puede superar 120 caracteres."),

    email: z
        .string()
        .trim()
        .min(1, "El correo es requerido.")
        .email("Ingresa un correo válido.")
        .toLowerCase(),

    password: z
        .string()
        .min(8, "La contraseña debe tener al menos 8 caracteres."),

    role: z.enum(ROLE_VALUES),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type CreateUserInput = z.infer<typeof CreateUserSchema>;