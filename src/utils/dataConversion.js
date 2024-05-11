import crypto from "crypto";
import { aesKey } from "../config.js";

const convertBoolean = (value) => {
  return !(value === "false" || value === "0" || value === false);
};

export const encryptString = (string) => {
  return crypto.createHash("md5").update(string).digest("hex");
};

export const convertParkingData = (parking) => {
  const convertedData = {
    ...parking,
    id_city_fk:
      typeof parking.id_city_fk === "string"
        ? parseInt(parking.id_city_fk)
        : parking.id_city_fk,
    id_type_parking_fk:
      typeof parking.id_type_parking_fk === "string"
        ? parseInt(parking.id_type_parking_fk)
        : parking.id_type_parking_fk,
    id_user_fk:
      typeof parking.id_user_fk === "string" && parking.id_user_fk === "null"
        ? null
        : typeof parking.id_user_fk === "string"
        ? parseInt(parking.id_user_fk)
        : parking.id_user_fk,
    id_schedule_fk:
      typeof parking.id_schedule_fk === "string"
        ? parseInt(parking.id_schedule_fk)
        : parking.id_schedule_fk,
    has_loyalty_service: convertBoolean(parking.has_loyalty_service),
    is_active: convertBoolean(parking.is_active),
    longitude:
      typeof parking.longitude === "string"
        ? parseFloat(parking.longitude)
        : parking.longitude,
    latitude:
      typeof parking.latitude === "string"
        ? parseFloat(parking.latitude)
        : parking.latitude,
  };

  return convertedData;
};

// ----------------------------------------------------------------------------------------------------------------
export const convertUserData = (user) => {
  const convertedData = {
    ...user,
    is_active: convertBoolean(user.is_active),
    mail: user.mail.toLowerCase(),
    // Encriptar de contraseña
    password: encryptString(user.password),
  };

  return convertedData;
};
export const convertReservationData = (reservation) => {
  const convertedData = {
    vehicle_code: reservation.vehicle_code,
    id_parking_fk:
      typeof reservation.id_parking_fk === "string"
        ? parseInt(reservation.id_parking_fk)
        : reservation.id_parking_fk,
    id_vehicle_fk:
      typeof reservation.id_vehicle_fk === "string"
        ? parseInt(reservation.id_vehicle_fk)
        : reservation.id_vehicle_fk,
    entry_reservation_date: new Date(
      `${reservation.entry_reservation_date}T${reservation.entry_reservation_time}:00`
    ),
    departure_reservation_date: new Date(
      `${reservation.departure_reservation_date}T${reservation.departure_reservation_time}:00`
    ),
  };

  return convertedData;
};

export const convertParkingControllerData = (controllerData) => {
  const convertedData = {
    ...controllerData,
    capacity:
      typeof controllerData.capacity === "string"
        ? parseInt(controllerData.capacity)
        : controllerData.capacity,
    fee:
      typeof controllerData.fee === "string"
        ? parseInt(controllerData.fee)
        : controllerData.fee,
  };

  return convertedData;
};

//------------------------------------------------------------------ Tarjeta -----------------------------------------------------------------------------
// Función para encriptar una string
export function encryptAES(text) {
  const iv = crypto.randomBytes(16); // Generar un IV aleatorio
  const cipher = crypto.createCipheriv("aes-256-cbc", aesKey, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + encrypted;
}

// Función para desencriptar una string
export function decryptAES(encryptedText) {
  const iv = Buffer.from(encryptedText.slice(0, 32), "hex"); // Extraer el IV del texto encriptado
  const encrypted = encryptedText.slice(32); // Extraer el texto encriptado sin el IV
  const decipher = crypto.createDecipheriv("aes-256-cbc", aesKey, iv);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

export function restructureObject(inputObject) {
  // Create an empty object to store the restructured data

  const list_query = [];
  // Iterate over each key in the input object
  for (const key in inputObject) {
    const newObject = {};
    // Check if the key follows the pattern table__field
    if (key.includes("__")) {
      const [table, field] = key.split("__"); // Split the key into table and field
      // If the table doesn't exist in the new object, create it as an empty object
      if (!newObject[table]) {
        newObject[table] = {};
      }
      // Assign the value of the original key to the corresponding field in the table object
      newObject[table][field] = {
        contains: inputObject[key],
        mode: "insensitive",
      };
      list_query.push(newObject);
    }
  }

  // Return the restructured object
  return list_query;
}

const getDayName = (dayNumber) => {
  const daysOfWeek = [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
  ];
  return daysOfWeek[dayNumber];
};

const formatTime = (time) => {
  const hours = String(time).padStart(2, "0");
  const minutes = "00";
  return `${hours}:${minutes}`;
};

export const getFormattedMessage = (scheduleJSON) => {
  if (
    (scheduleJSON.initial_day === 1,
    scheduleJSON.final_day === 0,
    scheduleJSON.opening_time === 0,
    scheduleJSON.closing_time === 11)
  ) {
    return "24 horas";
  } else {
    const initialDayName = getDayName(scheduleJSON.initial_day);
    const finalDayName = getDayName(scheduleJSON.final_day);
    const openingTime = formatTime(scheduleJSON.opening_time);
    const closingTime = formatTime(scheduleJSON.closing_time);
    return `${initialDayName} - ${finalDayName} de ${openingTime} - ${closingTime}`;
  }
};

// export const utcToBogConvert = (date) => {
//   // Extract components of the provided date
//   let year = date.getFullYear();
//   let month = ("0" + (date.getMonth() + 1)).slice(-2); // Adding 1 to the month because months start at 0
//   let day = ("0" + date.getDate()).slice(-2);
//   let hours = ("0" + date.getHours()).slice(-2);
//   let minutes = ("0" + date.getMinutes()).slice(-2);
//   let seconds = ("0" + date.getSeconds()).slice(-2);
//   let milliseconds = ("00" + date.getMilliseconds()).slice(-3);

//   // Format as a string in UTC format
//   let utcDate = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}Z`;

//   return utcDate;
// };
