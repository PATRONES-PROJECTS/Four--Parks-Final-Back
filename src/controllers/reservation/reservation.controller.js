import {
    createReservationService,
  getReservationService,
  getReservationsService,
} from "../../services/reservation/reservation.service.js";

export const getReservations = async (req, res, next) => {
  try {
    let q = req.query.q;
    let query = req.query;
    const result = await getReservationsService(q, query);

    res.json(result);
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

export const getReservationById = async (req, res, next) => {
  try {
    // Extraer id de req.params
    const { id } = req.params;

    const result = await getReservationService(parseInt(id), "id_reservation");

    res.json(result);
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};


export const createReservation = async (req, res, next) => {
    try {
      // Extraer id de req.params
      const id= req.user.id_user
  
      const result = await createReservationService(req.body)
  
      res.json(result);
    } catch (error) {
      console.log(error.message);
      next(error);
    }
  };
