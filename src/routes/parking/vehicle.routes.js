import { Router } from "express";

import { authenticateToken } from "../../middlewares/tokenValidator.js";

import {
  getVehicles,
  getVehicleById,
} from "../../controllers/parking/vehicle.controller.js";

const router = Router();

router.get("/vehicles", [authenticateToken], getVehicles);
router.get("/vehicles/:id", [authenticateToken], getVehicleById);

export default router;
