import { Router } from "express";

import {
  authenticateToken,
  verifyAdministrator,
  verifyManager,
} from "../../middlewares/tokenValidator.js";

import { validateSchema } from "../../middlewares/validator.middleware.js";
import { updateUserSchema } from "../../schemas/user/user.schema.js";
import { passwordSchema } from "../../schemas/user/authentication.schema.js";

import {
  getUsers,
  getClients,
  getAdministrators,
  getUserById,
  getPersonalUser,
  updateUser,
  updateUserByAdministrator,
  updatePassword,
  deactivateUser,
  unlockUser,
} from "../../controllers/user/user.controller.js";

const router = Router();

router.get("/users", [authenticateToken, verifyAdministrator], getUsers);
router.get("/clients", [authenticateToken, verifyAdministrator], getClients);
router.get(
  "/administrators",
  [authenticateToken, verifyManager],
  getAdministrators
);

router.get("/users/:id", [authenticateToken, verifyAdministrator], getUserById);

router.get("/user", [authenticateToken], getPersonalUser);

router.put(
  "/update-password",
  [authenticateToken, validateSchema(passwordSchema)],
  updatePassword
);

router.put("/deactivate-user", [authenticateToken], deactivateUser);

router.put(
  "/unlock-user/:id",
  [authenticateToken, verifyAdministrator],
  unlockUser
);

router.put(
  "/update-user",
  [authenticateToken, validateSchema(updateUserSchema)],
  updateUser
);



router.put(
  "/update-user/:id",
  [authenticateToken, verifyManager, validateSchema(updateUserSchema)],
  updateUserByAdministrator
);

export default router;
