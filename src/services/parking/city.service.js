import { prisma } from "../../conn.js";

export const getCitiesService = async () => {
  try {
    const result = await prisma.cities.findMany();

    return result;
  } catch (error) {
    throw error;
  }
};

export const getCityByIdService = async (id) => {
  try {
    const result = await prisma.cities.findUnique({
      where: { id_city: parseInt(id) },
    });

    if (!result) throw new Error("No se encontró el vehículo");

    // Acordarse que las funciones flecha no es necesario el return al final
    return result;
  } catch (error) {
    throw error;
  }
};

export const createCitiesService = async (cities) => {
  try {
    const result = await prisma.cities.createMany({
      data: cities,
      skipDuplicates: true,
    });

    return result;
  } catch (error) {
    throw error;
  }
};
