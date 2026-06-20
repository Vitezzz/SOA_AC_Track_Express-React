import { selectEspecialidad, selectEspecialidadById } from "../models/especialidad.js";

const getEspecialidad = async (req, res) => {
    try {
        const especialidades = await selectEspecialidad();

        if (especialidades.length === 0) {
            return res.status(400).json({ message: "No se encontraron especialidades" });
        }

        res.status(200).json(especialidades)

    } catch (error) {
        console.error("Error", error);
        res.status(500).json({ message: "Error del servidor"})
    }
}

const getEspecialidadById = async (req, res) => {
    try {
         const { id } = req.params;

         if(!id){
            return res.status(400).json({ message: "Id no encontrado"});
         }

         const especialidadId = await selectEspecialidadById(id);

         if(!especialidadId){
            return res.status(404).json({ message: "Id  de especialidad no encontrado"})
         }

         res.status(200).json(especialidadId)

    } catch (error) {
        console.error("Error", error);
        res.status(500).json({ message: "Error del servidor"})
    }
}

export { getEspecialidad, getEspecialidadById}