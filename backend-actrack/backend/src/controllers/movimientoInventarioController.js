import {
    selectAllMovimientosInventario, selectMovimientosInventarioId,
    insertMovimientosInventario, updateMovimientosInventario, deleteMovimientosInventario
} from "../models/movimientos_inventario.js";
import { selectInventarioId, updateInventarioStock } from '../models/inventario.js';
import { selectTipoMovimientoInventarioById } from "../models/tipos_movimiento_inventario.js";
import { selectOrdenesServicioById } from "../models/ordenes_servicio.js";
import { findUserById } from "../models/usuarios.js";

const getMovimientosInventario = async (req, res) => {
    try {
        const listaMovimientosInventario = await selectAllMovimientosInventario();
        if (!listaMovimientosInventario) {
            return res.status(400).json({ message: "No se encontraron movimientos de inventario" })
        }
        res.status(200).json(listaMovimientosInventario);
    } catch (error) {
        console.error('Error: ', error)
        res.status(500).json({ message: "Error del servidor" });
    }
}

const getMovimientosInventarioId = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "Id no encontrado" })
        }

        const idMovimientosInventario = await selectMovimientosInventarioId(id);

        if (!idMovimientosInventario) {
            return res.status(400).json({ message: "No se encontro el id de este movimiento de inventario" })
        }

        res.status(200).json(idMovimientosInventario);
    } catch (error) {
        console.error('Error: ', error)
        res.status(500).json({ message: "Error del servidor" });
    }
}

const postMovimientosInventario = async (req, res) => {
    try {
        const { inv_id, ord_id, usu_id, tip_id, cantidad } = req.body;

        if (!inv_id || !ord_id || !usu_id || !tip_id || !cantidad) {
            return res.status(400).json({ message: "Campos faltantes" })
        }

        const ordenesServicioExiste = await selectOrdenesServicioById(ord_id);
        if (!ordenesServicioExiste) return res.status(404).json({ message: 'Orden servicio no encontrada' });

        const usuarioExiste = await findUserById(usu_id)
        if (!usuarioExiste) return res.status(404).json({ message: 'Usuario no encontrado' })

        const tipoMov = await selectTipoMovimientoInventarioById(tip_id);
        if (!tipoMov) return res.status(404).json({ message: 'Tipo de movimiento no encontrado' })

        const item = await selectInventarioId(inv_id);
        if (!item) return res.status(404).json({ message: 'Item no encontrado' });

        if (tipoMov.nombre === "Salida" && item.stock_actual < cantidad) {
            return res.status(400).json({ message: "Stock insuficiente" })
        }

        const nuevoMovimientoInventario = await insertMovimientosInventario({ inv_id, ord_id, usu_id, tip_id, cantidad });

        const nuevoStock = tipoMov.nombre === 'Entrada'
            ? Number(item.stock_actual) + Number(cantidad)
            : Number(item.stock_actual) - Number(cantidad)

        await updateInventarioStock(inv_id, nuevoStock);

        res.status(201).json({
            id: nuevoMovimientoInventario.id,
            inv_id: nuevoMovimientoInventario.inv_id,
            ord_id: nuevoMovimientoInventario.ord_id,
            usu_id: nuevoMovimientoInventario.usu_id,
            tip_id: nuevoMovimientoInventario.tip_id,
            cantidad: nuevoMovimientoInventario.cantidad
        })
    } catch (error) {
        console.error('Error: ', error)
        res.status(500).json({ message: "Error del servidor" });
    }
}

const putMovimientosInventario = async (req, res) => {
    try {

        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "Id no encontrado" })
        }

        const { inv_id, ord_id, usu_id, tip_id, cantidad } = req.body;

        const ordenesServicioExiste = await selectOrdenesServicioById(ord_id);
        if (!ordenesServicioExiste) return res.status(404).json({ message: 'Orden servicio no encontrada' });

        const usuarioExiste = await findUserById(usu_id)
        if (!usuarioExiste) return res.status(404).json({ message: 'Usuario no encontrado' })

        const tipoMov = await selectTipoMovimientoInventarioById(tip_id);
        if (!tipoMov) return res.status(404).json({ message: 'Tipo de movimiento no encontrado' })

        const item = await selectInventarioId(inv_id);
        if (!item) return res.status(404).json({ message: 'Item no encontrado' });


        const updtMovimientosInventario = await updateMovimientosInventario(id, { inv_id, ord_id, usu_id, tip_id, cantidad });

        res.status(200).json({
            id: updtMovimientosInventario.id,
            inv_id: updtMovimientosInventario.inv_id,
            ord_id: updtMovimientosInventario.ord_id,
            usu_id: updtMovimientosInventario.usu_id,
            tip_id: updtMovimientosInventario.tip_id,
            cantidad: updtMovimientosInventario.cantidad
        })
    } catch (error) {
        console.error('Error: ', error)
        res.status(500).json({ message: "Error del servidor" });
    }
}

const dltMovimientosInventario = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: 'Id no encontrado' })
        }

        const delMovimientosInventario = await deleteMovimientosInventario(id);

        if (!delMovimientosInventario) {
            return res.status(400).json({ message: "no se encontro id del movimiento de inventario" })
        }

        res.status(200).json(delMovimientosInventario);
    } catch (error) {
        console.error('Error: ', error)
        res.status(500).json({ message: "Error del servidor" });
    }
}

export { getMovimientosInventario, getMovimientosInventarioId, postMovimientosInventario, putMovimientosInventario, dltMovimientosInventario }