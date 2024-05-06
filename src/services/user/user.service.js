import { prisma } from "../../conn.js";
import {
  convertUserData,
  encryptString,
  restructureObject
} from "../../utils/dataConversion.js";

export const getUsersService = async (q, query) => {
  try {
    let whereClause = {};
    if (q) {
      whereClause = {
        OR: [
          { first_name: { contains: q, mode: "insensitive" } },
          { last_name: { contains: q, mode: "insensitive" } },
          { user_name: { contains: q, mode: "insensitive" } },
          { mail: { contains: q, mode: "insensitive" } },
        ],
      };
    }

    if (query) {
      let object_query = restructureObject(query);
      if (whereClause.OR) {
        whereClause.OR = [...whereClause.OR, ...object_query];
      } else if (object_query.length > 0) {
        whereClause.OR = [...object_query];
      }
    }

    const result = await prisma.users.findMany({
      where: whereClause,
      include: {
        user_controllers: {
          select: {
            is_account_blocked: true,
          },
        },
      },
    });

    return result;
  } catch (error) {
    throw error;
  }
};

export const getUserWithRoleService = async (role, q, query) => {
  try {
    let whereClause = {};
    if (q) {
      whereClause = {
        OR: [
          { first_name: { contains: q, mode: "insensitive" } },
          { last_name: { contains: q, mode: "insensitive" } },
          { user_name: { contains: q, mode: "insensitive" } },
          { mail: { contains: q, mode: "insensitive" } },
        ],
      };
    }

    if (query) {
      let object_query = restructureObject(query);
      if (whereClause.OR) {
        whereClause.OR = [...whereClause.OR, ...object_query];
      } else if (object_query.length > 0) {
        whereClause.OR = [...object_query];
      }
    }

    
    const result = await prisma.users.findMany({
      where: {
        roles: {
          name: role,
        },
        ...whereClause,
      },
      include: {
        user_controllers: {
          select: {
            is_account_blocked: true,
          },
        },
        loyalties: true,
      },
    });
    

    return result;
  } catch (error) {
    throw error;
  }
};

export const getUserByIdService = async (id) => {
  try {
    const result = await prisma.users.findUnique({
      where: { id_user: parseInt(id) },
      include: {
        user_controllers: {
          select: {
            is_account_blocked: true,
          },
        },
        roles: {
          select: { name: true },
        },
        loyalties: true,
      },
    });

    if (!result) throw new Error("No se encontró el usuario");

    // Acordarse que las funciones flecha no es necesario el return al final
    return result;
  } catch (error) {
    throw error;
  }
};

export const getUserByParameterService = async (id, type_search) => {
  try {
    const result = await prisma.users.findUnique({
      where: { [type_search]: id },
      include: {
        user_controllers: {
          select: {
            is_first_time: true,
            is_account_blocked: true,
            login_attempts: true,
          },
        },
        roles: {
          select: { name: true },
        },
      },
    });

    if (!result) throw new Error("No se encontró el usuario");

    // Acordarse que las funciones flecha no es necesario el return al final
    return result;
  } catch (error) {
    throw error;
  }
};

export const getPersonalUserService = async (id) => {
  try {
    const result = await prisma.users.findUnique({
      where: { id_user: id },
      select: {
        first_name: true,
        last_name: true,
        identification_card: true,
        mail: true,
        user_name: true,
        loyalties: true,
      },
    });

    if (!result) throw new Error("No se encontró el usuario");

    // Acordarse que las funciones flecha no es necesario el return al final
    return result;
  } catch (error) {
    throw error;
  }
};

export const createUserService = async (user) => {
  try {
    user = convertUserData(user);
    const result = await prisma.users.create({ data: user });

    return result;
  } catch (error) {
    throw error;
  }
};

export const updateUserService = async (id, user) => {
  try {
    const result = await prisma.users.update({
      where: { id_user: parseInt(id) },
      data: user,
    });

    return result;
  } catch (error) {
    throw error;
  }
};

export const updatePasswordService = async (id, password) => {
  try {
    password = encryptString(password);

    const result = await prisma.users.update({
      where: { id_user: id },
      data: {
        password: password,
      },
    });

    return result;
  } catch (error) {
    throw error;
  }
};

export const deactivateUserService = async (id) => {
  try {
    const result = await prisma.users.update({
      where: { id_user: id },
      data: {
        is_active: false,
      },
    });

    return result;
  } catch (error) {
    throw error;
  }
};

export const unlockUserService = async (id) => {
  try {
    const result = await prisma.user_controllers.update({
      where: { id_user_fk: parseInt(id) },
      data: {
        is_account_blocked: false,
        login_attempts: 0,
      },
    });

    return result;
  } catch (error) {
    throw error;
  }
};

export const deleteUserService = async (id) => {
  try {
    await prisma.users.delete({
      where: { id_user: parseInt(id) },
    });
  } catch (error) {
    throw error;
  }
};

export const createUserSeedService = async (user) => {
  try {
    user = convertUserData(user);
    const result = await prisma.users.createMany({
      data: user,
      skipDuplicates: true,
    });

    const userID = await prisma.users.findUnique({
      where: {
        mail: user.mail,
      },
    });

    const userController = {
      is_first_time: false,
      is_account_blocked: false,
      login_attempts: 0,
      id_user_fk: userID.id_user,
      verification_token: null,
    };
    await prisma.user_controllers.createMany({
      data: userController,
      skipDuplicates: true,
    });

    return result;
  } catch (error) {
    throw error;
  }
};
