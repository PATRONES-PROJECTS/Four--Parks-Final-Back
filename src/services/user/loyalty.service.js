import { prisma } from "../../conn.js";



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
