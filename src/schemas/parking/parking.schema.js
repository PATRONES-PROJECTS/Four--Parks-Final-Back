import { z } from "zod";

export const parkingSchema = z.object({
  name: z.string({ required_error: "El nombre es requerido" }).max(50),
  description: z
    .string({ required_error: "La descripción es requerida" })
    .max(255),
  address: z.string({ required_error: "La dirección es requerida" }).max(255),
  has_loyalty_service: z.string().optional(),
  is_active: z.string().optional(),
  id_city_fk: z
    .string({ required_error: "El ID de la ciudad es requerida" })
    .max(25),
  id_type_parking_fk: z
    .string({
      required_error: "El ID del tipo del parqueadero es requerido",
    })
    .max(25),
  id_schedule_fk: z
    .string({ required_error: "El ID del horario es requerido" })
    .max(25),
  id_user_fk: z
    .string({ required_error: "El ID del usuario es requerido" })
    .max(25),
});
