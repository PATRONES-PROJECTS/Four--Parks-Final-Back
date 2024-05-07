import { createInvoiceService } from "../../services/reservation/invoice.service.js";
import {
  createReservationService,
  getReservationService,
  getReservationsService,
} from "../../services/reservation/reservation.service.js";

export const getReservations = async (req, res, next) => {
  try {
    let query = req.query;
    const { q, startDate, endDate } = req.query;
    const result = await getReservationsService(q, query, startDate, endDate);

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
    const id = req.user.id_user;

    const reservation = await createReservationService(req.body, id);

    const invoice = await createInvoiceService(reservation);

    res.json(invoice);
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};
