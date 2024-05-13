import { z } from "zod";

export const statisticSchema = z.object({
  startDate: z
    .string({ required_error: "La fecha de inicio es requerida" })
    .max(25)
    .regex(/^\d{4}-\d{2}-\d{2}$/, "El formato de la fecha es invalido"),
  endDate: z
    .string({ required_error: "La fecha de finalización es requerida" })
    .max(25)
    .regex(/^\d{4}-\d{2}-\d{2}$/, "El formato de la fecha es invalido"),
});
