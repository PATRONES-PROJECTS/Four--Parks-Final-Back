import { prisma } from "../../conn.js";

import { encryptString } from "../../utils/dataConversion.js";
import { sendMail } from "./mail.service.js";

import { dataManager } from "../../config.js";

export const getUserControllerService = async (idUser, token) => {
  try {
    const result = await prisma.user_controllers.findUnique({
      where: { id_user_fk: idUser, verification_token: token },
    });

    if (!result) throw new Error("El token no es valido");

    return result;
  } catch (error) {
    throw error;
  }
};

export const createUserControllerService = async (userController) => {
  try {
    const result = await prisma.user_controllers.create({
      data: userController,
    });

    return result;
  } catch (error) {
    throw error;
  }
};

export const updateUserControllerService = async (
  id,
  userController,
  type_search
) => {
  try {
    const result = await prisma.user_controllers.update({
      where: { [type_search]: id },
      data: userController,
    });

    return result;
  } catch (error) {
    throw error;
  }
};

export const checkUserStates = async (user) => {
  try {
    console.log(user.user_controllers.login_attempts);
    // Proceso solo para clientes
    if (user.roles.name === "Cliente") {
      if (user.user_controllers.login_attempts >= 2) {
        await updateUserControllerService(
          user.id_user,
          {
            is_account_blocked: true,
          },
          "id_user_fk"
        );
      }

      if (user.user_controllers.is_account_blocked)
        throw new Error(
          "La cuenta ha sido bloqueada, comunícate con un administrador"
        );

      if (user.user_controllers.is_first_time)
        throw new Error("La cuenta no ha sido verificada, revisa tu correo");
    }

    if (!user.is_active) throw new Error("La cuenta esta inactiva");
  } catch (error) {
    throw error;
  }
};

export const verifyPassword = async (password, user) => {
  try {
    password = encryptString(password);

    console.log(password);
    console.log(user.password);

    if (password !== user.password) {
      if (user.roles.name === "Cliente") {
        await updateUserControllerService(
          user.id_user,
          {
            login_attempts: user.user_controllers.login_attempts + 1,
          },
          "id_user_fk"
        );
      }
      await checkUserStates(user);

      if (user.user_controllers.login_attempts === 2) {
        try {
          await sendMail(dataManager.mail, user.user_name, null, "Blocked");
        } catch (error) {
          throw new Error("No se pudo enviar el correo");
        }
      }
      // Falta aumentar el número de intentos y creo que bloquear
      throw new Error("Contraseña incorrecta");
    }

    console.log(user.user_controllers.login_attempts);

    if (user.roles.name === "Cliente") {
      await checkUserStates(user);
    }

    await updateUserControllerService(
      user.id_user,
      {
        login_attempts: 0,
        is_account_blocked: false,
      },
      "id_user_fk"
    );
  } catch (error) {
    throw error;
  }
};
