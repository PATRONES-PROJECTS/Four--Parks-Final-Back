import { prisma } from "../../conn.js";

import { restructureObject } from "../../utils/dataConversion.js";

export const createInvoiceService = async (invoice) => {
  try {
    invoice.total_amount = invoice.reserve_amount + invoice.service_amount;

    const result = await prisma.invoices.create({
      data: invoice,
    });

    return result;
  } catch (error) {
    throw error;
  }
};

export const updateInvoiceService = async (id, invoice) => {
  try {
    const result = await prisma.invoices.update({
      where: { id_invoice: parseInt(id) },
      data: invoice,
    });

    return result;
  } catch (error) {
    throw error;
  }
};

export const getInvoicesService = async (
  user,
  q,
  query,
  startDate,
  endDate,
  pagination // Nuevo parámetro para la paginación
) => {
  try {
    let idUser = null;
    let idParking = null;

    if (user.role === "Administrador") {
      const parking = await getParkingService(user.id_user, "id_user_fk");
      idParking = parking.id_parking;
    } else if (user.role === "Cliente") {
      idUser = user.id_user;
    }

    let whereClause = {};
    if (q) {
      whereClause = {
        OR: [
          { state: { contains: q, mode: "insensitive" } },
          { vehicle_code: { contains: q, mode: "insensitive" } },
          { users: { user_name: { contains: q, mode: "insensitive" } } },
        ],
      };
    }

    // Convertir las fechas a formato ISO
    const startDateISO = startDate ? new Date(startDate).toISOString() : null;
    const endDateISO = endDate ? new Date(endDate).toISOString() : null;

    // Agregar condición para el rango de fechas si están presentes
    if (startDateISO && endDateISO) {
      whereClause.reservation_date = {
        gte: startDateISO, // Mayor o igual que la fecha de inicio
        lte: endDateISO, // Menor o igual que la fecha de fin
      };
    } else if (startDateISO) {
      whereClause.reservation_date = {
        gte: startDateISO, // Mayor o igual que la fecha de inicio
      };
    } else if (endDateISO) {
      whereClause.reservation_date = {
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

    const result = await prisma.invoices.findMany({
      where: {
        reservations: {
          AND: [
            whereClause,
            {
              AND: [
                idParking !== null ? { id_parking_fk: idParking } : {},
                idUser !== null ? { id_user_fk: idUser } : {},
              ],
            },
          ],
        },
      },
      include: {
        reservations: {
          select: {
            reservation_date: true,
            vehicle_code: true,
            users: {
              select: {
                user_name: true,
                mail: true,
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
        },
        payment_methods: {
          select: {
            name: true,
          },
        },
      },
      take: pagination.limit || undefined, // Tomar un número limitado de registros
      skip: pagination.offset || undefined,
    });

    return result;
  } catch (error) {
    throw error;
  }
};

export const getInvoiceService = async (element, type_search) => {
  try {
    const result = await prisma.invoices.findUnique({
      where: {
        [type_search]: element,
      },
      include: {
        reservations: {
          select: {
            reservation_date: true,
            vehicle_code: true,
            users: {
              select: {
                user_name: true,
                mail: true,
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
        },
        payment_methods: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!result) throw new Error("No se encontró la factura");

    return result;
  } catch (error) {
    throw error;
  }
};

export const getInvoiceStatisticsService = async (element, whereCondition) => {
  try {
    const result = await prisma.invoices.aggregate({
      _sum: {
        [element]: true,
      },
      where: {
        reservations: whereCondition,
      },
    });

    return result;
  } catch (error) {
    throw error;
  }
};
