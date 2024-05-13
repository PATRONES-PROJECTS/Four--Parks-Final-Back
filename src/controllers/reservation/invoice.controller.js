import { getInvoiceService, getInvoicesService } from "../../services/reservation/invoice.service.js";

export const getInvoices = async (req, res, next) => {
  try {
    const user = req.user;
    let query = req.query;
    const { q, startDate, endDate } = req.query;
    const limit = parseInt(req.query.limit);
    const offset = parseInt(req.query.offset);
    const result = await getInvoicesService(
      user,
      q,
      query,
      startDate,
      endDate,
      {limit, offset}
    );

    res.json(result);
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

export const getInvoiceById = async (req, res, next) => {
    try {
      // Extraer id de req.params
      const { id } = req.params;
  
      const result = await getInvoiceService(parseInt(id), "id_invoice");
  
      res.json(result);
    } catch (error) {
      console.log(error.message);
      next(error);
    }
  };
