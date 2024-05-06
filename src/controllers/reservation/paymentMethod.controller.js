import {
    getPaymentMethodsService,
    getPaymentMethodByIdService,
  } from "../../services/reservation/paymentMethod.service.js";
  
  export const getPaymentMethods = async (_, res, next) => {
    try {
      const result = await getPaymentMethodsService();
  
      res.json(result);
    } catch (error) {
      console.log(error.message);
      next(error);
    }
  };
  
  export const getPaymentMethodById = async (req, res, next) => {
    try {
      // Extraer id de req.params
      const { id } = req.params;
  
      const result = await getPaymentMethodByIdService(id);
  
      res.json(result);
    } catch (error) {
      console.log(error.message);
      next(error);
    }
  };
  