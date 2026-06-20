import { selectPrioridad, selectPrioridadById } from "../models/prioridad.js";

const getPrioridad = async (req, res) => {
    try {
        const listaPrioridades = await  selectPrioridad();
        if (!listaPrioridades) {
            return res.status(500).json({ message: "Lista de prioridades no encontrada" })
        }
        res.status(200).json(listaPrioridades)
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error del servidor' })
    }
}

const getPrioridadById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "Id no encontado" })
        }

        const prioridadId =  await selectPrioridadById(id);

        if(!prioridadId){
            return res.status(404).json({ message: "Id de prioridad no encontrado" })
        };

        res.status(200).json(prioridadId)

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error del servidor' })
    }
}

export { getPrioridad, getPrioridadById };