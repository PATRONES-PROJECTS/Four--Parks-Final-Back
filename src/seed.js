import { createTypesParkingService } from "./services/parking/typeParking.service.js";
import { createRolesService } from "./services/user/role.service.js";
import { createVehiclesService } from "./services/parking/vehicle.service.js";
import { createSchedulesService } from "./services/parking/schedule.service.js";
import { createCitiesService } from "./services/parking/city.service.js";
import { createUserSeedService } from "./services/user/user.service.js";
import { getRoleByNameService } from "./services/user/role.service.js";

import { dataManager } from "./config.js";
import { createUserControllerService } from "./services/user/authentication.service.js";
import { createPaymentMethodsService } from "./services/reservation/paymentMethod.service.js";

export const createDates = async () => {
  try {
    const roles = [
      { name: "Cliente", description: "Cliente de Four-Parks Colombia" },
      {
        name: "Administrador",
        description: "Administrador de un parqueadero de Four-Parks Colombia",
      },
      {
        name: "Gerente",
        description:
          "Gerente de Four-Parks Colombia, administrador de la plataforma",
      },
    ];
    await createRolesService(roles);

    const typeParking = [
      { name: "Cubierto" },
      { name: "Descubierto" },
      { name: "Semi-Cubierto" },
    ];
    await createTypesParkingService(typeParking);

    const vehicles = [
      { name: "Moto" },
      { name: "Carro" },
      { name: "Bicicleta" },
    ];
    await createVehiclesService(vehicles);

    const paymentMethods = [
      { name: "Tarjeta Personal" },
      { name: "Puntos de Fidelidad" },
      { name: "Otro Método de Pago" },
    ];
    await createPaymentMethodsService(paymentMethods);

    const schedules = [
      { initial_day: 1, final_day: 0, opening_time: 0, closing_time: 11 },
      { initial_day: 1, final_day: 5, opening_time: 7, closing_time: 22 },
      { initial_day: 1, final_day: 6, opening_time: 8, closing_time: 23 },
    ];
    await createSchedulesService(schedules);

    const cities = [
      { name: "Bogotá" },
      { name: "Medellín" },
      { name: "Cali" },
      { name: "Barranquilla" },
      { name: "Cartagena" },
      { name: "Bucaramanga" },
      { name: "Cúcuta" },
      { name: "Pereira" },
      { name: "Santa Marta" },
      { name: "Ibagué" },
      { name: "Manizales" },
      { name: "Villavicencio" },
      { name: "Neiva" },
      { name: "Armenia" },
      { name: "Popayán" },
      { name: "Sincelejo" },
      { name: "Pasto" },
      { name: "Montería" },
      { name: "Valledupar" },
      { name: "Tunja" },
      { name: "Riohacha" },
      { name: "Florencia" },
      { name: "Quibdó" },
      { name: "Yopal" },
      { name: "Leticia" },
      { name: "San Andrés" },
      { name: "Mocoa" },
    ];
    await createCitiesService(cities);

    const role = await getRoleByNameService("Gerente");
    const manager = {
      first_name: "Four-Parks",
      last_name: "Colombia",
      user_name: dataManager.user_name,
      mail: dataManager.mail,
      password: dataManager.password,
      identification_card: dataManager.identification_card,
      id_role_fk: role.id_role,
    };
    await createUserSeedService(manager);



    console.log("Seed data inserted correctly");
  } catch (error) {
    console.log(error.message);
    throw new Error(error.message);
  }
};
