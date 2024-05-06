import { Router } from "express";

import { authenticateToken } from "../../middlewares/tokenValidator.js";

import {
  getCities,
  getCityById,
} from "../../controllers/parking/city.controller.js";

const router = Router();

router.get("/cities", [authenticateToken], getCities);
router.get("/cities/:id", [authenticateToken], getCityById);

export default router;
