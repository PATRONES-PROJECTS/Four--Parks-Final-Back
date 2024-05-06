import { Router } from "express";

import {
  authenticateToken,
  verifyManager,
} from "../../middlewares/tokenValidator.js";

import {
  getRoles,
  getRoleById,
} from "../../controllers/user/role.controller.js";

const router = Router();

router.get("/roles", [authenticateToken, verifyManager], getRoles);
router.get("/roles/:id", [authenticateToken, verifyManager], getRoleById);

export default router;
