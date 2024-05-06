import {
  getVehiclesService,
  getVehicleByIdService,
} from "../../services/parking/vehicle.service.js";

export const getVehicles = async (_, res, next) => {
  try {
    const result = await getVehiclesService();

    res.json(result);
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

export const getVehicleById = async (req, res, next) => {
  try {
    // Extraer id de req.params
    const { id } = req.params;

    const result = await getVehicleByIdService(id);

    res.json(result);
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};
