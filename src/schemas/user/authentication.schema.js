import { z } from "zod";

export const registerSchema = z.object({
  first_name: z.string({ required_error: "El nombre es requerido" }).max(50),
  last_name: z.string({ required_error: "El apellido es requerido" }).max(50),
  user_name: z
    .string({ required_error: "El nombre de usuario es requerido" })
    .min(5, { message: "El nombre de usuario debe tener al menos 5 caracteres" })
    .max(16, { message: "El nombre de usuario debe tener como máximo 16 caracteres" })
    .regex(/^\S*$/, "El nombre de usuario no puede contener espacios"),
  mail: z
    .string({ required_error: "El correo electrónico es requerido" })
    .email({message:"Correo invalido"})
    .max(255),
  password: z
    .string({ required_error: "La contraseña es requerida" })
    .min(5, { message: "La contraseña debe tener al menos 5 caracteres" })
    .max(16, { message: "La contraseña debe tener como máximo 16 caracteres" })
    .regex(
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{5,16}$/,
      "La contraseña debe contener al menos un número, una letra mayúscula y una letra minúscula"
    ),
  identification_card: z
    .string({ required_error: "La cédula es requerida" })
    .min(5, { message: "La cédula debe tener al menos 5 caracteres" })
    .max(50)
    .regex(/^\d+$/, "La cédula debe contener solo números"),
  is_active: z.boolean().optional(),
});

export const loginSchema = z.object({
  user_name: z.string({
    required_error: "El nombre de usuario es requerido",
  }),
  password: z.string({
    required_error: "La contraseña es requerida",
  }),
});

export const passwordSchema = z.object({
  password: z
    .string()
    .min(5, { message: "La contraseña debe tener al menos 5 caracteres" })
    .max(16, { message: "La contraseña debe tener como máximo 16 caracteres" })
    .regex(
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{5,16}$/,
      "La contraseña debe contener al menos un número, una letra mayúscula y una letra minúscula"
    ),
});
