export const isTwentyFourService = (schedule) => {
  if (
    (schedule.initial_day === 1,
    schedule.final_day === 0,
    schedule.opening_time === 0,
    schedule.closing_time === 11)
  ) {
    return true;
  }
  return false;
};

export const checkTimeReservation = (reservation, schedule) => {
  // Miramos que la hora de entrada no sea mayor o igual
  if (
    reservation.entry_reservation_date >= reservation.departure_reservation_date
  )
    return false;

  const isRange = isRangeInRange(
    reservation.entry_reservation_date,
    reservation.departure_reservation_date,
    schedule.opening_time,
    schedule.closing_time
  );

  if (!isRange) return false;

  return true;
};

const isRangeInRange = (start1, end1, start2, end2) => {
  return start1 >= start2 && start1 <= end2 && end1 >= start2 && end1 <= end2;
};

export const checkDay = (reservationDate, schedule) => {
  // Convertir los días iniciales y finales al estándar de 0 a 6 (domingo a sábado)
  const startDay = schedule.initial_day === 0 ? 7 : schedule.initial_day;
  const endDay = schedule.final_day === 0 ? 7 : schedule.final_day;
  const reservationDay =
    reservationDate.getDay() === 0 ? 7 : reservationDate.getDay(); // Convertir el día de la reserva a formato de 0 a 6 (domingo a sábado)

  // Función para verificar si un día está dentro del rango
  const isDayInRange = (day, start, end) => {
    if (start <= end) {
      return day >= start && day <= end;
    } else {
      return day >= start || day <= end;
    }
  };

  // Verificar si el día de la reserva está dentro del rango
  return isDayInRange(reservationDay, startDay, endDay);
};

export const calculateHours = (date1, date2) => {
  const diffMili = Math.abs(date2 - date1);
  const diffHor = Math.floor(diffMili / (1000 * 60 * 60));
  return diffHor;
};

export const checkControllerReserve = (id, controllers) => {
  let foundController = null;

  controllers.forEach((controller) => {
    if (controller.id_vehicle_fk === id) {
      foundController = controller;
    }
  });

  return foundController;
};