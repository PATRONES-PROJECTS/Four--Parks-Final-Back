import {
  getParkingsService,
  getParkingService,
  createParkingService,
  updateParkingService,
  deleteParkingService,
  getParkingDuplicates,
} from "../../services/parking/parking.service.js";

import {
  loadImage,
  loadImageWithURL,
  deleteImage,
} from "../../services/parking/image.service.js";

import { getVehicleByName } from "../../services/parking/vehicle.service.js";
import {
  createParkingControllerService,
  updateParkingControllerService,
} from "../../services/parking/parkingController.service.js";
import { returnMoneyFromReservations } from "../../services/reservation/reservation.service.js";

export const getParkings = async (req, res, next) => {
  try {
    let q = req.query.q;
    let query = req.query;
    let isActive = req.query.isActive;
    const limit = parseInt(req.query.limit);
    const offset = parseInt(req.query.offset);
    const result = await getParkingsService(q, query, isActive, {
      limit,
      offset,
    });

    res.json(result);
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

export const getParkingById = async (req, res, next) => {
  try {
    // Extraer id de req.params
    const { id } = req.params;

    const result = await getParkingService(parseInt(id), "id_parking");

    res.json(result);
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

export const createParking = async (req, res, next) => {
  try {
    const isParkingDuplicate = await getParkingDuplicates(
      req.body.name,
      req.body.address
    );

    if (isParkingDuplicate) {
      res.status(400).json({
        message: "El parqueadero con el nombre o dirección ya existe",
      });
      return;
    }

    await loadImage(req);

    const { imageURL, ...elements } = req.body;
    elements.image_path = imageURL;

    const parking = {
      name: elements.name,
      description: elements.description || "",
      address: elements.address,
      longitude: elements.longitude,
      latitude: elements.latitude,
      image_path: elements.image_path,
      has_loyalty_service: elements.has_loyalty_service || false,
      is_active: elements.is_active || true,
      id_city_fk: elements.id_city_fk,
      id_user_fk: elements.id_user_fk || null,
      id_schedule_fk: elements.id_schedule_fk,
      id_type_parking_fk: elements.id_type_parking_fk,
    };
    const result = await createParkingService(parking);

    const vehicleTypes = [
      { name: "Moto", key: "motorbike" },
      { name: "Carro", key: "car" },
      { name: "Bicicleta", key: "bicycle" },
    ];

    for (const vehicleType of vehicleTypes) {
      let vehicle = await getVehicleByName(vehicleType.name);
      let parkingController = {
        capacity: elements[`${vehicleType.key}_capacity`] || 0,
        fee: elements[`${vehicleType.key}_fee`] || 0,
        id_parking_fk: result.id_parking,
        id_vehicle_fk: vehicle.id_vehicle,
      };
      await createParkingControllerService(parkingController);
    }

    res.json(result);
  } catch (error) {
    console.log(error.message);
    await deleteImage(req, res, next);
    next(error);
  }
};

export const updateParking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const newName = req.body.name;

    const oldParking = await getParkingService(parseInt(id), "id_parking");

    const parking = {
      name: req.body.name,
      description: req.body.description || "",
      address: req.body.address,
      longitude: req.body.longitude,
      latitude: req.body.latitude,
      has_loyalty_service: req.body.has_loyalty_service || false,
      is_active: req.body.is_active || true,
      id_type_parking_fk: req.body.id_type_parking_fk,
      id_schedule_fk: req.body.id_schedule_fk,
      id_city_fk: req.body.id_city_fk,
      id_user_fk: req.body.id_user_fk || null,
    };

    const parkingTemporary = await updateParkingService(parseInt(id), parking);

    req.body.name = oldParking.name;
    await deleteImage(req);

    req.body.name = newName;
    await loadImage(req);

    const parkingImage = {
      image_path: req.body.imageURL,
      is_active: parkingTemporary.is_active,
    };
    const result = await updateParkingService(parseInt(id), parkingImage);

    const vehicleTypes = [
      { name: "Moto", key: "motorbike" },
      { name: "Carro", key: "car" },
      { name: "Bicicleta", key: "bicycle" },
    ];

    for (const vehicleType of vehicleTypes) {
      let vehicle = await getVehicleByName(vehicleType.name);
      let parkingController = {
        capacity: req.body[`${vehicleType.key}_capacity`] || 0,
        fee: req.body[`${vehicleType.key}_fee`] || 0,
      };
      await updateParkingControllerService(
        vehicle.id_vehicle,
        result.id_parking,
        parkingController
      );
    }

    if (!result.is_active) {
      await returnMoneyFromReservations(result.id_parking);
    }

    res.json(result);
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

export const updateParkingWithoutImage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const newName = req.body.name;

    const oldParking = await getParkingService(parseInt(id), "id_parking");
    const parking = {
      name: req.body.name,
      description: req.body.description || "",
      address: req.body.address,
      longitude: req.body.longitude,
      latitude: req.body.latitude,
      has_loyalty_service: req.body.has_loyalty_service || false,
      is_active: req.body.is_active || true,
      id_type_parking_fk: req.body.id_type_parking_fk,
      id_schedule_fk: req.body.id_schedule_fk,
      id_city_fk: req.body.id_city_fk,
      id_user_fk: req.body.id_user_fk || null,
    };
    const parkingTemporary = await updateParkingService(parseInt(id), parking);

    req.body.name = newName;
    req.body.oldName = oldParking.name;
    req.body.image_path = oldParking.image_path;
    await loadImageWithURL(req);

    const parkingImage = {
      image_path: req.body.imageURL,
      is_active: parkingTemporary.is_active,
    };
    const result = await updateParkingService(parseInt(id), parkingImage);

    const vehicleTypes = [
      { name: "Moto", key: "motorbike" },
      { name: "Carro", key: "car" },
      { name: "Bicicleta", key: "bicycle" },
    ];

    for (const vehicleType of vehicleTypes) {
      let vehicle = await getVehicleByName(vehicleType.name);
      let parkingController = {
        capacity: req.body[`${vehicleType.key}_capacity`] || 0,
        fee: req.body[`${vehicleType.key}_fee`] || 0,
      };
      await updateParkingControllerService(
        vehicle.id_vehicle,
        result.id_parking,
        parkingController
      );
    }

    if (!result.is_active) {
      await returnMoneyFromReservations(result.id_parking);
    }

    res.json(result);
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

export const deleteParking = async (req, res, next) => {
  try {
    // Extraer id de req.params
    const { id } = req.params;

    const result = await getParkingService(parseInt(id), "id_parking");
    req.body.name = result.name;

    await deleteParkingService(parseInt(id));
    await deleteImage(req);

    res.sendStatus(204);
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};
