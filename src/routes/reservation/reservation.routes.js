import { Router } from "express";

import {
  authenticateToken,
  verifyManager,
} from "../../middlewares/tokenValidator.js";

import { validateSchema } from "../../middlewares/validator.middleware.js";
// import { parkingSchema } from "../../schemas/parking/parking.schema.js";

import {
  createReservation,
  getReservationById,
  getReservations,
} from "../../controllers/reservation/reservation.controller.js";

const router = Router();

router.get("/reservations", getReservations);
router.get("/reservations/:id", getReservationById);
router.post("/reservations", [authenticateToken], createReservation);

export default router;
