import {
  getLoyaltiesService,
  getLoyaltyByIdService,
  updateLoyaltyService,
} from "../../services/user/loyalty.service.js";

export const getLoyalties = async (_, res, next) => {
  try {
    const result = await getLoyaltiesService();

    res.json(result);
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

export const getLoyaltyById = async (req, res, next) => {
  try {
    // Extraer id de req.params
    const { id } = req.params;

    const result = await getLoyaltyByIdService(id, "id_loyalty");
    // Acordarse que las funciones flecha no es necesario el return al final
    res.json(result);
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

export const getLoyaltyByClient = async (req, res, next) => {
  try {
    const result = await getLoyaltyByIdService(req.user.id_user, "id_user_fk");
    // Acordarse que las funciones flecha no es necesario el return al final
    res.json(result);
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

export const updateLoyalty = async (req, res, next) => {
  try {
    // Extraer id de req.params
    const { id } = req.params;

    const result = await updateLoyaltyService(id, req.body.loyalty_points);

    res.json(result);
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};
