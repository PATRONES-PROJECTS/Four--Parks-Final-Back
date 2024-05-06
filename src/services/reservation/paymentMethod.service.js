import { prisma } from "../../conn.js";

export const getPaymentMethodsService = async () => {
  try {
    const result = await prisma.payment_methods.findMany();

    return result;
  } catch (error) {
    throw error;
  }
};

export const getPaymentMethodByIdService = async (id) => {
  try {
    const result = await prisma.payment_methods.findUnique({
      where: { id_payment_method: parseInt(id) },
    });

    if (!result) throw new Error("No se encontró el método de pago");

    // Acordarse que las funciones flecha no es necesario el return al final
    return result;
  } catch (error) {
    throw error;
  }
};

export const getPaymentMethodByName = async (name) => {
  try {
    const result = await prisma.payment_methods.findUnique({
      where: { name: name },
    });

    if (!result) throw new Error("No se encontró el método de pago");

    // Acordarse que las funciones flecha no es necesario el return al final
    return result;
  } catch (error) {
    throw error;
  }
};

export const createPaymentMethodsService = async (paymentMethods) => {
  try {
    const result = await prisma.payment_methods.createMany({
      data: paymentMethods,
      skipDuplicates: true,
    });

    return result;
  } catch (error) {
    throw error;
  }
};
