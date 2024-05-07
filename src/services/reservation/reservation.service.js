import { prisma } from "../../conn.js";

import { stripe } from "../../conn.js";

import { getParkingById } from "../../controllers/parking/parking.controller.js";
import {
  convertReservationData,
  restructureObject,
} from "../../utils/dataConversion.js";
import {
  calculateHours,
  checkControllerReserve,
  checkDay,
  checkTimeReservation,
  isTwentyFourService,
} from "../../utils/logicReservation.js";
import { getParkingService } from "../parking/parking.service.js";
import { getScheduleByIdService } from "../parking/schedule.service.js";
import { getVehicleByIdService } from "../parking/vehicle.service.js";
import { createInvoiceService } from "./invoice.service.js";
import { getPaymentMethodByIdService } from "./paymentMethod.service.js";

export const getReservationsService = async (q, query) => {
  try {
    let whereClause = {};
    if (q) {
      whereClause = {
        OR: [
          { state: { contains: q, mode: "insensitive" } },
          { vehicle_code: { contains: q, mode: "insensitive" } },
          { users: { user_name: { contains: q, mode: "insensitive" } } },
        ],
      };
    }

    if (query) {
      let object_query = restructureObject(query);
      if (whereClause.OR) {
        whereClause.OR = [...whereClause.OR, ...object_query];
      } else if (object_query.length > 0) {
        whereClause.OR = [...object_query];
      }
    }

    const result = await prisma.reservations.findMany({
      where: whereClause,
      include: {
        users: {
          select: {
            user_name: true,
          },
        },
        parkings: {
          select: {
            name: true,
          },
        },
        vehicles: {
          select: {
            name: true,
          },
        },
      },
    });

    return result;
  } catch (error) {
    throw error;
  }
};

export const getReservationService = async (element, type_search) => {
  try {
    const result = await prisma.reservations.findUnique({
      where: {
        [type_search]: element,
      },
      include: {
        users: {
          select: {
            user_name: true,
          },
        },
        parkings: {
          select: {
            name: true,
          },
        },
        vehicles: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!result) throw new Error("No se encontró la reserva");

    return result;
  } catch (error) {
    throw error;
  }
};

// Recordar pasar el idUser desde el controlador con req.user.id_user
export const createReservationService = async (reservation, idUser) => {
  try {
    const reserveAmount = 4000;
    const dolar = 4000;

    let controller = null;
    const currentDateWithoutTime = new Date();
    // currentDate.setHours(currentDate.getHours() - 5);
    currentDateWithoutTime.setHours(0, 0, 0, 0);

    const reservationDate = new Date(reservation.reservation_date);
    reservation.reservation_date = new Date(reservation.reservation_date);

    if (currentDateWithoutTime > reservationDate)
      throw new Error("La fecha indicada es menor a la actual");

    const parking = await getParkingService(
      reservation.id_parking_fk,
      "id_parking"
    );

    // const vehicle = await getVehicleByIdService(reservation.id_vehicle_fk)
    // console.log(vehicle)

    const schedule = await getScheduleByIdService(parking.id_schedule_fk);

    controller = checkControllerReserve(
      reservation.id_vehicle_fk,
      parking.parking_controllers
    );

    if (controller.capacity <= 0)
      throw new Error("No hay disponibilidad para ese vehículo");

    if (controller.fee <= 0)
      throw new Error("No hay servicio para ese vehículo");

    // Verificar si el servicio es 24 horas
    const isTwentyFour = isTwentyFourService(schedule);

    // Si no es 24 horas, mirar si las horas son correctas y el día
    if (!isTwentyFour) {
      const isAvailabilityDay = checkDay(reservationDate, schedule);

      if (!isAvailabilityDay)
        throw new Error(
          "Verifique que el día de la fecha coincida con el parqueadero"
        );

      const isAvailabilityTime = checkTimeReservation(reservation, schedule);

      if (!isAvailabilityTime)
        throw new Error(
          "Verifique las horas seleccionadas y si coincide con el parqueadero"
        );

      reservationDate.setHours(reservation.entry_reservation_date);
      reservation.entry_reservation_date = new Date(reservationDate);

      reservationDate.setHours(reservation.departure_reservation_date);
      reservation.departure_reservation_date = new Date(reservationDate);
    } else {
      let hoursToAdd = 0;
      if (
        reservation.entry_reservation_date >=
        reservation.departure_reservation_date
      )
        hoursToAdd = 24;

      reservationDate.setHours(reservation.entry_reservation_date);
      reservation.entry_reservation_date = new Date(reservationDate);

      reservationDate.setHours(
        reservation.departure_reservation_date + hoursToAdd
      );
      reservation.departure_reservation_date = new Date(reservationDate);
    }

    const numberReservations = await countReservationService(
      reservation.entry_reservation_date,
      reservation.departure_reservation_date,
      reservation.id_vehicle_fk,
      "Activa"
    );

    if (controller.capacity <= numberReservations)
      throw new Error("No hay disponibilidad para el vehículo seleccionado ");

    const hours = calculateHours(
      reservation.entry_reservation_date,
      reservation.departure_reservation_date
    );

    const serviceAmountPesos = hours * controller.fee * 60;
    const serviceAmount = ((serviceAmountPesos + reserveAmount) / dolar) * 100;
    console.log(serviceAmount);

    const paymentMethod = await getPaymentMethodByIdService(
      reservation.id_payment_method_fk
    );
    console.log(paymentMethod);

    let paymentToken = "";

    if (paymentMethod.name == "Tarjeta Personal") {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: serviceAmount,
        currency: "usd",
        payment_method_types: ["card"],
        payment_method: "pm_card_visa",
        confirmation_method: "automatic",
      });

      paymentToken = paymentIntent.id;

      await stripe.paymentIntents.confirm(paymentToken);
    } else if (paymentMethod.name === "Puntos de Fidelidad") {
    } else if (paymentMethod.name === "Otro Método de Pago") {
    }

    const reservationData = {
      reservation_date: reservation.reservation_date,
      entry_reservation_date: reservation.entry_reservation_date,
      departure_reservation_date: reservation.departure_reservation_date,
      check_in: null,
      check_out: null,
      vehicle_code: reservation.vehicle_code,
      state: "Activa",
      id_vehicle_fk: reservation.id_vehicle_fk,
      id_parking_fk: reservation.id_parking_fk,
      id_user_fk: 1,
    };

    const result = await prisma.reservations.create({
      data: reservationData,
    });

    // Pasar para el controlador
    const invoice = {
      reserve_amount: reserveAmount,
      service_amount: serviceAmountPesos,
      extra_time_amount: 0,
      refund_amount: 0,
      time: hours / 60,
      payment_token: paymentToken,
      id_reservation_fk: 1,
      id_payment_method_fk: paymentMethod.id_payment_method,
    };
    console.log(invoice)
    // await createInvoiceService(invoice);

    console.log("Holaaa");
    return invoice;
  } catch (error) {
    throw error;
  }
};

export const countReservationService = async (
  startDate,
  endDate,
  idVehicle,
  state
) => {
  try {
    const count = await prisma.reservations.count({
      where: {
        entry_reservation_date: {
          gte: startDate,
          lte: endDate,
        },
        departure_reservation_date: {
          gte: startDate,
          lte: endDate,
        },
        state: state,
        id_vehicle_fk: idVehicle,
      },
    });

    return count;
  } catch (error) {
    throw error;
  }
};

export const updateReservationService = async (id, parking) => {
  try {
    return result;
  } catch (error) {
    throw error;
  }
};
