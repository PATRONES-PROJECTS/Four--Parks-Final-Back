import { prisma } from "../../conn.js";

import { convertParkingControllerData } from "../../utils/dataConversion.js";

export const createParkingControllerService = async (parkingController) => {
  try {
    parkingController = convertParkingControllerData(parkingController);

    const result = await prisma.parking_controllers.create({
      data: parkingController,
    });

    //Hola
    return result;
  } catch (error) {
    throw error;
  }
};

export const updateParkingControllerService = async (
  id_vehicle,
  id_parking,
  parkingController
) => {
  try {
    parkingController = convertParkingControllerData(parkingController);
    const result = await prisma.parking_controllers.update({
      where: {
        id_vehicle_fk_id_parking_fk: {
          id_vehicle_fk: id_vehicle,
          id_parking_fk: id_parking,
        },
      },
      data: parkingController,
    });

    return result;
  } catch (error) {
    throw error;
  }
};

export const getParkingControllerService = async (idParking, idVehicle) => {
  try {
    const result = await prisma.parking_controllers.findFirst({
      where: { id_parking_fk: idParking, id_vehicle_fk: idVehicle},
    });

    if (!result) throw new Error("No se ha encontrado el controlador del parqueadero");

    return result;
  } catch (error) {
    throw error;
  }
};
