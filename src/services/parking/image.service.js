import { v2 as cloudinary } from "cloudinary";
import fs from "fs"; // Importa el módulo fs para trabajar con el sistema de archivos

export const loadImage = async (req) => {
  try {
    // Verifica si se han cargado archivos y si el archivo es una imagen
    if (
      !req.files ||
      !req.files[0] ||
      !req.files[0].mimetype ||
      !req.files[0].mimetype.startsWith("image/")
    ) {
      throw new Error("El archivo no es una imagen");
    }

    // Verificar que no existe una imagen con ese name
    const result = await cloudinary.api.resources({
      type: "upload",
    });

    // Filtrar las imágenes para encontrar la coincidencia exacta
    const verifyImageExistence = result.resources.some(
      (resource) => resource.public_id === req.body.name
    );

    if (verifyImageExistence) {
      throw new Error("Ya existe una imagen con ese nombre");
    }

    // Cargar la imagen en Cloudinary
    const resultCloudinary = await cloudinary.uploader.upload(
      req.files[0].path,
      {
        public_id: req.body.name,
      }
    );

    // Guardar la URL de la imagen de Cloudinary en req para que pueda ser utilizada en el controlador
    req.body.imageURL = resultCloudinary.secure_url;
  } catch (error) {
    console.error("Error al cargar imagen a Cloudinary:", error);
    throw error; // Pasar el error al siguiente middleware de manejo de errores
  } finally {
    // Eliminar la imagen de la carpeta temporal después de cargarla en Cloudinary
    if (req.files && req.files[0]) {
      fs.unlink(req.files[0].path, (err) => {
        if (err) {
          console.error(
            "Error al eliminar la imagen de la carpeta temporal:",
            err
          );
        }
      });
    }
  }
};

export const loadImageWithURL = async (req) => {
  try {
    // Verificar que no existe una imagen con ese name
    const result = await cloudinary.api.resources({
      type: "upload",
    });

    // Filtrar las imágenes para encontrar la coincidencia exacta
    const verifyImageExistence = result.resources.some(
      (resource) => resource.public_id === req.body.name
    );

    if (verifyImageExistence) {
      // Guardar la URL de la imagen de Cloudinary en req para que pueda ser utilizada en el controlador
      req.body.imageURL = req.body.image_path;
    } else {
      const resultCloudinary = await cloudinary.uploader.upload(
        req.body.image_path,
        {
          public_id: req.body.name,
        }
      );

      req.body.name = req.body.oldName;
      await deleteImage(req);
      // Guardar la URL de la imagen de Cloudinary en req para que pueda ser utilizada en el controlador
      req.body.imageURL = resultCloudinary.secure_url;
    }
  } catch (error) {
    console.error("Error al cargar imagen a Cloudinary:", error);
    throw error; // Pasar el error al siguiente middleware de manejo de errores
  }
};

// En caso que posteriormente se implemente eliminar parqueadero
export const deleteImage = async (req) => {
  try {
    // Eliminar la imagen de Cloudinary
    await cloudinary.uploader.destroy(req.body.name);
  } catch (error) {
    console.error("Error al eliminar la imagen de Cloudinary:", error);
    throw new Error("Error al eliminar la imagen"); // Pasar el error al siguiente middleware de manejo de errores
  }
};
