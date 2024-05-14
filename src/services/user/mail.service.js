import { gmail } from "../../conn.js";
import { getInvoiceService } from "../reservation/invoice.service.js";

export const sendMail = async (mail, user, url, type) => {
  let html;
  let subject;
  if (type === "Recovery") {
    html = recoveryMail(user, url);
    subject = "Recuperar contraseña en Four-Parks Colombia";
  } else if (type === "Welcome") {
    html = welcomeMail(user, url);
    subject = "¡Bienvenido a Four-Parks Colombia!";
  } else if (type === "Blocked") {
    html = userBlockedMail(user);
    subject = "¡Un Cliente ha sido Bloqueado!";
  } else if (type === "Invoice") {
    html = invoiceMail(user);
    subject = "Confirmación de reserva y factura";
  } else {
    throw new Error("Seleccione un tipo de correo valido");
  }

  const optionsMails = {
    from: "fourparkscolombia@gmail.com",
    to: mail,
    subject: subject,
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

const userBlockedMail = (user) => {
  return `<!DOCTYPE html>
  <html lang="es">
  <head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Usuario bloqueado por intentos fallidos de contraseña</title>
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
      background-color: #dc3545; /* Rojo */
      color: white;
      padding: 10px 20px;
      text-decoration: none;
      border-radius: 5px;
      transition: background-color 0.3s;
    }
    .btn:hover {
      background-color: #c82333; /* Rojo claro al pasar el mouse */
    }
  </style>
  </head>
  <body>
  <div class="container">
    <h1>Usuario bloqueado por intentos fallidos de contraseña</h1>
    <p>El usuario <strong>${user}</strong> ha sido bloqueado debido a múltiples intentos fallidos de inicio de sesión.</p>
    <p>Por favor, investiga la situación y toma las medidas necesarias.</p>
  </div>
  </body>
  </html>
  `;
};

const invoiceMail = (data) => {
  return `
  <!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Confirmación de reserva y factura</title>
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
  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
  }
  table, th, td {
    border: 1px solid #ccc;
  }
  th, td {
    padding: 10px;
    text-align: left;
  }
  .total {
    font-weight: bold;
    font-size: 18px;
  }
</style>
</head>
<body>
<div class="container">
  <h1>¡Reserva completada en Four Parks Colombia!</h1>
  <p>Estimado <strong>${data.userName}</strong>,</p>
  <p>Gracias por completar tu reserva en <strong>${data.parkingName}</strong>. A continuación, te enviamos la factura con los detalles de tu reserva:</p>
  <table>
    <tr>
      <th>Número de Factura</th>
      <td>${data.idInvoice}</td>
    </tr>
    <tr>
      <th>Fecha de reserva</th>
      <td>${data.reservationDate}</td>
    </tr>
    <tr>
      <th>Código de vehículo</th>
      <td>${data.vehicleCode}</td>
    </tr>
    <tr>
      <th>Método de pago</th>
      <td>${data.paymentMethod}</td>
    </tr>
    <tr>
      <th>Tiempo en minutos</th>
      <td>${data.time}</td>
    </tr>
    <tr>
      <th>Costo de reserva</th>
      <td>${data.reserveAmount} COP</td>
    </tr>
    <tr>
      <th>Costo de servicios</th>
      <td>${data.serviceAmount} COP</td>
    </tr>
    <tr>
      <th>Costo por tiempo extra</th>
      <td>${data.extraTimeAmount} COP</td>
    </tr>
    <tr>
      <th>Reembolso</th>
      <td>${data.refundAmount} COP</td>
    </tr>
    <tr class="total">
      <th>Total</th>
      <td>${data.totalAmount} COP</td>
    </tr>
  </table>
  <p>¡Esperamos que tu estancia en Four Parks Colombia haya sido satisfactoria!</p>
</div>
</body>
</html>
  `;
};

export const generateInvoiceMail = async (id) => {
  const invoiceUser = await getInvoiceService(id, "id_invoice");
  let dateInvoiceUser = new Date(invoiceUser.reservations.reservation_date);
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
  };
  dateInvoiceUser = dateInvoiceUser.toLocaleDateString("es-CO", options);
  const data = {
    idInvoice: invoiceUser.id_invoice,
    userName: invoiceUser.reservations.users.user_name,
    parkingName: invoiceUser.reservations.parkings.name,
    reservationDate: dateInvoiceUser,
    vehicleCode: invoiceUser.reservations.vehicle_code,
    paymentMethod: invoiceUser.payment_methods.name,
    reserveAmount: invoiceUser.reserve_amount,
    serviceAmount: invoiceUser.service_amount,
    extraTimeAmount: invoiceUser.extra_time_amount,
    refundAmount: invoiceUser.refund_amount,
    totalAmount: invoiceUser.total_amount,
    time: invoiceUser.time,
  };
  try {
    await sendMail(invoiceUser.reservations.users.mail, data, null, "Invoice");
  } catch (error) {
    throw new Error("No se pudo enviar el correo");
  }
};
