import { prisma, stripe } from "../../conn.js";

import { restructureObject } from "../../utils/dataConversion.js";
import {
  calculateHours,
  checkControllerReserve,
  checkDay,
  checkTimeReservation,
  isTwentyFourService,
} from "../../utils/logicReservation.js";
import { getParkingService } from "../parking/parking.service.js";
import { getParkingControllerService } from "../parking/parkingController.service.js";
import { getScheduleByIdService } from "../parking/schedule.service.js";
import {
  getLoyaltyByIdService,
  updateLoyaltyService,
} from "../user/loyalty.service.js";
import { generateInvoiceMail, sendMail } from "../user/mail.service.js";
import { createRecordService } from "../user/record.service.js";
import { getInvoiceService, updateInvoiceService } from "./invoice.service.js";
import { getPaymentMethodByIdService } from "./paymentMethod.service.js";

const reserveAmount = 4000;
const dolar = 4000;

export const getReservationsService = async (
  user,
  q,
  query,
  startDate,
  endDate,
  pagination
) => {
  try {
    let idUser = null;
    let idParking = null;

    if (user.role === "Administrador") {
      const parking = await getParkingService(user.id_user, "id_user_fk");
      idParking = parking.id_parking;
    } else if (user.role === "Cliente") {
      idUser = user.id_user;
    }

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
      where: {
        AND: [
          whereClause, // Otras condiciones de filtrado
          idParking !== null ? { id_parking_fk: idParking } : {},
          idUser !== null ? { id_user_fk: idUser } : {}, // Condición opcional para id_parking_fk
        ],
      },
      include: {
        users: {
          select: {
            user_name: true,
            roles: {
              // Incluir los campos del rol
              select: {
                id_role: true,
                name: true,
              },
            },
          },
        },
        parkings: {
          select: {
            name: true,
            has_loyalty_service: true,
            image_path: true,
          },
        },
        vehicles: {
          select: {
            name: true,
          },
        },
        invoices: true,
      },
      orderBy: [{ state: "asc" }],
      take: pagination.limit || undefined, // Tomar un número limitado de registros
      skip: pagination.offset || undefined,
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
            roles: {
              // Incluir los campos del rol
              select: {
                id_role: true,
                name: true,
              },
            },
          },
        },
        parkings: {
          select: {
            name: true,
            has_loyalty_service: true,
            image_path: true,
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
    const countReservation = await countClientReservations(idUser);
    if (countReservation >= 3)
      throw new Error("Se tienen tres reservas activas");

    let controller = null;
    const currentDate = new Date();
    currentDate.setHours(currentDate.getHours() - 5);

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
      throw new Error("El parqueadero esta inactivo");

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
        amount: Math.round(serviceAmount),
        currency: "usd",
        payment_method_types: ["card"],
        payment_method: "pm_card_visa",
        confirmation_method: "automatic",
      });

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
              unit_amount: Math.round(serviceAmount),
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `https://fourparkscolombia.onrender.com/api/success?invoice=${encodeURIComponent(
          jsonInvoice
        )}&reservationData=${encodeURIComponent(
          jsonReservationData
        )}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: "https://fourparkscolombia.onrender.com/api/cancel",
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
    console.log(reservationData);

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

export const countClientReservations = async (id) => {
  const count = await prisma.reservations.count({
    where: {
      id_user_fk: id,
      state: "Activa",
    },
  });

  return count;
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
          amount: Math.round(totalAmountDolar),
        });

        await stripe.paymentIntents.confirm(reservation.invoices.payment_token);
      } else {
        await stripe.paymentIntents.cancel(reservation.invoices.payment_token);
      }
    } else if (paymentMethod.name === "Tarjeta Personal") {
      await stripe.paymentIntents.confirm(reservation.invoices.payment_token);
    } else if (
      paymentMethod.name === "Otro Método de Pago" &&
      refundAmount !== 0
    ) {
      const refundAmountDolar = (refundAmount / dolar) * 100;

      await stripe.refunds.create({
        payment_intent: reservation.invoices.payment_token,
        amount: Math.round(refundAmountDolar),
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
      time: 0,
      total_amount: totalAmount,
    };
    invoice = await updateInvoiceService(
      reservation.invoices.id_invoice,
      invoiceData
    );

    await generateInvoiceMail(invoice.id_invoice);

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

    if (reservation.state !== "Activa") {
      throw new Error("La reserva no esta activa");
    }

    if (reservation.check_in !== null) {
      throw new Error("Ya se ha realizado un check in");
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
      const updatedReservation = await updateReservationService(
        parseInt(id),
        dateReservation
      );

      return updatedReservation;
    } else {
      throw new Error("No esta dentro del rango de la reserva");
    }
  } catch (error) {
    throw error;
  }
};

export const checkOutReservationService = async (id) => {
  try {
    const reservation = await getReservationService(
      parseInt(id),
      "id_reservation"
    );

    if (reservation.state !== "Activa") {
      throw new Error("La reserva no esta activa");
    }

    if (reservation.check_in === null) {
      throw new Error("No se ha realizado un check in");
    }

    const currentDate = new Date();
    currentDate.setHours(currentDate.getHours() - 5);
    reservation.entry_reservation_date = new Date(
      reservation.entry_reservation_date
    );
    reservation.departure_reservation_date = new Date(
      reservation.departure_reservation_date
    );

    const controller = await getParkingControllerService(
      reservation.id_parking_fk,
      reservation.id_vehicle_fk
    );

    const differenceMs = currentDate - reservation.departure_reservation_date;
    const differenceMinutes = Math.floor(differenceMs / (1000 * 60));

    const extraAmount = controller.fee * differenceMinutes;

    const paymentMethod = await getPaymentMethodByIdService(
      reservation.invoices.id_payment_method_fk
    );

    if (
      currentDate >= reservation.entry_reservation_date &&
      currentDate <= reservation.departure_reservation_date
    ) {
      if (paymentMethod.name === "Tarjeta Personal") {
        await stripe.paymentIntents.confirm(reservation.invoices.payment_token);
      }

      const reservationData = {
        state: "Finalizado",
        check_out: currentDate,
      };
      await updateReservationService(
        reservation.id_reservation,
        reservationData
      );

      if (reservation.parkings.has_loyalty_service) {
        const totalPoints = Math.round(
          reservation.invoices.total_amount / 4000
        );

        const loyalty = await getLoyaltyByIdService(
          reservation.users.id_user,
          "id_user_fk"
        );

        const loyaltyPoints = loyalty.loyalty_points + totalPoints;

        await updateLoyaltyService(loyalty.id_loyalty, loyaltyPoints);
      }

      await generateInvoiceMail(reservation.invoices.id_invoice);

      return reservation.invoices;
    } else if (currentDate > reservation.departure_reservation_date) {
      // Mirar minutos extra y hacer la lógica prevista

      if (paymentMethod.name === "Tarjeta Personal") {
        const totalAmount = reservation.invoices.total_amount;
        const totalAmountDolar = ((totalAmount + extraAmount) / dolar) * 100;
        console.log(totalAmount);

        await stripe.paymentIntents.update(reservation.invoices.payment_token, {
          amount: Math.round(totalAmountDolar),
        });

        await stripe.paymentIntents.confirm(reservation.invoices.payment_token);
      } else if (paymentMethod.name === "Otro Método de Pago") {
        const totalAmount = reservation.invoices.total_amount;
        let totalAmountDolar = (totalAmount / dolar) * 100;

        await stripe.refunds.create({
          payment_intent: reservation.invoices.payment_token,
          amount: Math.round(totalAmountDolar),
        });

        totalAmountDolar = ((totalAmount + extraAmount) / dolar) * 100;

        const pay = await stripe.paymentIntents.create({
          amount: Math.round(totalAmountDolar),
          currency: "usd",
          payment_method_types: ["card"],
          payment_method: "pm_card_visa",
          confirmation_method: "automatic",
        });

        await stripe.paymentIntents.confirm(pay.id);

        const invoice = {
          payment_token: pay.id,
        };
        await updateInvoiceService(reservation.invoices.id_invoice, invoice);
      } else if (paymentMethod.name === "Puntos de Fidelidad") {
        console.log("Entra aca");
        const extraAmountPoints = Math.round(extraAmount / 4000);

        const loyalty = await getLoyaltyByIdService(
          reservation.users.id_user,
          "id_user_fk"
        );

        const loyaltyPoints = loyalty.loyalty_points - extraAmountPoints;

        await updateLoyaltyService(loyalty.id_loyalty, loyaltyPoints);
      }

      const reservationData = {
        state: "Finalizado",
        check_out: currentDate,
      };
      await updateReservationService(
        reservation.id_reservation,
        reservationData
      );

      const invoiceData = {
        extra_time_amount: extraAmount,
        time: reservation.invoices.time + differenceMinutes,
        total_amount: reservation.invoices.total_amount + extraAmount,
      };
      const invoice = await updateInvoiceService(
        reservation.invoices.id_invoice,
        invoiceData
      );

      if (reservation.parkings.has_loyalty_service) {
        const totalPoints = Math.round(invoiceData.total_amount / 4000);

        const loyalty = await getLoyaltyByIdService(
          reservation.users.id_user,
          "id_user_fk"
        );

        const loyaltyPoints = loyalty.loyalty_points + totalPoints;

        await updateLoyaltyService(loyalty.id_loyalty, loyaltyPoints);
      }

      await generateInvoiceMail(invoice.id_invoice);

      return invoice;
    } else {
      throw new Error("No esta dentro del rango de la reserva");
    }
  } catch (error) {
    throw error;
  }
};

export const getReservationStatisticsService = async (whereCondition) => {
  try {
    const result = await prisma.reservations.findMany({
      where: whereCondition,
      include: {
        invoices: {
          select: {
            id_payment_method_fk: true,
            total_amount: true,
            payment_methods: {
              select: {
                name: true,
              },
            },
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

export const countReservationStatisticsService = async (
  state,
  whereCondition
) => {
  try {
    const result = await prisma.reservations.count({
      where: {
        state: state,
        ...whereCondition,
      },
    });

    return result;
  } catch (error) {
    throw error;
  }
};

export const returnMoneyFromReservations = async (element, type_search) => {
  try {
    const activeReservations = await prisma.reservations.findMany({
      where: {
        state: "Activa",
        [type_search]: element,
      },
      include: {
        invoices: true,
        users: true,
      },
    });

    for (const reservation of activeReservations) {
      let invoice = null;
      let refundAmount = 0;
      let totalAmount = 0;

      const paymentMethod = await getPaymentMethodByIdService(
        reservation.invoices.id_payment_method_fk
      );

      refundAmount = reservation.invoices.total_amount;

      if (paymentMethod.name === "Tarjeta Personal" && refundAmount !== 0) {
        await stripe.paymentIntents.cancel(reservation.invoices.payment_token);
      } else if (
        paymentMethod.name === "Otro Método de Pago" &&
        refundAmount !== 0
      ) {
        const refundAmountDolar = (refundAmount / dolar) * 100;

        await stripe.refunds.create({
          payment_intent: reservation.invoices.payment_token,
          amount: Math.round(refundAmountDolar),
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
      await updateReservationService(
        reservation.id_reservation,
        reservationData
      );

      const invoiceData = {
        refund_amount: refundAmount,
        time: 0,
        total_amount: totalAmount,
      };
      invoice = await updateInvoiceService(
        reservation.invoices.id_invoice,
        invoiceData
      );

      await generateInvoiceMail(reservation.invoices.id_invoice);
    }

    return activeReservations;
  } catch (error) {
    throw error;
  }
};
