import { prisma } from "../../conn.js";
import {
  convertParkingData,
  getFormattedMessage,
  restructureObject,
} from "../../utils/dataConversion.js";
import { getGeoByText } from "../../utils/googleMaps.js";
import { getUserByIdService } from "../user/user.service.js";

export const getParkingsService = async (q, query, isActive) => {
  try {
    let whereClause = {};
    if (q) {
      whereClause = {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { address: { contains: q, mode: "insensitive" } },
        ],
      };
    }

    if (isActive) {
      whereClause.is_active = isActive.toLowerCase() === "true";
    }

    if (query) {
      let object_query = restructureObject(query);
      if (whereClause.OR) {
        whereClause.OR = [...whereClause.OR, ...object_query];
      } else if (object_query.length > 0) {
        whereClause.OR = [...object_query];
      }
    }

    const result = await prisma.parkings.findMany({
      where: whereClause,
      include: {
        cities: true,
        types_parking: true,
        schedules: true,
        parking_controllers: {
          include: {
            vehicles: true,
          },
        },
      },
      orderBy: {
        is_active: "desc", // Ordenar de forma descendente, colocando primero los estacionamientos activos
      },
    });

    if (result && result.length > 0) {
      result.forEach((parking) => {
        const formattedSchedules = [];

        if (parking.schedules) {
          const schedules = Array.isArray(parking.schedules)
            ? parking.schedules
            : [parking.schedules];

          schedules.forEach((scheduleJSON) => {
            const formattedMessage = getFormattedMessage(scheduleJSON);

            const formattedSchedule = {
              name_formatted: formattedMessage,
              ...scheduleJSON,
            };

            formattedSchedules.push(formattedSchedule);
          });
        }

        // Reemplazar el objeto 'schedules' con los horarios formateados
        parking.schedules = formattedSchedules;
      });
    }

    return result;
  } catch (error) {
    throw error;
  }
};

export const getParkingService = async (element, type_search) => {
  try {
    const result = await prisma.parkings.findUnique({
      where: {
        [type_search]: element,
      },
      include: {
        cities: true,
        types_parking: true,
        schedules: true,
        parking_controllers: {
          include: {
            vehicles: true,
          },
        },
      },
    });

    if (!result) throw new Error("No se encontró el parqueadero");

    const scheduleJSON = result.schedules; // El único objeto de horario

    const formattedMessage = getFormattedMessage(scheduleJSON);

    const formattedSchedule = {
      name_formatted: formattedMessage,
      ...scheduleJSON,
    };

    // Reemplazar el objeto 'schedules' con el horario formateado
    result.schedules = formattedSchedule;

    return result;
  } catch (error) {
    throw error;
  }
};

export const getParkingDuplicates = async (name, address) => {
  try {
    const result = await prisma.parkings.findMany({
      where: {
        OR: [
          {
            name: {
              contains: name, // 'searchTerm' es el término de búsqueda proporcionado
            },
          },
          {
            address: {
              contains: address, // 'searchTerm' es el término de búsqueda proporcionado
            },
          },
        ],
      },
    });

    if (result.length === 0) {
      return false;
    }

    return true;
  } catch (error) {
    throw error;
  }
};

export const createParkingService = async (parking) => {
  try {
    parking = convertParkingData(parking);

    // const coordinates = await getGeoByText(parking.address);
    // parking.latitude = coordinates.lat;
    // parking.longitude = coordinates.lon;

    if (!parking.is_active) {
      parking.id_user_fk = null;
    }

    if (parking.id_user_fk !== null && parking.id_user_fk !== undefined) {
      const user = await getUserByIdService(parking.id_user_fk);
      if (user.roles.name !== "Administrador") {
        throw new Error("El usuario seleccionado no es un Administrador");
      }
    }

    const result = await prisma.parkings.create({ data: parking });

    return result;
  } catch (error) {
    throw error;
  }
};

export const updateParkingService = async (id, parking) => {
  try {
    parking = convertParkingData(parking);
    // if (parking.address) {
    //   parking = convertParkingData(parking);

    //   const coordinates = await getGeoByText(parking.address);
    //   parking.latitude = coordinates.lat;
    //   parking.longitude = coordinates.lon;
    // }

    if (!parking.is_active) {
      parking.id_user_fk = null;
    }
    console.log(parking.id_user_fk)

    if (parking.id_user_fk !== null && parking.id_user_fk !== undefined) {
      const user = await getUserByIdService(parking.id_user_fk);
      if (user.roles.name !== "Administrador") {
        throw new Error("El usuario seleccionado no es un Administrador");
      }
    }

    const result = await prisma.parkings.update({
      where: { id_parking: parseInt(id) },
      data: parking,
    });

    return result;
  } catch (error) {
    throw error;
  }
};

export const deleteParkingService = async (id) => {
  try {
    await prisma.parkings.delete({
      where: { id_parking: parseInt(id) },
    });
  } catch (error) {
    throw error;
  }
};
