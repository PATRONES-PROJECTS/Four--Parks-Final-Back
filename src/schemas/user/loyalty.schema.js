import { z } from "zod";

export const loyaltySchema = z.object({
  loyalty_points: z
    .number({ required_error: "Los puntos de fidelidad son requeridos" })
    .int(),
});
