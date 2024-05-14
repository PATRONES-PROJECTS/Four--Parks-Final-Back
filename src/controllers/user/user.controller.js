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

    if (userInformation.roles.name == "Client") {
      await updateLoyaltyService(id, req.body.loyalty_points);

      const user = {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        identification_card: req.body.identification_card,
        user_name: req.body.user_name,
        is_active: req.body.is_active,
      };
      const result = await updateUserService(userInformation.id_user, user);
      res.json(result);
    } else {
      const user = {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        identification_card: req.body.identification_card,
        user_name: req.body.user_name,
        is_active: req.body.is_active,
      };
      const result = await updateUserService(userInformation.id_user, user);
      res.json(result);
    }
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
