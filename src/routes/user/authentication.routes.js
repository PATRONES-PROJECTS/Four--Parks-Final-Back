import { Router } from "express";

import {
  authenticateToken,
  verifyManager,
} from "../../middlewares/tokenValidator.js";

import { validateSchema } from "../../middlewares/validator.middleware.js";
import { cardSchema, verifyCard } from "../../schemas/user/card.schema.js";
import {
  registerSchema,
  loginSchema,
  passwordSchema,
} from "../../schemas/user/authentication.schema.js";

import {
  registerClient,
  registerAdministrator,
  login,
  logout,
  verifyToken,
  requestToken,
  recoverPassword,
  verifyUserMail,
} from "../../controllers/user/authentication.controller.js";

const router = Router();

router.get("/verify", verifyToken);

router.post(
  "/register",
  [validateSchema(registerSchema), validateSchema(cardSchema), verifyCard],
  registerClient
);
router.post(
  "/register-administrator",
  [authenticateToken, verifyManager, validateSchema(registerSchema)],
  registerAdministrator
);

router.post("/login", validateSchema(loginSchema), login);
router.post("/logout", logout);

router.post("/request-token", requestToken);
router.post(
  "/recover-password/:token",
  [validateSchema(passwordSchema)],
  recoverPassword
);
router.post("/verify-mail/:token", verifyUserMail);

export default router;
