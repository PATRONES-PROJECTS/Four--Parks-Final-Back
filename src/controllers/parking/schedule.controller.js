import {
  getSchedulesService,
  getScheduleByIdService,
} from "../../services/parking/schedule.service.js";


export const getSchedules = async (_, res, next) => {
  try {
    const result = await getSchedulesService();

    
    res.json(result);
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

export const getScheduleById = async (req, res, next) => {
  try {
    // Extraer id de req.params
    const { id } = req.params;

    const result = await getScheduleByIdService(id);

    res.json(result);
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};
