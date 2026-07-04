import {
    selectChecklistItemsPlantilla, selectChecklistItemsPlantillaById,
    insertChecklistItemsPlantilla, updateChecklistItemsPlantilla,
    deleteChecklistItemsPlantilla
} from "../models/checklistItemsPlantilla.js";
import { selectChecklistPlantillasById } from "../models/checklistPlantillas.js";

const getChecklistItemsPlantilla = async (req, res) => {
    try {
        const listaItemsPlantilla = await selectChecklistItemsPlantilla();
        if (listaItemsPlantilla.length === 0) {
            return res.status(400).json({ message: "No se encontro checklist items plantilla" })
        }
        res.status(200).json(listaItemsPlantilla);
    } catch (error) {
        console.error('Error : ', error);
        res.status(500).json({ message: "Error del servidor" })
    }
}

const getChecklistItemsPlantillaById = async (req, res) => {
    try {

        const { id } = req.params;

        if (!id) {
            return res.status(404).json({ message: "Id no encontrado" })
        }

        const checklistItemPlantillaId = await selectChecklistItemsPlantillaById(id);

        if (!checklistItemPlantillaId) {
            return res.status(404).json({ message: "Id de checklist item plantilla no encontrado" })
        }

        res.status(200).json(checklistItemPlantillaId)
    } catch (error) {
        console.error('Error: ', error)
        res.status(500).json({ message: "Error del servidor" })
    }
}

const postChecklistItemsPlantilla = async (req, res) => {
    try {

        const { che_id, descripcion, orden } = req.body;

        if (!che_id || !descripcion) {
            return res.status(400).json({ message: "Campos faltantes" });
        }

        const checklistPlantillaExiste = await selectChecklistPlantillasById(che_id);
        if (!checklistPlantillaExiste) return res.status(404).json({ message: "Error del servidor" });

        const nuevoChecklistItemPlantilla = await insertChecklistItemsPlantilla({ che_id, descripcion, orden });

        res.status(201).json({
            id: nuevoChecklistItemPlantilla.id,
            che_id: nuevoChecklistItemPlantilla.che_id,
            descripcion: nuevoChecklistItemPlantilla.descripcion,
            orden: nuevoChecklistItemPlantilla.orden
        })
    } catch (error) {
        console.error('Error: ', error)
        res.status(500).json({ message: "Error del servidor" })
    }
}

const putChecklistItemsPlantillaById = async (req, res) => {
    try {

        const { id } = req.params;

        const { che_id, descripcion, orden } = req.body

        if (!id) {
            return res.status(404).json({ message: "Id no encontrado" })
        }

        const checklistPlantillaExiste = await selectChecklistPlantillasById(che_id);
        if (!checklistPlantillaExiste) return res.status(404).json({ message: "Error del servidor" });


        const checklistItemPlantillaUpdt = await updateChecklistItemsPlantilla(id, { che_id, descripcion, orden });

        if (!checklistItemPlantillaUpdt) {
            return res.status(404).json({ message: "Checklist item plantilla no encontrado" });
        }

        res.status(200).json({
            id: checklistItemPlantillaUpdt.id,
            che_id: checklistItemPlantillaUpdt.che_id,
            descripcion: checklistItemPlantillaUpdt.descripcion,
            orden: checklistItemPlantillaUpdt.orden
        })

    } catch (error) {
        console.error('Error: ', error)
        res.status(500).json({ message: "Error del servidor" })
    }
}

const dltChecklistItemsPlantillaById = async (req, res) => {
    try {

        const { id } = req.params;

        if (!id) {
            return res.status(404).json({ message: "Id no encontrado" })
        }

        const checklistItemsPlantillaDlt = await deleteChecklistItemsPlantilla(id);

        if (!checklistItemsPlantillaDlt) {
            return res.status(404).json({ message: "Checklist Items Plantilla no encontrado" });
        }

        res.status(200).json(checklistItemsPlantillaDlt)

    } catch (error) {
        console.error('Error: ', error)
        res.status(500).json({ message: "Error del servidor" })
    }
}

export {
    getChecklistItemsPlantilla, getChecklistItemsPlantillaById, postChecklistItemsPlantilla,
    putChecklistItemsPlantillaById, dltChecklistItemsPlantillaById
}

