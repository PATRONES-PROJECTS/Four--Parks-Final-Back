import { Router } from "express";

import { authenticateToken } from "../../middlewares/tokenValidator.js";

import {
  getSchedules,
  getScheduleById,
} from "../../controllers/parking/schedule.controller.js";

const router = Router();

router.get("/schedules", [authenticateToken], getSchedules);
router.get("/schedules/:id", [authenticateToken], getScheduleById);

export default router;
