import { prisma } from "../../conn.js";

export const getVehiclesService = async () => {
  try {
    const result = await prisma.vehicles.findMany();

    return result;
  } catch (error) {
    throw error;
  }
};

export const getVehicleByIdService = async (id) => {
  try {
    const result = await prisma.vehicles.findUnique({
      where: { id_vehicle: parseInt(id) },
    });

    if (!result) throw new Error("No se encontró el vehículo");

    // Acordarse que las funciones flecha no es necesario el return al final
    return result;
  } catch (error) {
    throw error;
  }
};

export const getVehicleByName = async (name) => {
  try {
    const result = await prisma.vehicles.findUnique({
      where: { name: name },
    });

    if (!result) throw new Error("No se encontró el vehículo");

    // Acordarse que las funciones flecha no es necesario el return al final
    return result;
  } catch (error) {
    throw error;
  }
};

export const createVehiclesService = async (vehicles) => {
  try {
    const result = await prisma.vehicles.createMany({
      data: vehicles,
      skipDuplicates: true,
    });

    return result;
  } catch (error) {
    throw error;
  }
};
