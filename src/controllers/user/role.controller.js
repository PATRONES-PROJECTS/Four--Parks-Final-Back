import {
  getRolesService,
  getRoleByIdService,
} from "../../services/user/role.service.js";

export const getRoles = async (_, res, next) => {
  try {
    const result = await getRolesService();

    res.json(result);
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

export const getRoleById = async (req, res, next) => {
  try {
    // Extraer id de req.params
    const { id } = req.params;

    const result = await getRoleByIdService(id);

    res.json(result);
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};
