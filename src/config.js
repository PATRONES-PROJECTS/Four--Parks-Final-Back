// Variables de entorno
import { config } from "dotenv";

// Llamar a las variables de entorno
config();


// process.env.TZ = 'America/Bogota';
process.env.TZ = 'UTC';

export const imageStorage = {
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
};

export const TOKEN_SCRET = process.env.TOKEN_SCRET;

export const mailValues = {
  user: process.env.USER,
  clientId: process.env.CLIENTID,
  clientSecret: process.env.CLIENTSECRET,
  refreshToken: process.env.REFRESHTOKEN,
};

export const stripeKey = process.env.STRIPEKEY

export const aesKey = process.env.AESKEY

export const dataManager = {
  user_name: process.env.USERNAMEMANAGER,
  mail: process.env.MAILMANAGER,
  password: process.env.PASSWORDMANAGER,
  identification_card: process.env.IDENTIFICATIONCARDMANAGER,
}
export const GOOGLE_SECRET_KEY = process.env.GOOGLE_SECRET_KEY
