import { Router } from "express";

import { authenticateToken } from "../../middlewares/tokenValidator.js";

import {
  getTypesParking,
  getTypeParkingById,
} from "../../controllers/parking/typeParking.controller.js";

const router = Router();

router.get("/types-parking", [authenticateToken], getTypesParking);
router.get("/types-parking/:id", [authenticateToken], getTypeParkingById);

export default router;
