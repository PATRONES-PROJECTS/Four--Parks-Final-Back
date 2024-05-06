import { gmail } from "../../conn.js";

export const sendMail = async (mail, user, url, type) => {
  let html;
  if (type === "Recovery") html = recoveryMail(user, url);
  else if (type === "Welcome") html = welcomeMail(user, url);
  else throw new Error("Seleccione un tipo de correo valido")

  const optionsMails = {
    from: "fourparkscolombia@gmail.com",
    to: mail,
    subject: "¡Bienvenido a Four-Parks Colombia!",
    html,
  };


  gmail.sendMail(optionsMails);
};

const recoveryMail = (user, url) => {
  return `
<!DOCTYPE html>
  <html lang="es">
  <head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenido a Four-Parks Colombia</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f0f0f0;
      padding: 20px;
      text-align: center;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #fff;
      padding: 40px;
      border-radius: 10px;
      box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
    }
    h1 {
      color: #333;
      margin-bottom: 20px;
    }
    p {
      color: #666;
      margin-bottom: 20px;
    }
    .btn {
      display: inline-block;
      background-color: #ffc107; /* Amarillo */
      color: white;
      padding: 10px 20px;
      text-decoration: none;
      border-radius: 5px;
      transition: background-color 0.3s;
    }
    .btn:hover {
      background-color: #ffca28; /* Amarillo claro al pasar el mouse */
    }
  </style>
  </head>
  <body>
  <div class="container">
    <h1>Recuperar contraseña en Four-Parks Colombia</h1>
    <p>Supimos <strong>${user}</strong> que necesitas ayuda para recuperar tu contraseña.</p>
    <p>¡No te preocupes!, el siguiente enlace te ayuda fácilmente.</p>
    <p>Una vez que ingreses, podrás cambiar la contraseña.🥳🥳🥳🥳</p>
    <a href=${url} class="btn">Ingresar</a>
  </div>
  </body>
  </html>    
  `;
};

const welcomeMail = (user, url) => {
  return `
  <!DOCTYPE html>
  <html lang="es">
  <head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenido a Four-Parks Colombia</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f0f0f0;
      padding: 20px;
      text-align: center;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #fff;
      padding: 40px;
      border-radius: 10px;
      box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
    }
    h1 {
      color: #333;
      margin-bottom: 20px;
    }
    p {
      color: #666;
      margin-bottom: 20px;
    }
    .btn {
      display: inline-block;
      background-color: #ffc107; /* Amarillo */
      color: white;
      padding: 10px 20px;
      text-decoration: none;
      border-radius: 5px;
      transition: background-color 0.3s;
    }
    .btn:hover {
      background-color: #ffca28; /* Amarillo claro al pasar el mouse */
    }
  </style>
  </head>
  <body>
  <div class="container">
    <h1>¡Bienvenido ${user} a Four-Parks Colombia!</h1>
    <p>Estamos emocionados de que estés aquí con nosotros.</p>
    <p>Para continuar hacia nuestra página y disfrutar de nuestros servicios, por favor verifica tu cuenta con el botón <strong>Verificar</strong>.</p>
    <p>¡Gracias de nuevo y disfruta de nuestros servicios! 🥳🥳🚗🏍️</p>
    <a href=${url} class="btn">Verificar</a>
  </div>
  </body>
  </html>    
  `;
};
