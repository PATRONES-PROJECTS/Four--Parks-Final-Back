import { Router } from "express";

import { authenticateToken } from "../../middlewares/tokenValidator.js";

import {
  getInvoiceById,
  getInvoices,
} from "../../controllers/reservation/invoice.controller.js";

const router = Router();

router.get("/invoices", authenticateToken, getInvoices);
router.get("/invoices/:id", authenticateToken, getInvoiceById);

export default router;
