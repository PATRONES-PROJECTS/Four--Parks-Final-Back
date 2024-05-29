import { prisma } from "../../conn.js";

export const getLoyaltyByIdService = async (id, type_search) => {
  try {
    const result = await prisma.loyalties.findUnique({
      where: { [type_search]: parseInt(id) },
    });

    if (!result) throw new Error("No se encontró los puntos de fidelidad");

    console.log(result);

    return result;
  } catch (error) {
    throw error;
  }
};

export const createLoyaltyService = async (loyalty) => {
  try {
    const result = await prisma.loyalties.create({ data: loyalty });

    return result;
  } catch (error) {
    throw error;
  }
};

export const updateLoyaltyService = async (id, loyalty) => {
  try {
    const result = await prisma.loyalties.update({
      where: { id_loyalty: parseInt(id) },
      data: { loyalty_points: loyalty },
    });

    return result;
  } catch (error) {
    throw error;
  }
};


export const updateLoyaltyServiceByUser = async (id, loyalty) => {
  try {
    const result = await prisma.loyalties.update({
      where: { id_user_fk: parseInt(id) },
      data: { loyalty_points: loyalty },
    });

    return result;
  } catch (error) {
    throw error;
  }
};



