import {
    selectBitacoraEstados, selectBitacoraEstadosById,
    insertBitacoraEstados, selectBitacoraPorOrden
} from "../models/bitacora_estados.js";
import { selectOrdenesServicioById } from "../models/ordenes_servicio.js";
import { findUserById } from "../models/usuarios.js";
import { getClienteIdByUserId } from "../utils/lookupUtils.js";

const getBitacoraEstados = async (req, res) => {
    try {

        const listaBitacoraEstados = await selectBitacoraEstados();

        if (!listaBitacoraEstados) {
            return res.status(400).json({ message: "Listado de bitacora estados no encontrado" })
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

        if (!id) {
            return res.status(400).json({ message: "Id no encontrado" })
        }

        const bitacoraEstadosId = await selectBitacoraEstadosById(id);

        if (!bitacoraEstadosId) {
            return res.status(404).json({ message: "Id de bitacora estados no encontrado" });
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

        if (!ord_id || !usu_id || !estado_nuevo) {
            return res.status(400).json({ message: "Campos faltantes" })
        }

        const ordenExiste = await selectOrdenesServicioById(ord_id);
        if (!ordenExiste) return res.status(400).json({ message: 'Orden no encontrada' });

        const usuarioExiste = await findUserById(usu_id);
        if (!usuarioExiste) return res.status(400).json({ message: 'Usuario no encontrado' })

        const nuevoBitacoraEstado = await insertBitacoraEstados({ ord_id, usu_id, estado_anterior, estado_nuevo })

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

const getBitacoraPorOrden = async (req, res) => {
    try {
        const { ord_id } = req.params;

        const orden = await selectOrdenesServicioById(ord_id);
        if (!orden) return res.status(404).json({ message: "Orden no encontrada" });

        // Si es cliente, solo puede ver la bitácora de SU PROPIA orden --
        // nunca la de otro cliente, aunque adivine el ord_id en la URL.
        if (req.user.rol_id === 3) {
            const cli_id = await getClienteIdByUserId(req.user.id);
            if (!cli_id || orden.cli_id !== cli_id) {
                return res.status(403).json({ message: "No tienes acceso a esta orden" });
            }
        }

        const historial = await selectBitacoraPorOrden(ord_id);
        res.status(200).json(historial);
    } catch (error) {
        console.error("Error: ", error);
        res.status(500).json({ message: "Error del servidor" });
    }
}

export { getBitacoraEstados, getBitacoraEstadosById, postBitacoraEstados, getBitacoraPorOrden }