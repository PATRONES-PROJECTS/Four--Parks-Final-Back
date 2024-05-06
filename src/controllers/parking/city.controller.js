import {
    getCitiesService,
    getCityByIdService,
  } from "../../services/parking/city.service.js";
  
  export const getCities = async (_, res, next) => {
    try {
      const result = await getCitiesService();
  
      res.json(result);
    } catch (error) {
      console.log(error.message);
      next(error);
    }
  };
  
  export const getCityById = async (req, res, next) => {
    try {
      // Extraer id de req.params
      const { id } = req.params;
  
      const result = await getCityByIdService(id);
  
      res.json(result);
    } catch (error) {
      console.log(error.message);
      next(error);
    }
  };
  