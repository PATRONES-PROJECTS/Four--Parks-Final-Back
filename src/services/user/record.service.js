import { prisma } from "../../conn.js";
import { restructureObject } from "../../utils/dataConversion.js";

export const getRecordsService = async (q, query, startDate, endDate) => {
  try {
    let whereClause = {};

    if (q) {
      whereClause = {
        OR: [
          { action: { contains: q, mode: "insensitive" } },
          { ip_user: { contains: q, mode: "insensitive" } },
          { users: { user_name: { contains: q, mode: "insensitive" } } },
        ],
      };
    }

    // Convertir las fechas a formato ISO
    const startDateISO = startDate ? new Date(startDate).toISOString() : null;
    const endDateISO = endDate ? new Date(endDate).toISOString() : null;

    // Agregar condición para el rango de fechas si están presentes
    if (startDateISO && endDateISO) {
      whereClause.date = {
        gte: startDateISO, // Mayor o igual que la fecha de inicio
        lte: endDateISO, // Menor o igual que la fecha de fin
      };
    } else if (startDateISO) {
      whereClause.date = {
        gte: startDateISO, // Mayor o igual que la fecha de inicio
      };
    } else if (endDateISO) {
      whereClause.date = {
        lte: endDateISO, // Menor o igual que la fecha de fin
      };
    }

    if (query) {
      let object_query = restructureObject(query);
      if (whereClause.OR) {
        whereClause.OR = [...whereClause.OR, ...object_query];
      } else if (object_query.length > 0) {
        whereClause.OR = [...object_query];
      }
    }

    const result = await prisma.records.findMany({
      where: whereClause,
      include: {
        users: {
          select: {
            user_name: true,
          },
        },
      },
    });

    result.forEach((record) => {
      const options = { day: "2-digit", month: "2-digit", year: "numeric" };
      const dateAsString = record.date.toLocaleDateString("es-CO", options);
      record.date = dateAsString;
    });

    return result;
  } catch (error) {
    throw error;
  }
};

export const getRecordsByUserService = async (id) => {
  try {
    const result = await prisma.records.findMany({
      where: { id_user_fk: id },
      include: {
        users: {
          select: {
            user_name: true,
          },
        },
      },
    });

    if (!result) throw new Error("No se encontró el registro");

    console.log(result.date);
    result.date = new Date(result.date).toISOString().split("T")[0];

    // Acordarse que las funciones flecha no es necesario el return al final
    return result;
  } catch (error) {
    throw error;
  }
};

export const createRecordService = async (record) => {
  try {
    const currentDate = new Date();
    currentDate.setHours(currentDate.getHours() - 5);
    // const currentDateBog = utcToBogConvert(new Date());

    record.date = currentDate;
    record.time = record.time = `${currentDate
      .getHours()
      .toString()
      .padStart(2, "0")}:${currentDate
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

    const result = await prisma.records.create({
      data: record,
    });

    console.log(record);

    return result;
  } catch (error) {
    throw error;
  }
};
