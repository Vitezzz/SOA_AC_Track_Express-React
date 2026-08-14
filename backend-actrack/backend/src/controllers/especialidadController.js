import {
    selectEspecialidad,
    selectEspecialidadById,
    selectEspecialidadByNombre,
    insertEspecialidad,
    updateEspecialidad,
    deleteEspecialidad
} from "../models/especialidad.js";

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

const crearEspecialidad = async (req, res) => {
    try {
        const { nombre } = req.body;

        if (!nombre) {
            return res.status(400).json({ message: "Dato faltante" })
        }

        const especialidadExiste = await selectEspecialidadByNombre(nombre);
        if (especialidadExiste) return res.status(400).json({ message: 'Ya existe una especialidad con ese nombre' });

        const nuevaEspecialidad = await insertEspecialidad({ nombre });

        res.status(201).json(nuevaEspecialidad);
    } catch (error) {
        console.error("Error", error);
        res.status(500).json({ message: "Error del servidor" })
    }
}

const putEspecialidad = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Id no encontrado" })
        }

        const { nombre } = req.body;
        if (!nombre) {
            return res.status(400).json({ message: "Dato faltante" })
        }

        const especialidadActualizada = await updateEspecialidad(id, { nombre });
        if (!especialidadActualizada) {
            return res.status(404).json({ message: "Id de especialidad no encontrado" })
        }

        res.status(200).json(especialidadActualizada);
    } catch (error) {
        console.error("Error", error);
        res.status(500).json({ message: "Error del servidor" })
    }
}

const especialidadDelete = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Id no encontrado" })
        }

        const especialidadEliminada = await deleteEspecialidad(id);
        if (!especialidadEliminada) {
            return res.status(404).json({ message: "Id de especialidad no encontrado" })
        }

        res.status(200).json(especialidadEliminada);
    } catch (error) {
        console.error("Error", error);
        res.status(500).json({ message: "Error del servidor" })
    }
}

export { getEspecialidad, getEspecialidadById, crearEspecialidad, putEspecialidad, especialidadDelete }