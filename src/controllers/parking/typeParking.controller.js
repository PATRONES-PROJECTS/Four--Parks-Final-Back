import {
    getTypesParkingService,
    getTypeParkingByIdService,
  } from "../../services/parking/typeParking.service.js";
  
  export const getTypesParking = async (_, res, next) => {
    try {
      const result = await getTypesParkingService();
  
      res.json(result);
    } catch (error) {
      console.log(error.message);
      next(error);
    }
  };
  
  export const getTypeParkingById = async (req, res, next) => {
    try {
      // Extraer id de req.params
      const { id } = req.params;
  
      const result = await getTypeParkingByIdService(id);
  
      res.json(result);
    } catch (error) {
      console.log(error.message);
      next(error);
    }
  };
  