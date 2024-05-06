export const validateSchema = (schema) => (req, res, next) => {

    try {
        // El parse es una función de Zod para validar
        schema.parse(req.body)
        next()
    } catch (error) {
        // El error es un diccionario de Zod
        return res.status(400).json(
            error.errors.map(error => error.message)
        )
    }

}