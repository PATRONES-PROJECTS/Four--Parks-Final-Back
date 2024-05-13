import { getParkingsStatisticsService } from "../parking/parking.service.js";
import { getVehicleByIdService } from "../parking/vehicle.service.js";
import { getInvoiceStatisticsService } from "../reservation/invoice.service.js";
import { getPaymentMethodByIdService } from "../reservation/paymentMethod.service.js";
import {
  countReservationStatisticsService,
  getReservationStatisticsService,
} from "../reservation/reservation.service.js";

import PDFDocument from "pdfkit-table";

import {
  createBarChart,
  createPieChart,
  createScatterChart,
} from "../../utils/graphicsGenerator.js";

import ExcelJS from "exceljs";

import fetch from "node-fetch";

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

export const getStatisticsPDFService = async (
  dataCallback,
  endCallback,
  data
) => {
  try {
    const doc = new PDFDocument();

    doc.on("data", dataCallback);
    doc.on("end", endCallback);

    const addHeaderAndBorder = async () => {
      // Agregar imagen al encabezado a la derecha
      const logoUrl =
        "https://res.cloudinary.com/dfuxpzt0w/image/upload/v1715136225/Logo.png";
      const logoResponse = await fetch(logoUrl);
      const logoBuffer = await logoResponse.buffer();
      doc.image(logoBuffer, 450, 10, { width: 100 });

      // Agregar borde naranja claro a la izquierda
      doc.rect(10, 0, 10, 800).fill("#FFCC99");
    };

    // Primera página
    await addHeaderAndBorder();

    // Título del documento
    doc.fontSize(20).text("Informe Estadístico", {
      align: "center",
    });
    doc.moveDown();
    doc.fontSize(30).text("Four-Parks Colombia", {
      align: "center",
    });
    doc.moveDown();

    // Tabla con información general
    doc.fontSize(14).text("Información General", { underline: true });
    doc.moveDown();
    doc.table({
      headers: [
        "Total de Ingresos",
        "Total de Horas",
        "Reservas Finalizadas",
        "Reservas Canceladas",
      ],
      rows: [
        [
          data.getGeneralStatics.totalRevenue,
          data.getGeneralStatics.totalHours,
          data.getGeneralStatics.finishedReservations,
          data.getGeneralStatics.canceledReservations,
        ],
      ],
    });
    doc.moveDown();

    // Información sobre reservas por hora
    doc
      .fillColor("#FFCC99")
      .fontSize(14)
      .text("Reservas por Hora", { underline: true });
    const scatterChartImage = createScatterChart(data.countReservationByHour);
    doc.image(scatterChartImage, { fit: [400, 400], align: "center" });
    doc.addPage();
    await addHeaderAndBorder();

    // Ganancias de reservas por parqueadero
    doc
      .fontSize(14)
      .text("Ganancias de Reservas por Parqueadero", { underline: true });
    const earningsParkingChart = createBarChart(data.countEarningsByParking);
    doc.image(earningsParkingChart, { fit: [400, 400], align: "center" });
    doc.addPage();
    await addHeaderAndBorder();

    // Cantidad de reservas por parqueadero
    doc
      .fontSize(14)
      .text("Cantidad de Reservas por Parqueadero", { underline: true });
    const countParkingChart = createBarChart(data.countReservationsByParking);
    doc.image(countParkingChart, { fit: [400, 400], align: "center" });
    doc.addPage();
    await addHeaderAndBorder();

    // Ganancias de reservas por vehículo
    doc
      .fontSize(14)
      .text("Ganancias de Reservas por Vehículo", { underline: true });
    const earningsVehicleChart = createPieChart(data.countEarningsByVehicle);
    doc.image(earningsVehicleChart, { fit: [400, 400], align: "center" });
    doc.addPage();
    await addHeaderAndBorder();

    // Ganancias de reservas por método de pago
    doc
      .fontSize(14)
      .text("Ganancias de Reservas por Método de Pago", { underline: true });
    const earningsPaymentMethodChart = createPieChart(
      data.countEarningsByPaymentMethod
    );
    doc.image(earningsPaymentMethodChart, { fit: [400, 400], align: "center" });

    // Finalizar y guardar el PDF
    doc.end();

    return "Informe generado correctamente.";
  } catch (error) {
    throw error;
  }
};

export const getStatisticsExcelService = async (data) => {
  try {
    // Crear un nuevo libro de Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(
      "Informe Estadístico Four-Parks Colombia"
    );

    // Agregar la información general en la hoja de Excel
    worksheet.addRow([
      "Total de Ingresos",
      "Total de Horas",
      "Reservas Finalizadas",
      "Reservas Canceladas",
    ]);
    worksheet.addRow([
      data.getGeneralStatics.totalRevenue,
      data.getGeneralStatics.totalHours,
      data.getGeneralStatics.finishedReservations,
      data.getGeneralStatics.canceledReservations,
    ]);

    // Establecer el ancho de las columnas
    worksheet.columns.forEach((column) => {
      column.width = 20;
    });

    // Establecer formato para la fila de encabezados
    worksheet.getRow(1).font = { bold: true };
    // Agregar una fila vacía para separar
    worksheet.addRow([]);

    // Agregar el título del gráfico de dispersión
    worksheet.addRow(["Gráfico de Reservas por Hora"]);

    // Crear el gráfico de dispersión y obtener la imagen en base64
    const scatterChartImageBase64 = createScatterChart(
      data.countReservationByHour
    );

    // Agregar la imagen como un enlace en la hoja de Excel
    const imageId = workbook.addImage({
      base64: scatterChartImageBase64,
      extension: "png",
    });

    worksheet.addImage(imageId, {
      tl: { col: 1, row: worksheet.lastRow.number + 1 },
      br: { col: 10, row: worksheet.lastRow.number + 25 },
    });

    // Agregar una fila vacía para separar
    worksheet.addRow([]);

    // Agregar el título del gráfico de dispersión
    worksheet.addRow(["Ganancias de Reservas por Parqueadero"]);

    // Crear el gráfico de dispersión y obtener la imagen en base64
    const earningsParkingChartImageBase64 = createBarChart(
      data.countEarningsByParking
    );

    // Agregar la imagen como un enlace en la hoja de Excel
    const imageEarningsParking = workbook.addImage({
      base64: earningsParkingChartImageBase64,
      extension: "png",
    });

    worksheet.addImage(imageEarningsParking, {
      tl: { col: 1, row: worksheet.lastRow.number + 1 },
      br: { col: 10, row: worksheet.lastRow.number + 25 },
    });

    // Agregar una fila vacía para separar
    worksheet.addRow([]);

    // Agregar el título del gráfico de dispersión
    worksheet.addRow(["Cantidad de Reservas por Parqueadero"]);

    // Crear el gráfico de dispersión y obtener la imagen en base64
    const countParkingChartImageBase64 = createBarChart(
      data.countReservationsByParking
    );

    // Agregar la imagen como un enlace en la hoja de Excel
    const imageCountParking = workbook.addImage({
      base64: countParkingChartImageBase64,
      extension: "png",
    });

    worksheet.addImage(imageCountParking, {
      tl: { col: 1, row: worksheet.lastRow.number + 1 },
      br: { col: 10, row: worksheet.lastRow.number + 25 },
    });

    // Agregar una fila vacía para separar
    worksheet.addRow([]);

    // Agregar el título del gráfico de dispersión
    worksheet.addRow(["Ganancias de Reservas por Vehículo"]);

    // Crear el gráfico de dispersión y obtener la imagen en base64
    const earningsVehicleChartImageBase64 = createPieChart(
      data.countEarningsByVehicle
    );

    // Agregar la imagen como un enlace en la hoja de Excel
    const imageEarningsVehicle = workbook.addImage({
      base64: earningsVehicleChartImageBase64,
      extension: "png",
    });

    worksheet.addImage(imageEarningsVehicle, {
      tl: { col: 1, row: worksheet.lastRow.number + 1 },
      br: { col: 10, row: worksheet.lastRow.number + 25 },
    });

    // Agregar una fila vacía para separar
    worksheet.addRow([]);

    // Agregar el título del gráfico de dispersión
    worksheet.addRow(["Ganancias de Reservas por Método de Pago"]);

    // Crear el gráfico de dispersión y obtener la imagen en base64
    const earningsPaymentMethodChartImageBase64 = createPieChart(
      data.countEarningsByPaymentMethod
    );

    // Agregar la imagen como un enlace en la hoja de Excel
    const imageEarningsPaymentMethod = workbook.addImage({
      base64: earningsPaymentMethodChartImageBase64,
      extension: "png",
    });

    worksheet.addImage(imageEarningsPaymentMethod, {
      tl: { col: 1, row: worksheet.lastRow.number + 1 },
      br: { col: 10, row: worksheet.lastRow.number + 25 },
    });

    // Guardar el libro de Excel en un buffer
    const buffer = await workbook.xlsx.writeBuffer();

    return buffer;
  } catch (error) {
    throw error;
  }
};
