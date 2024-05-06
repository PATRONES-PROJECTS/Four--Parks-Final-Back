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

export const createReservationService = async (reservation) => {
  try {
    let controller = null;
    const currentDateWithoutTime = new Date();
    // currentDate.setHours(currentDate.getHours() - 5);
    currentDateWithoutTime.setHours(0, 0, 0, 0);

    const reservationDate = new Date(reservation.reservation_date);

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

    const serviceAmount = hours * controller.fee * 60;
    console.log(serviceAmount);

    const paymentMethod = await getPaymentMethodByIdService(reservation.id_payment_method_fk)
    console.log(paymentMethod)


    // reservation.id_user_fk = req.user.id_user;
    // reservation.state = "Activa";
    return parking;
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
