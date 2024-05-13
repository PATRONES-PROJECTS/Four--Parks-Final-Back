import { getParkingService } from "../../services/parking/parking.service.js";
import {
  getStaticsByAdminService,
  getStaticsByManagerService,
  getStatisticsExcelService,
  getStatisticsPDFService,
} from "../../services/statistic/statistic.service.js";

export const getStatisticsExcel = async (req, res, next) => {
  try {
    const { startDate, endDate, id_city_fk, id_parking_fk } = req.body;

    const dataStatistics = await getStaticsByManagerService(
      startDate,
      endDate,
      id_city_fk,
      id_parking_fk
    );

    // const dataStatistics = await getStaticsByManagerService(
    //   "2024-05-10",
    //   "2024-05-20"
    // );

    // Llamar a la función para obtener los datos en formato buffer
    const buffer = await getStatisticsExcelService(dataStatistics);

    // Configurar los encabezados de la respuesta
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", 'attachment; filename="Reporte.xlsx"');

    // Enviar el buffer como respuesta
    res.send(buffer);
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

export const getStatisticsPDF = async (req, res, next) => {
  try {
    const { startDate, endDate, id_city_fk, id_parking_fk, type } = req.body;

    res.setHeader("Content-Type", "application/pdf");
    // res.setHeader("Content-Disposition", 'inline; filename="Reporte.pdf"');
    if (type === "attachment") {
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="Reporte.pdf"'
      );
    } else if (type === "inline") {
      res.setHeader("Content-Disposition", 'inline; filename="reporte.pdf"');
    } else {
      throw new Error("Seleccione un tipo de respuesta valido");
    }

    const stream = res;

    const dataStatistics = await getStaticsByManagerService(
      startDate,
      endDate,
      id_city_fk,
      id_parking_fk
    );

    await getStatisticsPDFService(
      (data) => stream.write(data),
      () => stream.end(),
      dataStatistics
    );
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

export const getStaticsByAdmin = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.body;

    const id = req.user.id_user;

    const parking = await getParkingService(id, "id_user_fk");

    const result = await getStaticsByAdminService(
      startDate,
      endDate,
      parking.id_parking
    );

    res.json(result);
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

export const getStaticsByManager = async (req, res, next) => {
  try {
    const { startDate, endDate, id_city_fk, id_parking_fk } = req.body;

    const result = await getStaticsByManagerService(
      startDate,
      endDate,
      id_city_fk,
      id_parking_fk
    );

    res.json(result);
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};
