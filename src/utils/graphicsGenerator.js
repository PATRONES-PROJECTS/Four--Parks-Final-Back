import { createCanvas } from "canvas";
import Chart from "chart.js/auto";

// Método para crear el gráfico de dispersión
export const createScatterChart = (data) => {
  // Crear un canvas para el gráfico
  const canvas = createCanvas(400, 400);
  const ctx = canvas.getContext("2d");

  // Configurar datos para el gráfico
  const labels = data.map((item) => item.hora);
  const values = data.map((item) => item.reservas);

  // Crear el gráfico con Chart.js
  new Chart(ctx, {
    type: "scatter",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Reservas por Hora",
          data: values,
          fill: false,
          backgroundColor: "rgba(204, 120, 255, 0.2)",
          borderColor: "rgb(156, 16, 241)",
          tension: 0.1,
        },
      ],
    },
    options: {
      scales: {
        x: {
          title: {
            display: true,
            text: "Hora",
          },
        },
        y: {
          title: {
            display: true,
            text: "Reservas",
          },
        },
      },
    },
  });

  // Convertir el canvas a una imagen en formato base64
  return canvas.toDataURL();
};

export const createBarChart = (data) => {
  // Crear un canvas para el gráfico
  const canvas = createCanvas(400, 400);
  const ctx = canvas.getContext("2d");

  // Configurar datos para el gráfico
  const labels = Object.keys(data);
  const values = Object.values(data);

  // Crear el gráfico con Chart.js
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Reservas",
          data: values,
          backgroundColor: "rgba(255, 227, 48, 0.2)",
          borderColor: "rgb(245, 226, 107)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Reservas",
          },
        },
        x: {
          title: {
            display: true,
            text: "Parqueadero",
          },
        },
      },
    },
  });

  // Convertir el canvas a una imagen en formato base64
  return canvas.toDataURL();
};

export const createPieChart = (data) => {
  // Crear un canvas para el gráfico
  const canvas = createCanvas(600, 400); // Aumenta el ancho para dejar espacio para la información al lado del gráfico
  const ctx = canvas.getContext("2d");

  // Configurar datos para el gráfico
  const labels = Object.keys(data);
  const values = Object.values(data);
  const total = values.reduce((a, b) => a + b, 0);

  // Crear el gráfico con Chart.js
  new Chart(ctx, {
    type: "pie",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Reservas",
          data: values,
          backgroundColor: [
            "rgba(255, 99, 132, 0.2)",
            "rgba(54, 162, 235, 0.2)",
            "rgba(255, 206, 86, 0.2)",
            "rgba(75, 192, 192, 0.2)",
            "rgba(153, 102, 255, 0.2)",
            "rgba(255, 159, 64, 0.2)",
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(153, 102, 255, 1)",
            "rgba(255, 159, 64, 1)",
          ],
          borderWidth: 1,
        },
      ],
    },
  });

  // Dibujar etiquetas de datos manualmente al lado derecho del gráfico
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)"; // Color gris para las etiquetas
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  ctx.font = "14px Arial";

  const startX = 500; // Posición inicial de la información al lado del gráfico
  const offsetY = (canvas.height - values.length * 20) / 2; // Posición vertical centralizada

  values.forEach((value, index) => {
    const percentage = (value / total) * 100;
    const label = `${labels[index]}: ${value} COP`;
    const textWidth = ctx.measureText(label).width;
    ctx.fillText(label, startX - textWidth - 10, offsetY + index * 20); // Ajuste de la posición
  });

  // Convertir el canvas a una imagen en formato base64
  return canvas.toDataURL();
};

export const createLineChart = (data) => {
  // Crear un canvas para el gráfico
  const canvas = createCanvas(400, 400);
  const ctx = canvas.getContext("2d");

  // Configurar datos para el gráfico
  const labels = Object.keys(data);
  const values = Object.values(data);

  // Crear el gráfico con Chart.js
  new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: "Ganancias",
        data: values,
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgb(75, 192, 192)",
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Ganancias"
          }
        },
        x: {
          title: {
            display: true,
            text: "Día de la Semana"
          }
        }
      }
    }
  });

  // Convertir el canvas a una imagen en formato base64
  return canvas.toDataURL();
};
