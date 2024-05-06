import { z } from "zod";
import cardValidator from "card-validator";

export const cardSchema = z.object({
  number: z
    .string({ required_error: "El número de tarjeta es requerido" })
    .max(255),
  cvc: z.string({ required_error: "El CVC es requerido" }).max(25),
  expiration_date: z
    .string({ required_error: "La fecha de vencimiento es requerida" })
    .max(25),
});

export const verifyCard = async (req, res, next) => {
  try {
    const cardValidation = cardValidator.number(req.body.number);
    if (!cardValidation.isValid) {
      throw new Error("Número de tarjeta inválido");
    }

    // Validar la fecha de expiración
    const expirationValidation = cardValidator.expirationDate(
      req.body.expiration_date
    );
    if (!expirationValidation.isValid) {
      throw new Error("Fecha de expiración inválida");
    }

    // Validar el CVC
    const cvcValidation = cardValidator.cvv(req.body.cvc);
    if (!cvcValidation.isValid) {
      throw new Error("CVC inválido");
    }

    
    next();
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};
