import {
    selectTecnicos, selectTecnicoById, insertTecnicos, updateTecnicos,
    deleteTecnicos
} from "../models/tecnicos.js";

const getTecnicos = async (req, res) => {
    try {
        const listaTecnicos = await selectTecnicos();

        if (listaTecnicos.length === 0) {
            return res.status(500).json({ message: "Lista de tecnicos no encontrada" })
        }

        res.status(200).json(listaTecnicos);
    } catch (error) {
        console.error("Error:", error)
        res.status(500).json({ message: "Error del servidor" })
    }
}

const getTecnicosById = async (req, res) => {
    try {

        const { id } = req.params;

        if (!id) {
            return res.status(500).json({ message: "Id no encontrado" })
        }

        const tecnicoId = await selectTecnicoById(id);

        if (!tecnicoId) {
            return res.status(404).json({ message: "Id no encontrado" })
        }

        res.status(200).json(tecnicoId)

    } catch (error) {
        console.error("Error:", error)
        res.status(500).json({ message: "Error del servidor" })
    }
}

const postTecnicos = async (req, res) => {
    try {

        const { usu_id, esp_id } = req.body;

        if (!usu_id || !esp_id) {
            return res.status(400).json({ message: "Campos faltantes " })
        }

        const nuevoTecnico = await insertTecnicos({ usu_id, esp_id });

        res.status(201).json({
            id: nuevoTecnico.id,
            usu_id: nuevoTecnico.usu_id,
            esp_id: nuevoTecnico.esp_id,
            disponible: nuevoTecnico.disponible
        })
    } catch (error) {
        console.error("Error:", error)
        res.status(500).json({ message: "Error del servidor" })
    }
}

const putTecnicos = async (req, res) => {
    try {

        const { id } = req.params;
        const { usu_id, esp_id, disponible } = req.body;
        if (!id) {
            return res.status(400).json({ message: "Id no encontrado" })
        }

        const updtTecnico = await updateTecnicos(id, { usu_id, esp_id, disponible });

        return res.status(200).json({
            id: updtTecnico.id,
            usu_id: updtTecnico.usu_id,
            esp_id: updtTecnico.esp_id,
            disponible: updtTecnico.disponible
        })
    } catch (error) {
        console.error("Error:", error)
        res.status(500).json({ message: "Error del servidor" })
    }
}

const dltTecnicos = async (req, res) => {
    try {

        const { id } = req.params;

        if(!id){
            return res.status(400).json({ message: "Id no encontrado"})
        }

        const tecnicoDelete = await deleteTecnicos(id);

        if(!tecnicoDelete){
            return res.status(404).json({ message: "Id de tecnico no encontrado"})
        }

        return res.status(200).json(tecnicoDelete)

    } catch (error) {
        console.error("Error:", error)
        res.status(500).json({ message: "Error del servidor" })
    }
}

export { getTecnicos, getTecnicosById, postTecnicos, putTecnicos, dltTecnicos}