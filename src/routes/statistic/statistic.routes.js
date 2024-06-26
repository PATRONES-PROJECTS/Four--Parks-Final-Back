import { Router } from "express";

import {
  authenticateToken,
  verifyAdministrator,
  verifyManager,
} from "../../middlewares/tokenValidator.js";

import { validateSchema } from "../../middlewares/validator.middleware.js";
import { statisticSchema } from "../../schemas/statistic/statistic.schema.js";

import {
  getStaticsByAdmin,
  getStaticsByManager,
  getStatisticsExcel,
  getStatisticsPDF,
} from "../../controllers/statistic/statistic.controller.js";

const router = Router();

router.post(
  "/statistics-excel",
  [authenticateToken, verifyManager, validateSchema(statisticSchema)],
  getStatisticsExcel
);
router.post(
  "/statistics-pdf",
  [authenticateToken, verifyManager, validateSchema(statisticSchema)],
  getStatisticsPDF
);

router.post(
  "/statistics-admin",
  [authenticateToken, verifyAdministrator, validateSchema(statisticSchema)],
  getStaticsByAdmin
);
router.post(
  "/statistics-manager",
  [authenticateToken, verifyManager, validateSchema(statisticSchema)],
  getStaticsByManager
);

export default router;
