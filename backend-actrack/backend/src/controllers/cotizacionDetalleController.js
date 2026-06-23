import {
    selectCotizacionDetalle, selectCotizacionDetalleId,
    insertCotizacionDetalle, updateCotizacionDetalle, deleteCotizacionDetalle
} from "../models/cotizacion_detalle.js";

const getCotizacionDetalle = async (req, res) => {
    try {
        const listaCotizacionDetalle = await selectCotizacionDetalle();

        if (listaCotizacionDetalle.length === 0) {
            return res.status(404).json({ message: "No se encontro lista cotizacion detalle" })
        }

        res.status(200).json(listaCotizacionDetalle)
    } catch (error) {
        console.error('Error: ', error)
        res.status(500).json({ message: "Error de servidor" })
    }
}

const getCotizacionDetalleById = async (req, res) => {
    try {

        const { id } = req.params;

        if (!id) {
            return res.status(404).json({ message: "Id no encontrado" })
        }

        const cotizacionDetalleId = await selectCotizacionDetalleId(id);

        if (!cotizacionDetalleId) {
            return res.status(404).json({ message: "Id de cotizacion detalle no encontrado" })
        }

        res.status(200).json(cotizacionDetalleId);

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: "Error del servidor" })
    }
}

const postCotizacionDetalleById = async (req, res) => {
    try {

        const { inv_id, cot_id, cantidad, precio_unitario, es_mano_obra } = req.body;

        if (!inv_id || !cot_id || !cantidad || !precio_unitario ) {
            return res.status(400).json({ message: "Faltan campos" })
        }

        const nuevaCotizacionDetalle = await insertCotizacionDetalle({ inv_id, cot_id, cantidad, precio_unitario, es_mano_obra });

        res.status(201).json({
            id: nuevaCotizacionDetalle.id,
            inv_id: nuevaCotizacionDetalle.inv_id,
            cot_id: nuevaCotizacionDetalle.cot_id,
            cantidad: nuevaCotizacionDetalle.cantidad,
            precio_unitario: nuevaCotizacionDetalle.precio_unitario,
            subtotal: nuevaCotizacionDetalle.subtotal,
            es_mano_obra: nuevaCotizacionDetalle.es_mano_obra
        })

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: "Error del servidor" })
    }
}

const putCotizacionDetalleById = async (req, res) => {
    try {

        const { id } = req.params;
        const { inv_id, cot_id, cantidad, precio_unitario, es_mano_obra } = req.body;

        if (!id) {
            return res.status(400).json({ message: "Id no encontrado" })
        }

        const cotizacionDetalleUpdt = await updateCotizacionDetalle(id, { inv_id, cot_id, cantidad, precio_unitario, es_mano_obra })

        if(!cotizacionDetalleUpdt){
            return res.status(404).json({ message: "Id de cotizacion detalle no encontrado"})
        }

        res.status(200).json({
            id: cotizacionDetalleUpdt.id,
            inv_id: cotizacionDetalleUpdt.inv_id,
            cot_id: cotizacionDetalleUpdt.cot_id,
            cantidad: cotizacionDetalleUpdt.cantidad,
            precio_unitario: cotizacionDetalleUpdt.precio_unitario,
            subtotal: cotizacionDetalleUpdt.subtotal,
            es_mano_obra: cotizacionDetalleUpdt.es_mano_obra
        })

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: "Error del servidor" })
    }
}

const dltCotizacionDetalle = async (req, res) => {
    try {

        const { id } = req.params;

        if(!id){
            return res.status(400).json({ message: "Id no encontrado"})
        }

        const cotizacionDetalleDlt = await deleteCotizacionDetalle(id);

        if(!cotizacionDetalleDlt){
            return res.status(404).json({ message: "Id de cotizacion detalle no encontrado"})
        }

        res.status(200).json(cotizacionDetalleDlt)
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: "Error del servidor" })
    }
}

export { getCotizacionDetalle, getCotizacionDetalleById, postCotizacionDetalleById, putCotizacionDetalleById, dltCotizacionDetalle}