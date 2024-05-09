import { Router } from "express";

import {
  authenticateToken,
  verifyManager,
} from "../../middlewares/tokenValidator.js";

import { validateSchema } from "../../middlewares/validator.middleware.js";
// import { parkingSchema } from "../../schemas/parking/parking.schema.js";

import {
  cancel,
  cancelReservation,
  checkInReservation,
  checkOutReservation,
  createReservation,
  finalizeReservation,
  getReservationById,
  getReservations,
  success,
} from "../../controllers/reservation/reservation.controller.js";

const router = Router();

router.get("/reservations", getReservations);
router.get("/reservations/:id", getReservationById);
router.post("/reservations", [authenticateToken], createReservation);
router.put("/cancel-reservation/:id", cancelReservation)



router.get("/success", success)
router.get("/cancel", cancel)

router.put("/cancel-reservation", cancel)
router.put("/check-in/:id", checkInReservation)
router.put("/check-out", checkOutReservation)
router.put("/finalize-reservation", finalizeReservation)

export default router;
