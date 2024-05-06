import { Router } from "express";

import {
  authenticateToken,
  verifyClient,
  verifyManager,
} from "../../middlewares/tokenValidator.js";

import { validateSchema } from "../../middlewares/validator.middleware.js";
import { cardSchema, verifyCard } from "../../schemas/user/card.schema.js";

import {
  getCards,
  getCardById,
  getCardByClient,
  updateCard,
  updateCardByClient,
} from "../../controllers/user/card.controller.js";

const router = Router();

router.get("/cards", [authenticateToken, verifyManager], getCards);
router.get("/cards/:id", [authenticateToken, verifyManager], getCardById);
router.get("/card", [authenticateToken, verifyClient], getCardByClient);

router.put(
  "/cards/:id",
  [authenticateToken, verifyManager, validateSchema(cardSchema), verifyCard],
  updateCard
);

router.put(
  "/card",
  [authenticateToken, verifyClient, validateSchema(cardSchema), verifyCard],
  updateCardByClient
);

export default router;
