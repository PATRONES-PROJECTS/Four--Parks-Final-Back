import { z } from "zod";

export const updateUserSchema = z.object({
  first_name: z.string({ required_error: "El nombre es requerido" }).max(50),
  last_name: z.string({ required_error: "El apellido es requerido" }).max(50),
  identification_card: z
    .string({ required_error: "La cédula es requerida" })
    .min(5, { message: "La cédula debe tener al menos 5 caracteres" })
    .max(50)
    .regex(/^\d+$/, "La cédula debe contener solo números"),
  user_name: z
    .string({ required_error: "El nombre de usuario es requerido" })
    .min(5)
    .max(16, {
      message: "El nombre de usuario debe tener como máximo 16 caracteres",
    }),
  loyalty_points: z
    .number({ message: "El los puntos de fidelidad deben ser valores enteros" })
    .int()
    .optional(),
});
