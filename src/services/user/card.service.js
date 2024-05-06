import { prisma } from "../../conn.js";
import { decryptAES, encryptAES, restructureObject } from "../../utils/dataConversion.js";

export const getCardsService = async (q, query) => {
  try {
    let whereClause = {};
    if (q) {
      whereClause = {
        OR: [
          { number: { contains: q, mode: "insensitive" } },
          { cvc: { contains: q, mode: "insensitive" } },
          { expiration_date: { contains: q, mode: "insensitive" } },
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

    const cards = await prisma.cards.findMany({
      where: whereClause,
      include: {
        users: {
          select: {
            user_name: true,
          },
        },
      },
    });

    // Desencriptar cada número de card en el array
    const decryptedCards = cards.map((card) => {
      return {
        ...card,
        number: decryptAES(card.number),
      };
    });

    return decryptedCards;
  } catch (error) {
    throw error;
  }
};

export const getCardByIdService = async (id, type_search) => {
  try {
    const result = await prisma.cards.findUnique({
      where: { [type_search]: parseInt(id) },
      include: {
        users: {
          select: {
            user_name: true,
          },
        },
      },
    });

    if (!result) throw new Error("No se encontró la tarjeta");

    console.log(result);
    result.number = decryptAES(result.number);

    // Acordarse que las funciones flecha no es necesario el return al final
    return result;
  } catch (error) {
    throw error;
  }
};

export const createCardService = async (card) => {
  try {
    card.id_user_fk = parseInt(card.id_user_fk);
    card.number = encryptAES(card.number);

    const result = await prisma.cards.create({ data: card });

    return result;
  } catch (error) {
    throw error;
  }
};

export const updateCardService = async (id, card, type_search) => {
  try {
    card.number = encryptAES(card.number);

    const result = await prisma.cards.update({
      where: { [type_search]: parseInt(id) },
      data: card,
    });

    return result;
  } catch (error) {
    throw error;
  }
};
