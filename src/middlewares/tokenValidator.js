import jwt from "jsonwebtoken";
import { TOKEN_SCRET } from "../config.js";

// Verifica para el token de login como middleware
export const authenticateToken = (req, res, next) => {
  // Extraer token de cookie, acordarse que viene como un JSON por el cookie parser de App
  const authHeader = req.headers["authorization"];

  let token;
  // Verificar si el encabezado de autorización existe y tiene el formato correcto
  if (authHeader && authHeader.startsWith("Bearer ")) {
    // Extraer el token excluyendo el prefijo "Bearer "
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    return res
      .status(401)
      .json({ message: "No hay token, autorización denegada" });
  }

  jwt.verify(token, TOKEN_SCRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Token invalido" });
    }

    // Se asigna el token decodificado
    req.user = user;
    // No retorna nada, se indica que continue a la siguiente función
    next();
  });
};

export const verifyClient = async (req, res, next) => {
  if (req.user.role !== "Cliente") {
    return res
      .status(401)
      .json({ message: "Autorización denegada, no es un Cliente" });
  }

  next();
};

export const verifyAdministrator = async (req, res, next) => {
  console.log(req.user.role);
  if (req.user.role !== "Administrador" && req.user.role !== "Gerente") {
    return res
      .status(401)
      .json({ message: "Autorización denegada, no es un Administrador" });
  }

  next();
};

export const verifyManager = async (req, res, next) => {
  if (req.user.role !== "Gerente") {
    return res
      .status(401)
      .json({ message: "Autorización denegada, no es un Gerente" });
  }

  next();
};

// Verifica token de verificaciones
export const validateVerificationToken = (token) => {
  let idUser;
  jwt.verify(token, TOKEN_SCRET, (err, user) => {
    if (err) {
      throw new Error("Token invalido");
    }
    idUser = user.id_user;
  });

  return idUser;
};
