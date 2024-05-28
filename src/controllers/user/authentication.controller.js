import { createAccessToken } from "../../utils/jwt.js";
import jwt from "jsonwebtoken";
import { TOKEN_SCRET } from "../../config.js";
import { validateVerificationToken } from "../../middlewares/tokenValidator.js";

import { getRoleByNameService } from "../../services/user/role.service.js";
import {
  createUserService,
  deleteUserService,
  getUserByIdService,
  getUserByParameterService,
  updatePasswordService,
} from "../../services/user/user.service.js";

import { sendMail } from "../../services/user/mail.service.js";
import { createCardService } from "../../services/user/card.service.js";
import {
  checkUserStates,
  createUserControllerService,
  getUserControllerService,
  updateUserControllerService,
  verifyPassword,
} from "../../services/user/authentication.service.js";
import { createLoyaltyService } from "../../services/user/loyalty.service.js";
import { createRecordService } from "../../services/user/record.service.js";

export const registerClient = async (req, res, next) => {
  try {
    const role = await getRoleByNameService("Cliente");

    const user = {
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      mail: req.body.mail,
      user_name: req.body.user_name,
      password: req.body.password,
      identification_card: req.body.identification_card,
      id_role_fk: role.id_role,
    };
    const result = await createUserService(user);

    const card = {
      number: req.body.number,
      cvc: req.body.cvc,
      expiration_date: req.body.expiration_date,
      id_user_fk: result.id_user,
    };
    await createCardService(card);

    const record = {
      action: "Registro Cliente",
      ip_user: req.headers["x-forwarded-for"]
        ? req.headers["x-forwarded-for"].split(",")[0].trim()
        : req.socket.remoteAddress,
      id_user_fk: result.id_user,
    };
    await createRecordService(record);

    // Proceso del token
    const token = await createAccessToken(
      {
        id_user: result.id_user,
      },
      "1h"
    );
    const url = `${req.body.url_front}/${token}`;

    const userController = {
      is_first_time: true,
      is_account_blocked: false,
      login_attempts: 0,
      id_user_fk: result.id_user,
      verification_token: token,
    };
    await createUserControllerService(userController);

    const loyalty = { loyalty_points: 0, id_user_fk: result.id_user };
    await createLoyaltyService(loyalty);

    // Enviar mail
    try {
      await sendMail(result.mail, result.user_name, url, "Welcome");
    } catch (error) {
      await deleteUserService(result.id_user);
      throw new Error("No se pudo enviar el correo");
    }

    res.json(result);
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

// Tal vez colocar el ver rol administrador
export const registerAdministrator = async (req, res, next) => {
  try {
    const role = await getRoleByNameService(req.body.role);

    const user = {
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      mail: req.body.mail,
      user_name: req.body.user_name,
      password: req.body.password,
      identification_card: req.body.identification_card,
      id_role_fk: role.id_role,
    };
    const result = await createUserService(user);

    console.log(result);

    const userController = {
      is_first_time: false,
      is_account_blocked: false,
      login_attempts: 0,
      id_user_fk: result.id_user,
      verification_token: null,
    };
    await createUserControllerService(userController);

    const record = {
      action: "Registro Administrador",
      ip_user: req.headers["x-forwarded-for"]
        ? req.headers["x-forwarded-for"].split(",")[0].trim()
        : req.socket.remoteAddress,
      id_user_fk: result.id_user,
    };
    await createRecordService(record);

    res.json(result);
  } catch (error) {
    console.log(error.message);
    //res.json({ error: error.message });
    // Se envía a la siguiente función que maneja el error de primeras en el index
    next(error);
  }
};

// Falta enviar mail al Gerente por bloqueo
export const login = async (req, res, next) => {
  try {
    const result = await getUserByParameterService(
      req.body.user_name,
      "user_name"
    );

    
    await verifyPassword(req.body.password, result);

    const record = {
      action: "Inicio de Sesión",
      ip_user: req.headers["x-forwarded-for"]
        ? req.headers["x-forwarded-for"].split(",")[0].trim()
        : req.socket.remoteAddress,
      id_user_fk: result.id_user,
    };
    await createRecordService(record);

    // Llamar Token para crearlo
    const token = await createAccessToken(
      {
        id_user: result.id_user,
        role: result.roles.name,
        user_name: result.user_name
      },
      "1d"
    );
    // // Creación de Cookie con el Token
    // res.cookie("token", token);

    res.json({
      id_user: result.id_user,
      first_name: result.first_name,
      last_name: result.last_name,
      user_name: result.user_name,
      mail: result.mail,
      role: result.roles.name,
      token: token,
    });
    // if(result.control_ingresos.primera_vez)
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

export const logout = async (_, res, next) => {
  // Eliminar cookie token
  res.cookie("token", "", { expires: new Date(0) });

  return res.sendStatus(200);
};

export const verifyToken = async (req, res, next) => {
  try {
    const { token } = req.cookies;

    // Verifica si primero existe un token
    if (!token) throw new Error("No Autorizado");
    // Si existe se verifica que sea correcto
    jwt.verify(token, TOKEN_SCRET, async (error, user) => {
      if (error) return res.status(401).json({ message: "No Autorizado" });
      // Busca el id del token y lo compara con el de los usuario de la base de datos
      const result = await getUserByIdService(user.id_user);
      if (!result) return res.status(401).json({ message: "No Autorizado" });

      res.json({
        id_user: result.id_user,
        first_name: result.first_name,
        last_name: result.last_name,
        user_name: result.user_name,
        mail: result.mail,
        role: result.roles.name,
      });
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

export const requestToken = async (req, res, next) => {
  try {
    const result = await getUserByParameterService(
      req.body.mail.toLowerCase(),
      "mail"
    );

    const token = await createAccessToken(
      {
        id_user: result.id_user,
      },
      "20m"
    );
    const url = `${req.body.url}/${token}`;

    try {
      await sendMail(result.mail, result.user_name, url, req.body.type);
    } catch (error) {
      console.log(error);
      throw new Error("No se pudo enviar el mail");
    }

    const verificationToken = await updateUserControllerService(
      result.id_user,
      {
        verification_token: token,
      },
      "id_user_fk"
    );

    res.json(verificationToken);
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

export const recoverPassword = async (req, res, next) => {
  try {
    const { token } = req.params;

    const idUser = validateVerificationToken(token);

    await getUserControllerService(idUser, token);

    const userController = {
      is_first_time: false,
      verification_token: null,
    };
    await updateUserControllerService(idUser, userController, "id_user_fk");

    const result = await updatePasswordService(idUser, req.body.password);

    res.json(result);
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

export const verifyUserMail = async (req, res, next) => {
  try {
    //Extraer token de la url
    const { token } = req.params;

    const idUser = validateVerificationToken(token);

    //Buscar token con id_usuario
    await getUserControllerService(idUser, token);

    const userController = {
      is_first_time: false,
      verification_token: null,
    };
    const result = await updateUserControllerService(
      idUser,
      userController,
      "id_user_fk"
    );

    res.json(result);
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};
