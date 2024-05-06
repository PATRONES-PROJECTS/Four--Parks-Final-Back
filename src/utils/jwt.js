import { TOKEN_SCRET } from "../config.js";
import jwt from "jsonwebtoken";

export function createAccessToken(payload, time) {
  return new Promise((resolve, reject) => {
    // Creación del Token
    jwt.sign(
      payload,
      TOKEN_SCRET,
      {
        // Tiempo de expiración
        expiresIn: time,
      },
      (err, token) => {
        if (err) {
          reject(err);
        }
        resolve(token);
      }
    );
  });
}

