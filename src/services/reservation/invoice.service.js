import { prisma, stripe } from "../../conn.js";
import { restructureObject } from "../../utils/dataConversion.js";

export const getReservationsService = async (q, query) => {
  try {
    let whereClause = {};
    if (q) {
      whereClause = {
        OR: [
          { state: { contains: q, mode: "insensitive" } },
          { vehicle_code: { contains: q, mode: "insensitive" } },
          { reservation_date: { equals: new Date(q) } },
          { users: { user_name: { contains: q, mode: "insensitive" } } },
        ],
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

    const result = await prisma.reservations.findMany({
      where: whereClause,
      include: {
        users: {
          select: {
            user_name: true,
          },
        },
        parkings: {
          select: {
            name: true,
          },
        },
        vehicles: {
          select: {
            name: true,
          },
        },
      },
    });

    return result;
  } catch (error) {
    throw error;
  }
};

export const getReservationService = async (element, type_search) => {
  try {
    const result = await prisma.reservations.findUnique({
      where: {
        [type_search]: element,
      },
      include: {
        users: {
          select: {
            user_name: true,
          },
        },
        parkings: {
          select: {
            name: true,
          },
        },
        vehicles: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!result) throw new Error("No se encontró la reserva");

    return result;
  } catch (error) {
    throw error;
  }
};

export const createParkingService = async (parking) => {
  try {
    return result;
  } catch (error) {
    throw error;
  }
};

export const updateParkingService = async (id, parking) => {
  try {
    return result;
  } catch (error) {
    throw error;
  }
};
