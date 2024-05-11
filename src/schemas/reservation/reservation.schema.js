import { z } from "zod";

export const reservationSchema = z.object({
  entry_reservation_date: z
    .number({ required_error: "La hora de entrada es requerida" })
    .int(),
  departure_reservation_date: z
    .number({ required_error: "La hora de salida es requerida" })
    .int(),
  id_vehicle_fk: z
    .number({ required_error: "El id del vehículo es requerido" })
    .int(),
  id_parking_fk: z
    .number({ required_error: "El id del parqueadero es requerido" })
    .int(),
  id_payment_method_fk: z
    .number({ required_error: "El id del método de pago es requerido" })
    .int(),
  reservation_date: z
    .string({ required_error: "La fecha de la reserva es requerida" })
    .max(25)
    .regex(/^\d{4}-\d{2}-\d{2}$/, "El formato de la fecha es invalido"),
  vehicle_code: z
    .string({ required_error: "El identificador del vehículo" })
    .max(50),
});
