import { createInvoiceService } from "../../services/reservation/invoice.service.js";
import {
  cancelReservationService,
  checkInReservationService,
  createReservationOnlyService,
  createReservationService,
  getReservationService,
  getReservationsService,
} from "../../services/reservation/reservation.service.js";

import { stripe } from "../../conn.js";

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

    if (reservation.other_payment_method) {
      res.json(reservation);
    } else {
      const invoice = await createInvoiceService(reservation);

      res.json(invoice);
    }
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

export const cancelReservation = async (req, res, next) => {
  try {
    // Extraer id de req.params
    const { id } = req.params;

    const reservation = await cancelReservationService(id);

    res.json(reservation);
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

export const success = async (req, res, next) => {
  try {
    // Obtener los datos de invoice y reservationData de la solicitud
    const invoiceJson = req.query.invoice;
    const reservationDataJson = req.query.reservationData;

    const session = await stripe.checkout.sessions.retrieve(
      req.query.session_id
    );

    const paymentToken = session.payment_intent;

    const invoiceData = JSON.parse(decodeURIComponent(invoiceJson));
    const reservationData = JSON.parse(decodeURIComponent(reservationDataJson));

    const reservation = await createReservationOnlyService(reservationData);

    invoiceData.payment_token = paymentToken;
    invoiceData.id_reservation_fk = reservation.id_reservation;

    await createInvoiceService(invoiceData);

    console.log("Datos del id:", paymentToken);

    // res.redirect('/pago-completado');
    res.status(200).send("Pago completado exitosamente");
  } catch (error) {
    console.log(error.message);
    // Pasar el error al siguiente middleware para el manejo de errores
    next(error);
  }
};

export const cancel = async (req, res, next) => {
  try {
    console.log("El pago ha sido cancelado");

    res.status(200).send("El pago ha sido cancelado");
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

export const checkInReservation = async (req, res, next) => {
  try {
    const { id } = req.params;

    await checkInReservationService(id);
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

export const checkOutReservation = async (req, res, next) => {
  try {
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

export const finalizeReservation = async (req, res, next) => {
  try {
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};
