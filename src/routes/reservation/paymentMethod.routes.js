import { Router } from "express";

import { authenticateToken } from "../../middlewares/tokenValidator.js";

import {
  getPaymentMethods,
  getPaymentMethodById,
} from "../../controllers/reservation/paymentMethod.controller.js";

const router = Router();

router.get("/payment-methods", [authenticateToken], getPaymentMethods);
router.get("/payment-methods/:id", [authenticateToken], getPaymentMethodById);

export default router;
