import { prisma } from "../../conn.js";

export const createInvoiceService = async (invoice) => {
  try {
    const result = await prisma.invoices.create({
      data: invoice,
    });

    return result;
  } catch (error) {
    throw error;
  }
};

export const updateInvoiceService = async (id, invoice) => {
  try {
    const result = await prisma.invoices.update({
      where: { id_user: parseInt(id) },
      data: invoice,
    });

    return result;
  } catch (error) {
    throw error;
  }
};
