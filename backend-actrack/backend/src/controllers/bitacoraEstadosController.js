import {
    selectBitacoraEstados, selectBitacoraEstadosById,
    insertBitacoraEstados
} from "../models/bitacora_estados.js";

const getBitacoraEstados = async (req, res) => {
    try {

        const listaBitacoraEstados = await selectBitacoraEstados();

        if(!listaBitacoraEstados){
            return res.status(400).json({ message: "Listado de bitacora estados no encontrado"})
        }

        res.status(200).json(listaBitacoraEstados)
    } catch (error) {
        console.error("Error: ", error);
        res.status(500).json({ message: "Error del servidor" })
    }
}

const getBitacoraEstadosById = async (req, res) => {
    try {

        const { id } = req.params;

        if(!id){
            return res.status(400).json({ message: "Id no encontrado"})
        }

        const bitacoraEstadosId = await selectBitacoraEstadosById(id);

        if(!bitacoraEstadosId){
            return res.status(404).json({ message: "Id de bitacora estados no encontrado"});
        }

        res.status(200).json(bitacoraEstadosId)
    } catch (error) {
        console.error("Error: ", error);
        res.status(500).json({ message: "Error del servidor" })
    }
}

const postBitacoraEstados = async (req, res) => {
    try {

        const { ord_id, usu_id, estado_anterior, estado_nuevo } = req.body;

        if(!ord_id || !usu_id || !estado_nuevo){
            return res.status(400).json({ message: "Campos faltantes"})
        }

        const nuevoBitacoraEstado = await insertBitacoraEstados({ ord_id, usu_id, estado_anterior, estado_nuevo})

        res.status(201).json({
            id: nuevoBitacoraEstado.id,
            ord_id: nuevoBitacoraEstado.ord_id,
            usu_id: nuevoBitacoraEstado.usu_id,
            estado_anterior: nuevoBitacoraEstado.estado_anterior,
            estado_nuevo: nuevoBitacoraEstado.estado_nuevo
        })

    } catch (error) {
        console.error("Error: ", error);
        res.status(500).json({ message: "Error del servidor" })
    }
}

export { getBitacoraEstados, getBitacoraEstadosById, postBitacoraEstados}