import { prisma } from "../../conn.js";
import { getFormattedMessage } from "../../utils/dataConversion.js";

export const getSchedulesService = async () => {
  try {
    const result = await prisma.schedules.findMany();

    const formattedResults = [];

    result.forEach((scheduleJSON) => {
      let formattedMessage;

      formattedMessage = getFormattedMessage(scheduleJSON);

      const formattedResult = {
        id_schedule: scheduleJSON.id_schedule,
        name: formattedMessage,
      };
      formattedResults.push(formattedResult);
    });


    return formattedResults;
  } catch (error) {
    throw error;
  }
};

export const getScheduleByIdService = async (id) => {
  try {
    const result = await prisma.schedules.findUnique({
      where: { id_schedule: parseInt(id) },
    });

    if (!result) throw new Error("No se encontró el horario");

    // Acordarse que las funciones flecha no es necesario el return al final
    return result;
  } catch (error) {
    throw error;
  }
};

export const createSchedulesService = async (schedules) => {
  try {
    const result = await prisma.schedules.createMany({
      data: schedules,
      skipDuplicates: true,
    });

    return result;
  } catch (error) {
    throw error;
  }
};
