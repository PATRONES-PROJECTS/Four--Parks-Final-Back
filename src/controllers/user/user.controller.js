import { query } from "express";
import {
  getUsersService,
  getUserWithRoleService,
  getUserByIdService,
  getPersonalUserService,
  updateUserService,
  updatePasswordService,
  deactivateUserService,
  unlockUserService,
} from "../../services/user/user.service.js";
import { returnMoneyFromReservations } from "../../services/reservation/reservation.service.js";
import { updateLoyaltyServiceByUser } from "../../services/user/loyalty.service.js";
import { createRecordService } from "../../services/user/record.service.js";

// ----------------------------------------------
export const getUsers = async (req, res, next) => {
  try {
    let q = req.query.q;
    let query = req.query;
    const limit = parseInt(req.query.limit);
    const offset = parseInt(req.query.offset);

    const result = await getUsersService(q, query, { limit, offset });

    res.json(result);
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

export const getClients = async (req, res, next) => {
  try {
    let q = req.query.q;
    let query = req.query;

    const result = await getUserWithRoleService("Cliente", q, query);

    res.json(result);
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

export const getAdministrators = async (req, res, next) => {
  try {
    let q = req.query.q;
    let query = req.query;

    const result = await getUserWithRoleService("Administrador", q, query);

    res.json(result);
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

// ----------------------------------------------
export const getUserById = async (req, res, next) => {
  try {
    // Extraer id de req.params
    const { id } = req.params;

    const result = await getUserByIdService(id);

    // Acordarse que las funciones flecha no es necesario el return al final
    res.json(result);
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

// ----------------------------------------------
export const getPersonalUser = async (req, res, next) => {
  try {
    const result = await getPersonalUserService(req.user.id_user);
    res.json(result);
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

// ----------------------------------------------
export const updateUser = async (req, res, next) => {
  try {
    const user = {
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      identification_card: req.body.identification_card,
      user_name: req.body.user_name,
    };
    const result = await updateUserService(req.user.id_user, user);

    const record = {
      action: "Actualización de usuario",
      ip_user: req.headers["x-forwarded-for"]
        ? req.headers["x-forwarded-for"].split(",")[0].trim()
        : req.socket.remoteAddress,
      id_user_fk: result.id_user,
    };
    await createRecordService(record);

    res.json(result);
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

// ----------------------------------------------
export const updateUserByAdministrator = async (req, res, next) => {
  try {
    // Extraer id de req.params
    const { id } = req.params;

    const userInformation = await getUserByIdService(id);

    console.log(userInformation.roles.name)
    if (userInformation.roles.name == "Cliente") {
      await updateLoyaltyServiceByUser(id, req.body.loyalty_points);
    }

    const user = {
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      identification_card: req.body.identification_card,
      user_name: req.body.user_name,
      is_active: req.body.is_active,
    };
    const result = await updateUserService(userInformation.id_user, user);
    res.json(result);
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

/// ----------------------------------------------
export const updatePassword = async (req, res, next) => {
  try {
    const result = await updatePasswordService(
      req.user.id_user,
      req.body.password
    );

    res.json(result);
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

// ----------------------------------------------
export const deactivateUser = async (req, res, next) => {
  try {
    const result = await deactivateUserService(req.user.id_user);

    if (!result.is_active) {
      await returnMoneyFromReservations(result.id_user,"id_user_fk");
    }

    res.json(result);
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

export const unlockUser = async (req, res, next) => {
  try {
    // Extraer id de req.params
    const { id } = req.params;

    const result = await unlockUserService(id);

    res.json(result);
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};
