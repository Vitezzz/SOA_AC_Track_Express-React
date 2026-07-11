import {
    selectChecklistEjecucion, insertChecklistEjecucion,
    updateChecklistEjecucion
} from "../models/checklistEjecucion.js";
import { selectChecklistPlantillasById } from "../models/checklistPlantillas.js";
import { selectOrdenesServicio, selectOrdenesServicioById } from "../models/ordenes_servicio.js";

const getChecklistEjecucion = async (req, res) => {
    try {

        const { ordId } = req.params;

        if (!ordId) {
            return res.status(400).json({ message: "Ord_id no encontrado" })
        }

        const listaChecklistEjecucion = await selectChecklistEjecucion(ordId);

        return res.status(200).json(listaChecklistEjecucion);


    } catch (error) {
        console.error('Error: ', error);
        res.status(500).json({ message: "Error del servidor" })
    }
}

const postChecklistEjecucion = async (req, res) => {
    try {

        const { che_id, ord_id, item_desc, completado = false, total, notas } = req.body

        if (!che_id || !ord_id || !item_desc) {
            return res.status(400).json({ message: "Campos faltantes" })
        }

        const checklistPlantillaExiste = await selectChecklistPlantillasById(che_id);
        if (!checklistPlantillaExiste) return res.status(404).json({ message: 'Checklist plantilla no encontrado' })

        const ordenExiste = await selectOrdenesServicioById(ord_id);
        if (!ordenExiste) return res.status(404).json({ message: 'Orden no encontrada' })

        const nuevoChecklistEjecucion = await insertChecklistEjecucion({ che_id, ord_id, item_desc, completado, total, notas })


        return res.status(201).json({
            id: nuevoChecklistEjecucion.id,
            che_id: nuevoChecklistEjecucion.che_id,
            ord_id: nuevoChecklistEjecucion.ord_id,
            item_desc: nuevoChecklistEjecucion.item_desc,
            completado: nuevoChecklistEjecucion.completado,
            total: nuevoChecklistEjecucion.total,
            notas: nuevoChecklistEjecucion.notas
        })
    } catch (error) {
        console.error('Error: ', error);
        res.status(500).json({ message: "Error del servidor" })
    }
}

const putChecklistEjecucion = async (req, res) => {
    try {
        const { id } = req.params;
        const { che_id, ord_id, item_desc, completado, total, notas } = req.body

        if (!id) {
            return res.status(400).json({ message: "Id no encontrado" });
        }

        const checklistPlantillaExiste = await selectChecklistPlantillasById(che_id);
        if (!checklistPlantillaExiste) return res.status(404).json({ message: 'Checklist plantilla no encontrado' })

        const ordenExiste = await selectOrdenesServicioById(ord_id);
        if (!ordenExiste) return res.status(404).json({ message: 'Orden no encontrada' })

        const checklistEjecucionUpdt = await updateChecklistEjecucion(id, { che_id, ord_id, item_desc, completado, total, notas });

        if (!checklistEjecucionUpdt) {
            return res.status(404).json({ message: "Checklist ejecucion no encontrado" })
        }

        return res.status(200).json({
            id: checklistEjecucionUpdt.id,
            che_id: checklistEjecucionUpdt.che_id,
            ord_id: checklistEjecucionUpdt.ord_id,
            item_desc: checklistEjecucionUpdt.item_desc,
            completado: checklistEjecucionUpdt.completado,
            total: checklistEjecucionUpdt.total,
            notas: checklistEjecucionUpdt.notas
        })

    } catch (error) {
        console.error('Error: ', error);
        res.status(500).json({ message: "Error del servidor" })
    }
}

export { getChecklistEjecucion, postChecklistEjecucion, putChecklistEjecucion }