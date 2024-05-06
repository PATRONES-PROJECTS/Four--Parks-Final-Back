import { prisma } from "../../conn.js";

export const getTypesParkingService = async () => {
  try {
    const result = await prisma.types_parking.findMany();

    return result;
  } catch (error) {
    throw error;
  }
};

export const getTypeParkingByIdService = async (id) => {
  try {
    const result = await prisma.types_parking.findUnique({
      where: { id_type_parking: parseInt(id) },
    });

    if (!result) throw new Error("No se encontró el tipo de parqueadero");

    // Acordarse que las funciones flecha no es necesario el return al final
    return result;
  } catch (error) {
    throw error;
  }
};

export const createTypesParkingService = async (typeParkings) => {
  try {
    const result = await prisma.types_parking.createMany({
      data: typeParkings,
      skipDuplicates: true,
    });

    return result;
  } catch (error) {
    throw error;
  }
};
