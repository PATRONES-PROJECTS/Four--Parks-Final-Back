import { getParkingService } from "../../services/parking/parking.service.js";
import { getReservationsByHourService, getStaticsByAdminService, getStaticsByManagerService } from "../../services/statistic/statistic.service.js";

export const getStatistics = async (req, res, next) => {
  try {
    const { startDate, endDate, id_city_fk, id_parking_fk } = req.body;

    const result = await getReservationsByHourService(
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
