import {
    selectChecklistEjecucion, insertChecklistEjecucion,
    updateChecklistEjecucion
} from "../models/checklistEjecucion.js";
import { selectChecklistPlantillasById } from "../models/checklistPlantillas.js";
import { selectChecklistItemsPlantillaById } from "../models/checklistItemsPlantilla.js";
import { selectOrdenesServicio, selectOrdenesServicioById } from "../models/ordenes_servicio.js";

// Exactamente uno de item_id (viene de la plantilla) o item_desc (ítem
// improvisado por el técnico, no está en la plantilla) debe venir -- espeja
// el CHECK constraint de la tabla, pero con un mensaje claro para el cliente.
const validarItemXorDesc = (item_id, item_desc) => {
    if (item_id != null && item_desc != null) return "Solo puedes enviar item_id o item_desc, no ambos";
    if (item_id == null && item_desc == null) return "Debes enviar item_id (ítem de la plantilla) o item_desc (ítem improvisado)";
    return null;
}

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

        const { che_id, ord_id, item_id, item_desc, completado = false, total, notas } = req.body

        if (!che_id || !ord_id) {
            return res.status(400).json({ message: "Campos faltantes" })
        }

        const errorItem = validarItemXorDesc(item_id, item_desc);
        if (errorItem) return res.status(400).json({ message: errorItem })

        const checklistPlantillaExiste = await selectChecklistPlantillasById(che_id);
        if (!checklistPlantillaExiste) return res.status(404).json({ message: 'Checklist plantilla no encontrado' })

        const ordenExiste = await selectOrdenesServicioById(ord_id);
        if (!ordenExiste) return res.status(404).json({ message: 'Orden no encontrada' })

        if (item_id != null) {
            const itemExiste = await selectChecklistItemsPlantillaById(item_id);
            if (!itemExiste) return res.status(404).json({ message: 'Item de plantilla no encontrado' })
        }

        const nuevoChecklistEjecucion = await insertChecklistEjecucion({ che_id, ord_id, item_id, item_desc, completado, total, notas })


        return res.status(201).json({
            id: nuevoChecklistEjecucion.id,
            che_id: nuevoChecklistEjecucion.che_id,
            ord_id: nuevoChecklistEjecucion.ord_id,
            item_id: nuevoChecklistEjecucion.item_id,
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
        const { che_id, ord_id, item_id, item_desc, completado, total, notas } = req.body

        if (!id) {
            return res.status(400).json({ message: "Id no encontrado" });
        }

        const errorItem = validarItemXorDesc(item_id, item_desc);
        if (errorItem) return res.status(400).json({ message: errorItem })

        const checklistPlantillaExiste = await selectChecklistPlantillasById(che_id);
        if (!checklistPlantillaExiste) return res.status(404).json({ message: 'Checklist plantilla no encontrado' })

        const ordenExiste = await selectOrdenesServicioById(ord_id);
        if (!ordenExiste) return res.status(404).json({ message: 'Orden no encontrada' })

        if (item_id != null) {
            const itemExiste = await selectChecklistItemsPlantillaById(item_id);
            if (!itemExiste) return res.status(404).json({ message: 'Item de plantilla no encontrado' })
        }

        const checklistEjecucionUpdt = await updateChecklistEjecucion(id, { che_id, ord_id, item_id, item_desc, completado, total, notas });

        if (!checklistEjecucionUpdt) {
            return res.status(404).json({ message: "Checklist ejecucion no encontrado" })
        }

        return res.status(200).json({
            id: checklistEjecucionUpdt.id,
            che_id: checklistEjecucionUpdt.che_id,
            ord_id: checklistEjecucionUpdt.ord_id,
            item_id: checklistEjecucionUpdt.item_id,
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