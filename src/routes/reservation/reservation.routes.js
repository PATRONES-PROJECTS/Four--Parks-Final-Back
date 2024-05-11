import { Router } from "express";

import {
  authenticateToken,
  verifyAdministrator,
  verifyClient,
} from "../../middlewares/tokenValidator.js";

import { validateSchema } from "../../middlewares/validator.middleware.js";
import { reservationSchema } from "../../schemas/reservation/reservation.schema.js";

import {
  cancel,
  cancelReservation,
  checkInReservation,
  checkOutReservation,
  createReservation,
  getReservationById,
  getReservations,
  success,
} from "../../controllers/reservation/reservation.controller.js";

const router = Router();

router.get("/reservations", authenticateToken, getReservations);
router.get("/reservations/:id", authenticateToken, getReservationById);

router.post(
  "/reservations",
  [authenticateToken, verifyClient, validateSchema(reservationSchema)],
  createReservation
);
router.put("/cancel-reservation/:id", authenticateToken, cancelReservation);
router.put(
  "/check-in/:id",
  [authenticateToken, verifyAdministrator],
  checkInReservation
);
router.put(
  "/check-out/:id",
  [authenticateToken, verifyAdministrator],
  checkOutReservation
);

router.get("/success", success);
router.get("/cancel", cancel);

export default router;
