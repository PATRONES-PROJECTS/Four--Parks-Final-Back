import { getParkingsStatisticsService } from "../parking/parking.service.js";
import { getVehicleByIdService } from "../parking/vehicle.service.js";
import { getInvoiceStatisticsService } from "../reservation/invoice.service.js";
import { getPaymentMethodByIdService } from "../reservation/paymentMethod.service.js";
import {
  countReservationStatisticsService,
  getReservationStatisticsService,
} from "../reservation/reservation.service.js";

export const getStaticsByAdminService = async (
  startDateText,
  endDateText,
  parkingId
) => {
  try {
    const startDate = new Date(startDateText);
    const endDate = new Date(endDateText);

    let whereCondition = {
      entry_reservation_date: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (parkingId) {
      whereCondition = {
        ...whereCondition,
        id_parking_fk: parkingId,
      };
    }

    const reservations = await getReservationStatisticsService(whereCondition);

    const countReservationByHour = await countReservationsByHourService(
      reservations
    );

    const countReservationsByVehicle = await countReservationsByVehicleService(
      reservations
    );

    const countReservationsByPaymentMethod =
      await countReservationsByPaymentMethodService(reservations);

    const countEarningsByPaymentMethod =
      await countEarningsByPaymentMethodService(reservations);

    const countEarningsByVehicle = await countEarningsByVehicleService(
      reservations
    );

    const getGeneralStatics = await getGeneralStaticsService(
      startDateText,
      endDateText,
      null,
      parkingId
    );

    const data = {
      countReservationByHour,
      countReservationsByVehicle,
      countReservationsByPaymentMethod,
      countEarningsByPaymentMethod,
      countEarningsByVehicle,
      getGeneralStatics,
    };
    return data;
  } catch (error) {
    throw error;
  }
};

export const getStaticsByManagerService = async (
  startDateText,
  endDateText,
  cityId,
  parkingId
) => {
  try {
    const startDate = new Date(startDateText);
    const endDate = new Date(endDateText);

    let whereCondition = {
      entry_reservation_date: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (cityId) {
      whereCondition = {
        ...whereCondition,
        parkings: {
          cities: {
            id_city: cityId,
          },
        },
      };
    }

    if (parkingId) {
      whereCondition = {
        ...whereCondition,
        id_parking_fk: parkingId,
      };
    }

    const reservations = await getReservationStatisticsService(whereCondition);

    const countReservationByHour = await countReservationsByHourService(
      reservations
    );

    const countReservationsByVehicle = await countReservationsByVehicleService(
      reservations
    );

    const countReservationsByPaymentMethod =
      await countReservationsByPaymentMethodService(reservations);

    const countEarningsByPaymentMethod =
      await countEarningsByPaymentMethodService(reservations);

    const countEarningsByVehicle = await countEarningsByVehicleService(
      reservations
    );

    const countEarningsByParking = await countEarningsByParkingService(
      startDateText,
      endDateText,
      cityId
    );

    const countReservationsByParking = await countReservationsByParkingService(
      startDateText,
      endDateText,
      cityId
    );

    const getGeneralStatics = await getGeneralStaticsService(
      startDateText,
      endDateText,
      cityId,
      parkingId
    );

    const data = {
      countReservationByHour,
      countReservationsByVehicle,
      countReservationsByPaymentMethod,
      countEarningsByPaymentMethod,
      countEarningsByVehicle,
      countEarningsByParking,
      countReservationsByParking,
      getGeneralStatics,
    };
    return data;
  } catch (error) {
    throw error;
  }
};

// Oka - Opt
export const countReservationsByHourService = async (reservations) => {
  try {
    const reservationsByHour = {};

    reservations.forEach((reservation) => {
      const entryDate = new Date(reservation.entry_reservation_date);
      const hour = entryDate.getHours();
      reservationsByHour[hour] = (reservationsByHour[hour] || 0) + 1;
    });

    // Convertir a formato de objeto esperado
    const data = Object.keys(reservationsByHour).map((hour) => ({
      hora: parseInt(hour),
      reservas: reservationsByHour[hour],
    }));

    return data;
  } catch (error) {
    throw error;
  }
};
//Oka - Opt
export const countReservationsByVehicleService = async (reservations) => {
  try {
    const vehicleCountsByType = {};

    for (const reservation of reservations) {
      const vehicle = await getVehicleByIdService(reservation.id_vehicle_fk);

      if (vehicle) {
        vehicleCountsByType[vehicle.name] =
          (vehicleCountsByType[vehicle.name] || 0) + 1;
      }
    }

    return vehicleCountsByType;
  } catch (error) {
    throw error;
  }
};
//Oka - Opt
export const countReservationsByPaymentMethodService = async (reservations) => {
  try {
    const invoiceCountsByPaymentMethod = {};

    for (const reservation of reservations) {
      const invoice = reservation.invoices;
      const paymentMethodId = invoice.id_payment_method_fk;

      const paymentMethod = await getPaymentMethodByIdService(paymentMethodId);

      if (paymentMethod) {
        const paymentMethodName = paymentMethod.name;
        invoiceCountsByPaymentMethod[paymentMethodName] =
          (invoiceCountsByPaymentMethod[paymentMethodName] || 0) + 1;
      }
    }
    return invoiceCountsByPaymentMethod;
  } catch (error) {
    throw error;
  }
};
//Oka - Opt
export const countEarningsByPaymentMethodService = async (reservations) => {
  try {
    const revenueByPaymentMethod = {};

    for (const reservation of reservations) {
      const invoice = reservation.invoices;

      const paymentMethodId = invoice.id_payment_method_fk;
      const totalAmount = invoice.total_amount;

      const paymentMethod = await getPaymentMethodByIdService(paymentMethodId);

      if (paymentMethod) {
        const paymentMethodName = paymentMethod.name;
        revenueByPaymentMethod[paymentMethodName] =
          (revenueByPaymentMethod[paymentMethodName] || 0) + totalAmount;
      }
    }

    return revenueByPaymentMethod;
  } catch (error) {
    throw error;
  }
};
//Oka
export const countEarningsByVehicleService = async (reservations) => {
  try {
    const revenueByVehicleType = {};

    for (const reservation of reservations) {
      const vehicleType = reservation.vehicles.name;
      const invoice = reservation.invoices;
      if (invoice) {
        const totalAmount = invoice.total_amount;

        revenueByVehicleType[vehicleType] =
          (revenueByVehicleType[vehicleType] || 0) + totalAmount;
      }
    }

    return revenueByVehicleType;
  } catch (error) {
    throw error;
  }
};
//Oka
export const countEarningsByParkingService = async (
  startDateText,
  endDateText,
  cityId
) => {
  try {
    const startDate = new Date(startDateText);
    const endDate = new Date(endDateText);

    let whereCondition = {
      entry_reservation_date: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (cityId) {
      whereCondition = {
        ...whereCondition,
        parkings: {
          cities: {
            id_city: cityId,
          },
        },
      };
    }

    const parkings = await getParkingsStatisticsService(cityId, whereCondition);

    const revenueByParking = {};

    for (const parking of parkings) {
      const parkingName = parking.name;
      const reservations = parking.reservations;
      let totalRevenue = 0;

      for (const reservation of reservations) {
        const invoice = reservation.invoices;
        if (invoice) {
          const totalAmount = invoice.total_amount;
          totalRevenue += totalAmount;
        }
      }

      revenueByParking[parkingName] = totalRevenue;
    }

    return revenueByParking;
  } catch (error) {
    throw error;
  }
};
//Oka - Opt
export const countReservationsByParkingService = async (
  startDateText,
  endDateText,
  cityId
) => {
  try {
    const startDate = new Date(startDateText);
    const endDate = new Date(endDateText);

    let whereCondition = {
      entry_reservation_date: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (cityId) {
      whereCondition = {
        ...whereCondition,
        parkings: {
          cities: {
            id_city: cityId,
          },
        },
      };
    }

    const parkings = await getParkingsStatisticsService(cityId, whereCondition);

    const reservationCountsByParking = {};

    for (const parking of parkings) {
      const parkingName = parking.name;
      const reservations = parking.reservations;
      const reservationCount = reservations.length;

      reservationCountsByParking[parkingName] = reservationCount;
    }

    return reservationCountsByParking;
  } catch (error) {
    throw error;
  }
};

export const getGeneralStaticsService = async (
  startDateText,
  endDateText,
  cityId,
  parkingId
) => {
  try {
    const startDate = new Date(startDateText);
    const endDate = new Date(endDateText);

    let whereCondition = {
      entry_reservation_date: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (cityId) {
      whereCondition = {
        ...whereCondition,
        parkings: {
          cities: {
            id_city: cityId,
          },
        },
      };
    }

    if (parkingId) {
      whereCondition = {
        ...whereCondition,
        id_parking_fk: parkingId,
      };
    }

    const totalRevenueResult = await getInvoiceStatisticsService(
      "total_amount",
      whereCondition
    );

    const totalRevenue = totalRevenueResult._sum.total_amount || 0;

    const totalHoursResult = await getInvoiceStatisticsService(
      "time",
      whereCondition
    );

    const totalHours = Math.round(totalHoursResult._sum.time / 60) || 0;

    const finishedReservationsResult = await countReservationStatisticsService(
      "Finalizado",
      whereCondition
    );

    const finishedReservations = finishedReservationsResult || 0;

    const canceledReservationsResult = await countReservationStatisticsService(
      "Cancelado",
      whereCondition
    );

    const canceledReservations = canceledReservationsResult || 0;

    return {
      totalRevenue,
      totalHours,
      finishedReservations,
      canceledReservations,
    };
  } catch (error) {
    throw error;
  }
};

// getReservationsByHourService

export const getReservationsByHourService = async (
  startDateText,
  endDateText,
  cityId,
  parkingId
) => {
  try {
  
  } catch (error) {
    throw error;
  }
};
