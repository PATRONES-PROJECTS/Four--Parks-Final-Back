import express from "express";
import morgan from "morgan";
import cors from "cors";
import multer from "multer";
import cookieParser from "cookie-parser";

import roleRoutes from "./routes/user/role.routes.js";
import recordRoutes from "./routes/user/record.routes.js";
import cardRoutes from "./routes/user/card.routes.js";
import userRoutes from "./routes/user/user.routes.js";
import authenticationRoutes from "./routes/user/authentication.routes.js";

import cityRoutes from "./routes/parking/city.routes.js";
import parkingRoutes from "./routes/parking/parking.routes.js";
import scheduleRoutes from "./routes/parking/schedule.routes.js";
import typeParkingRoutes from "./routes/parking/typeParking.routes.js";
import vehicleRoutes from "./routes/parking/vehicle.routes.js";

import paymentMethodRoutes from "./routes/reservation/paymentMethod.routes.js";
import reservationRoutes from "./routes/reservation/reservation.routes.js";

import mapsRoutes from "./utils/googleMaps.js";

import { createDates } from "./seed.js";

const app = express();


// Permite comunicar servidores de manera simple, en este caso con el front-end
app.use(
  cors({
    origin: ["https://fourpark.vercel.app", "http://localhost:5173"],
    // Dar permiso de establecer las cookies
    credentials: true,
  })
);
// Ver por consola peticiones
app.use(morgan("dev"));
// El servidor de Express podrá entender las peticiones POST
app.use(express.json());
// Lectura de cookies como JSON
app.use(cookieParser());

// Configuración para recibir multipart/form-data
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "src/temp"); // Define la carpeta de destino donde se guardarán los archivos
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Usa el nombre original del archivo como nombre de archivo en el sistema de archivos del servidor
  },
});

const upload = multer({ storage: storage });
app.use(express.urlencoded({ extended: true }));
app.use(upload.any());

app.use("/api", roleRoutes);
app.use("/api", recordRoutes);
app.use("/api", cardRoutes);
app.use("/api", userRoutes);
app.use("/api", authenticationRoutes);

app.use("/api", cityRoutes);
app.use("/api", parkingRoutes);
app.use("/api", scheduleRoutes);
app.use("/api", typeParkingRoutes);
app.use("/api", vehicleRoutes);

app.use("/api", paymentMethodRoutes);+
app.use("/api", reservationRoutes);

app.use("/api", mapsRoutes);

// createDates();

app.use((err, req, res, next) => {
  // Verificar si el error es de Prisma y manejarlo

  if (err.code === "P2002" && err.meta?.target) {
    const field = err.meta.target[0]; // Suponiendo que solo hay un campo afectado

    // Mapa de mensajes de error en español
    const errorMessageMap = {
      user_name: "El nombre de usuario ya ha sido registrado.",
      mail: "El correo electrónico ya ha sido registrado.",
      address: "La dirección ya ha sido registrada.",
      identification_card: "La cédula ya ha sido registrada.",
      name: "El nombre ya ha sido registrado.",
      // Agrega más campos y mensajes de error según sea necesario
    };

    // Generar el mensaje de error en español utilizando el mapa de mensajes
    const errorMessage = errorMessageMap[field] || "Error en el campo.";

    return res.status(404).json({ message: errorMessage });
  }

  if (err.code === "P2025") {
    return res.status(404).json({
      message: "No se encontró el resultado con el ID proporcionado",
    });
  }

  // Verificar si el error es una validación de datos faltantes en Prisma
  if (err.message.includes("P")) {
    return res.status(400).json({
      message: "Error en los datos",
    });
  }

  return res.status(400).json({
    message: err.message,
  });
});

export default app;
