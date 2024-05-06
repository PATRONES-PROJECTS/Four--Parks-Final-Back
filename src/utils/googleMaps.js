import { GOOGLE_SECRET_KEY } from "../config.js";
import { Router } from "express";

let API_KEY = GOOGLE_SECRET_KEY;
let BASE_URL = "https://maps.googleapis.com/maps/api/geocode/json";

export const getDirecctionByGeo = async (lat, lon) => {
  try {
    const url = `${BASE_URL}?latlng=${lat},${lon}&key=${API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "OK") {
      const addressComponents = data.results[0].address_components;
      const cityName = addressComponents.find((component) =>
        component.types.includes("locality")
      ).long_name;
      const address = data.results[0].formatted_address;
      return { city: cityName, address: address };
    } else {
      throw new Error("No se pudo encontrar la dirección.");
    }
  } catch (error) {
    console.error("Error al realizar la solicitud:", error);
    return null;
  }
};

export const getGeoByText = async (address) => {
  try {
    const url = `${BASE_URL}?address=${encodeURIComponent(
      address
    )}&key=${API_KEY}`;
    console.log(url);

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "OK") {
      const addressComponents = data.results[0].address_components;
      const location = data.results[0].geometry.location;
      addressComponents.find((component) =>
        component.types.includes("locality")
      ).long_name;
      return { lat: location.lat, lon: location.lng };
    } else {
      throw new Error("No se pudo encontrar la dirección.");
    }
  } catch (error) {
    console.error("Error al realizar la solicitud:", error);
    throw new Error("No se pudo encontrar la dirección.");
  }
};

const router = Router();

router.get("/address", async (req, res) => {
  const { lat } = req.body;
  const { lon } = req.body;
  try {
    const address = await getDirecctionByGeo(lat, lon);
    res.json(address);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/geo", async (req, res) => {
  const { address } = req.body;
  try {
    const geo = await getGeoByText(address);
    res.json(geo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
