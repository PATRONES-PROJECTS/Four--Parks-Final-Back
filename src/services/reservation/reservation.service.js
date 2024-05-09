import { prisma } from "../../conn.js";

import { stripe } from "../../conn.js";

import { restructureObject } from "../../utils/dataConversion.js";
import {
  calculateHours,
  checkControllerReserve,
  checkDay,
  checkTimeReservation,
  isTwentyFourService,
} from "../../utils/logicReservation.js";
import { getParkingService } from "../parking/parking.service.js";
import { getScheduleByIdService } from "../parking/schedule.service.js";
import {
  getLoyaltyByIdService,
  updateLoyaltyService,
} from "../user/loyalty.service.js";
import { updateInvoiceService } from "./invoice.service.js";
import { getPaymentMethodByIdService } from "./paymentMethod.service.js";

const reserveAmount = 4000;
const dolar = 4000;

export const getReservationsService = async (q, query, startDate, endDate) => {
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

    // Convertir las fechas a formato ISO
    const startDateISO = startDate ? new Date(startDate).toISOString() : null;
    const endDateISO = endDate ? new Date(endDate).toISOString() : null;

    // Agregar condición para el rango de fechas si están presentes
    if (startDateISO && endDateISO) {
      whereClause.entry_reservation_date = {
        gte: startDateISO, // Mayor o igual que la fecha de inicio
        lte: endDateISO, // Menor o igual que la fecha de fin
      };
    } else if (startDateISO) {
      whereClause.entry_reservation_date = {
        gte: startDateISO, // Mayor o igual que la fecha de inicio
      };
    } else if (endDateISO) {
      whereClause.entry_reservation_date = {
        lte: endDateISO, // Menor o igual que la fecha de fin
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
        invoices: {
          select: {
            time: true,
            total_amount: true,
          },
        },
      },
      orderBy: [{ state: "asc" }],
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
            id_user: true,
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
        invoices: true,
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
    let controller = null;
    const currentDate = new Date();
    currentDate.setHours(currentDate.getHours() - 5);
    // currentDate.setHours(0, 0, 0, 0);

    const reservationDate = new Date(reservation.reservation_date);
    reservation.reservation_date = new Date(reservation.reservation_date);
    reservation.reservation_date.setHours(reservation.entry_reservation_date);

    if (currentDate > reservation.reservation_date)
      throw new Error("La fecha indicada es menor a la actual");

    const parking = await getParkingService(
      reservation.id_parking_fk,
      "id_parking"
    );

    if (parking.is_active === false)
      throw new Error("El parqueadero esta desactivado");

    const schedule = await getScheduleByIdService(parking.id_schedule_fk);

    controller = checkControllerReserve(
      reservation.id_vehicle_fk,
      parking.parking_controllers
    );

    if (controller.capacity <= 0)
      throw new Error("No hay disponibilidad para ese vehículo");

    if (controller.fee <= 0)
      throw new Error("No hay servicio para ese vehículo");

    const isTwentyFour = isTwentyFourService(schedule);

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

    const paymentMethod = await getPaymentMethodByIdService(
      reservation.id_payment_method_fk
    );
    console.log(paymentMethod);

    let paymentToken = "";

    if (paymentMethod.name == "Tarjeta Personal") {
      const serviceAmount =
        ((serviceAmountPesos + reserveAmount) / dolar) * 100;

      const paymentIntent = await stripe.paymentIntents.create({
        amount: serviceAmount,
        currency: "usd",
        payment_method_types: ["card"],
        payment_method: "pm_card_visa",
        confirmation_method: "automatic",
      });

      //  await stripe.paymentIntents.update(paymentIntent.id, {
      //   amount: 750,
      // });

      // await stripe.paymentIntents.confirm(paymentToken);

      // const refund = await stripe.refunds.create({
      //   payment_intent: paymentToken,
      //   amount: 200,
      // });

      paymentToken = paymentIntent.id;
    } else if (paymentMethod.name === "Puntos de Fidelidad") {
      const serviceAmount = serviceAmountPesos + reserveAmount;

      const points = await getLoyaltyByIdService(idUser, "id_user_fk");

      if (points.loyalty_points * 4000 < serviceAmount)
        throw new Error("No tiene la cantidad de puntos suficientes");

      const pointsPayments =
        points.loyalty_points - Math.round(serviceAmount / 4000);

      await updateLoyaltyService(points.id_loyalty, pointsPayments);

      paymentToken = "Pago con Puntos";
    } else if (paymentMethod.name === "Otro Método de Pago") {
      const serviceAmount =
        ((serviceAmountPesos + reserveAmount) / dolar) * 100;

      const reservationData = {
        reservation_date: currentDate,
        entry_reservation_date: reservation.entry_reservation_date,
        departure_reservation_date: reservation.departure_reservation_date,
        check_in: null,
        check_out: null,
        vehicle_code: reservation.vehicle_code,
        state: "Activa",
        id_vehicle_fk: reservation.id_vehicle_fk,
        id_parking_fk: reservation.id_parking_fk,
        id_user_fk: idUser,
      };

      const invoice = {
        reserve_amount: reserveAmount,
        service_amount: serviceAmountPesos,
        extra_time_amount: 0,
        refund_amount: 0,
        time: hours * 60,
        payment_token: paymentToken,
        id_reservation_fk: null,
        id_payment_method_fk: paymentMethod.id_payment_method,
      };

      const jsonInvoice = JSON.stringify(invoice);
      const jsonReservationData = JSON.stringify(reservationData);

      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price_data: {
              product_data: {
                name: "Reversa",
                description: "Reserva de Four-Parks Colombia",
              },
              currency: "usd",
              unit_amount: serviceAmount,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `http://localhost:3000/api/success?invoice=${encodeURIComponent(
          jsonInvoice
        )}&reservationData=${encodeURIComponent(
          jsonReservationData
        )}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: "http://localhost:3000/api/cancel",
      });

      invoice.other_payment_method = true;
      invoice.url = session.url;
      return invoice;
    }

    const reservationData = {
      reservation_date: currentDate,
      entry_reservation_date: reservation.entry_reservation_date,
      departure_reservation_date: reservation.departure_reservation_date,
      check_in: null,
      check_out: null,
      vehicle_code: reservation.vehicle_code,
      state: "Activa",
      id_vehicle_fk: reservation.id_vehicle_fk,
      id_parking_fk: reservation.id_parking_fk,
      id_user_fk: idUser,
    };

    const result = await prisma.reservations.create({
      data: reservationData,
    });

    const invoice = {
      reserve_amount: reserveAmount,
      service_amount: serviceAmountPesos,
      extra_time_amount: 0,
      refund_amount: 0,
      time: hours * 60,
      payment_token: paymentToken,
      id_reservation_fk: result.id_reservation,
      id_payment_method_fk: paymentMethod.id_payment_method,
    };

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

export const createReservationOnlyService = async (reservation) => {
  try {
    const result = await prisma.reservations.create({
      data: reservation,
    });

    return result;
  } catch (error) {
    throw error;
  }
};

export const updateReservationService = async (id, reservation) => {
  try {
    const result = await prisma.reservations.update({
      where: { id_reservation: parseInt(id) },
      data: reservation,
    });

    return result;
    return result;
  } catch (error) {
    throw error;
  }
};

export const cancelReservationService = async (id) => {
  try {
    const reservation = await getReservationService(
      parseInt(id),
      "id_reservation"
    );

    if (reservation.state !== "Activa")
      throw new Error("La reserva no esta Activa");

    if (reservation.check_in !== null)
      throw new Error("La reserva esta en proceso, no se puede cancelar");

    let invoice = null;
    let refundAmount = 0;
    let totalAmount = 0;

    const currentDate = new Date();
    currentDate.setHours(currentDate.getHours() - 5);
    const reservationEntryDate = new Date(reservation.entry_reservation_date);
    const differenceInMilliseconds = reservationEntryDate - currentDate;
    const differenceInMinutes = differenceInMilliseconds / (1000 * 60);

    const paymentMethod = await getPaymentMethodByIdService(
      reservation.invoices.id_payment_method_fk
    );
    // Verificación del tiempo
    if (differenceInMinutes > 30) {
      refundAmount = reservation.invoices.total_amount;
    } else if (differenceInMinutes > 0 && differenceInMinutes <= 30) {
      refundAmount = reservation.invoices.service_amount;
      totalAmount = reservation.invoices.total_amount - refundAmount;
    } else {
      totalAmount = reservation.invoices.total_amount;
    }

    // Verificación del medio de pago
    if (paymentMethod.name === "Tarjeta Personal" && refundAmount !== 0) {
      const totalAmountDolar = (totalAmount / dolar) * 100;

      if (totalAmount !== 0) {
        await stripe.paymentIntents.update(reservation.invoices.payment_token, {
          amount: totalAmountDolar,
        });

        await stripe.paymentIntents.confirm(reservation.invoices.payment_token);
      } else {
        await stripe.paymentIntents.cancel(reservation.invoices.payment_token);
      }
    } else if (
      paymentMethod.name === "Otro Método de Pago" &&
      refundAmount !== 0
    ) {
      const refundAmountDolar = (refundAmount / dolar) * 100;

      await stripe.refunds.create({
        payment_intent: reservation.invoices.payment_token,
        amount: refundAmountDolar,
      });
    } else if (
      paymentMethod.name === "Puntos de Fidelidad" &&
      refundAmount !== 0
    ) {
      const refundAmountPoints = Math.round(refundAmount / 4000);

      const loyalty = await getLoyaltyByIdService(
        reservation.users.id_user,
        "id_user_fk"
      );

      const loyaltyPoints = loyalty.loyalty_points + refundAmountPoints;

      await updateLoyaltyService(loyalty.id_loyalty, loyaltyPoints);
    }

    const reservationData = {
      state: "Cancelado",
    };
    await updateReservationService(reservation.id_reservation, reservationData);

    const invoiceData = {
      refund_amount: refundAmount,
      total_amount: totalAmount,
    };
    invoice = await updateInvoiceService(
      reservation.invoices.id_invoice,
      invoiceData
    );

    return invoice;
  } catch (error) {
    throw error;
  }
};

export const checkInReservationService = async (id) => {
  try {
    const reservation = await getReservationService(
      parseInt(id),
      "id_reservation"
    );

    if(reservation.status !== "Activa"){
      throw new Error("La reserva no esta activa");
    }

    const currentDate = new Date();
    currentDate.setHours(currentDate.getHours() - 5);
    reservation.entry_reservation_date = new Date(
      reservation.entry_reservation_date
    );
    reservation.departure_reservation_date = new Date(
      reservation.departure_reservation_date
    );

    if (
      currentDate >= reservation.entry_reservation_date &&
      currentDate <= reservation.departure_reservation_date
    ) {
      const dateReservation = {
        check_in: currentDate,
      };
      const reservation = await updateReservationService(
        parseInt(id),
        dateReservation
      );

      return reservation
    } else {
      throw new Error("No esta dentro del rango de la reserva");
    }

    // console.log(currentDate);
    // console.log(reservation.entry_reservation_date);
    // console.log(reservation.departure_reservation_date);
  } catch (error) {
    throw error;
  }
};

export const checkOutReservationService = async (id) => {
  try {
  } catch (error) {
    throw error;
  }
};
