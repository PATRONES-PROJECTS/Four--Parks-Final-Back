import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";
import nodemailer from "nodemailer";
import Stripe from "stripe";

import { imageStorage, mailValues, stripeKey } from "./config.js";

// Conexión a base de datos
export const prisma = new PrismaClient();

// Conexión Cloudinary (Almacenamiento de imágenes)
cloudinary.config({
  cloud_name: imageStorage.cloud_name,
  api_key: imageStorage.api_key,
  api_secret: imageStorage.api_secret,
});

// Servicio de correo con gmail y nodemailer
export const gmail = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: mailValues.user,
    clientId: mailValues.clientId,
    clientSecret: mailValues.clientSecret,
    refreshToken: mailValues.refreshToken,
  },
});

// -------------------------------- Colocar en variables de entorno
export const stripe = new Stripe(stripeKey);
