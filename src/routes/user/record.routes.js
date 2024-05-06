import { Router } from "express";

import {
  authenticateToken,
  verifyManager,
} from "../../middlewares/tokenValidator.js";

import {
  getRecords,
  getRecordsByUser,
} from "../../controllers/user/record.controller.js";

const router = Router();

router.get("/records", [authenticateToken, verifyManager], getRecords);
// Tal vez sobre ----------------------------------------------------
router.get(
  "/records/:user",
  [authenticateToken, verifyManager],
  getRecordsByUser
);

export default router;
