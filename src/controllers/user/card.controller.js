import {
  getCardsService,
  getCardByIdService,
  updateCardService,
} from "../../services/user/card.service.js";

export const getCards = async (req, res, next) => {
  try {
    let q = req.query.q;
    let query = req.query;

    const cards = await getCardsService(q, query);

    res.json(cards);
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

export const getCardById = async (req, res, next) => {
  try {
    // Extraer id de req.params
    const { id } = req.params;

    const result = await getCardByIdService(id, "id_card");

    // Acordarse que las funciones flecha no es necesario el return al final
    res.json(result);
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

export const getCardByClient = async (req, res, next) => {
  try {
    const result = await getCardByIdService(req.user.id_user, "id_user_fk");
    res.json(result);
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

export const updateCard = async (req, res, next) => {
  try {
    // Extraer id de req.params
    const { id } = req.params;

    const result = await updateCardService(id, req.body, "id_card");

    res.json(result);
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

export const updateCardByClient = async (req, res, next) => {
  try {
    const result = await updateCardService(
      req.user.id_user,
      req.body,
      "id_user_fk"
    );

    res.json(result);
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};
