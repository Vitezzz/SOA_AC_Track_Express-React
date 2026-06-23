import {
    selectChecklistPlantillas, selectChecklistPlantillasById,
    insertChecklistPlantillas, updateChecklistPlantillas, deleteChecklistPlantillas
} from "../models/checklistPlantillas.js";

const getChecklistPlantillas = async (req, res) => {
    try {

        const listaChecklistPlantillas = await selectChecklistPlantillas();

        if (listaChecklistPlantillas.length === 0) {
            return res.status(400).json({ message: "No se encontro lista checklist plantillas" })
        }

        res.status(200).json(listaChecklistPlantillas);

    } catch (error) {
        console.error('Error', error);
        return res.status(500).json({ message: 'Error del servidor' })
    }
}

const getChecklistPlantillasById = async (req, res) => {
    try {

        const { id } = req.params;

        if (!id) {
            return res.status(404).json({ message: "Id no encontrado" })
        }

        const checklistPlantillaId = await selectChecklistPlantillasById(id);

        if (!checklistPlantillaId) {
            return res.status(404).json({ message: "Id de checklist plantilla no encontrado" })
        }

        res.status(200).json(checklistPlantillaId)
    } catch (error) {
        console.error('Error', error);
        return res.status(500).json({ message: 'Error del servidor' })
    }
}

const postChecklistPlantillas = async (req, res) => {
    try {

        const { cat_id, nombre, activo = true } = req.body;

        if (!nombre) {
            return res.status(400).json({ message: "CAmpo faltante nombre" })
        }

        const nuevoChecklistPlantillas = await insertChecklistPlantillas({ cat_id, nombre, activo });

        res.status(201).json({
            id: nuevoChecklistPlantillas.id,
            cat_id: nuevoChecklistPlantillas.cat_id,
            nombre: nuevoChecklistPlantillas.nombre,
            activo: nuevoChecklistPlantillas.activo
        })


    } catch (error) {
        console.error('Error', error);
        return res.status(500).json({ message: 'Error del servidor' })
    }
}

const putChecklistPlantillas = async (req, res) => {
    try {

        const { id } = req.params;
        const { cat_id, nombre, activo } = req.body 
    
        if(!id){
            return res.status(404).json({ message: "Id no encontrado"})
        }

        const checklistPlantillaUpdt = await updateChecklistPlantillas(id, { cat_id, nombre, activo });

        if(!checklistPlantillaUpdt){
            return res.status(404).json({ message: "Checklist Plantilla no encontrado"});
        }

        res.status(200).json({
            id: checklistPlantillaUpdt.id,
            cat_id : checklistPlantillaUpdt.cat_id,
            nombre: checklistPlantillaUpdt.nombre,
            activo: checklistPlantillaUpdt.activo
        })


    } catch (error) {
        console.error('Error', error);
        return res.status(500).json({ message: 'Error del servidor' })
    }
}

const dltChecklistPlantillas = async (req, res) => {
    try {

        const { id } = req.params;

        if(!id){
            return res.status(404).json({ message: "Id no encontrado"})
        }

        const checklistPlantillaDlt = await deleteChecklistPlantillas(id);

        if(!checklistPlantillaDlt){
            return res.status(404).json({ message: "Id de checklist plantilla no encontrado"})
        }

        res.status(200).json(checklistPlantillaDlt);

    } catch (error) {
        console.error('Error', error);
        return res.status(500).json({ message: 'Error del servidor' })
    }
}

export { getChecklistPlantillas, getChecklistPlantillasById, postChecklistPlantillas,
    putChecklistPlantillas, dltChecklistPlantillas
};