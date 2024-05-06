import { Router } from "express";

import {
  authenticateToken,
  verifyManager,
} from "../../middlewares/tokenValidator.js";

import { validateSchema } from "../../middlewares/validator.middleware.js";
import { parkingSchema } from "../../schemas/parking/parking.schema.js";

import {
  getParkings,
  getParkingById,
  createParking,
  updateParking,
  updateParkingWithoutImage,
  deleteParking,
} from "../../controllers/parking/parking.controller.js";

const router = Router();

router.get("/parkings", [authenticateToken], getParkings);
router.get("/parkings/:id", [authenticateToken], getParkingById);
router.post(
  "/parkings",
  [authenticateToken, verifyManager, validateSchema(parkingSchema)],
  createParking
);

router.put(
  "/parkings-with-image/:id",
  [authenticateToken, verifyManager, validateSchema(parkingSchema)],
  updateParking
);
router.put(
  "/parkings-without-image/:id",
  [authenticateToken, verifyManager, validateSchema(parkingSchema)],
  updateParkingWithoutImage
);

router.delete(
  "/parkings/:id",
  [authenticateToken, verifyManager],
  deleteParking
);

export default router;
