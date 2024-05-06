import {
  getRecordsService,
  getRecordsByUserService,
} from "../../services/user/record.service.js";

import { getUserByParameterService } from "../../services/user/user.service.js";

export const getRecords = async (req, res, next) => {
  try {
    let query = req.query;
    const {q, startDate, endDate } = req.query;

    const result = await getRecordsService(q, query, startDate, endDate);

    res.json(result);
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

export const getRecordsByUser = async (req, res, next) => {
  try {
    const { user } = req.params;

    const userResult = await getUserByParameterService(user, "user_name");

    const result = await getRecordsByUserService(userResult.id_user);

    // Acordarse que las funciones flecha no es necesario el return al final
    res.json(result);
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};
