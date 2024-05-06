import { prisma } from "../../conn.js";

export const getRolesService = async () => {
  try {
    const result = await prisma.roles.findMany();

    return result;
  } catch (error) {
    throw error;
  }
};

export const getRoleByIdService = async (id) => {
  try {
    const result = await prisma.roles.findUnique({
      where: { id_role: parseInt(id) },
    });

    if (!result) throw new Error("No se encontró el rol");

    // Acordarse que las funciones flecha no es necesario el return al final
    return result;
  } catch (error) {
    throw error;
  }
};

export const getRoleByNameService = async (name) => {
  try {
    const result = await prisma.roles.findUnique({
      where: { name: name },
    });

    if (!result) throw new Error("No se encontró el rol");

    // Acordarse que las funciones flecha no es necesario el return al final
    return result;
  } catch (error) {
    throw error;
  }
};

export const createRolesService = async (roles) => {
  try {
    const result = await prisma.roles.createMany({
      data: roles,
      skipDuplicates: true,
    });

    return result;
  } catch (error) {
    throw error;
  }
};
