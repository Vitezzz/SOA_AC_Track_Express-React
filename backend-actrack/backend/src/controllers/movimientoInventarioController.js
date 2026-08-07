import pool from '../config/database.js';
import {
    selectAllMovimientosInventario, selectMovimientosInventarioId,
    updateMovimientosInventario, deleteMovimientosInventario
} from "../models/movimientos_inventario.js";
import { selectInventarioId } from '../models/inventario.js';
import { selectTipoMovimientoInventarioById } from "../models/tipos_movimiento_inventario.js";
import { selectOrdenesServicioById } from "../models/ordenes_servicio.js";
import { findUserById } from "../models/usuarios.js";
import { getTecnicoIdByUserId } from '../utils/lookupUtils.js';
import {
    selectInventarioVehiculoPorTecnicoYArticulo, upsertInventarioVehiculo, descontarInventarioVehiculo
} from '../models/inventario_vehiculo.js';

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

        // ord_id ya NO es obligatorio -- hay movimientos (entradas de
        // compra, ajustes de conteo) que no están ligados a ninguna orden.
        if (!inv_id || !usu_id || !tip_id || !cantidad) {
            return res.status(400).json({ message: "Campos faltantes" })
        }

        if (ord_id) {
            const ordenesServicioExiste = await selectOrdenesServicioById(ord_id);
            if (!ordenesServicioExiste) return res.status(404).json({ message: 'Orden servicio no encontrada' });
        }

        const usuarioExiste = await findUserById(usu_id)
        if (!usuarioExiste) return res.status(404).json({ message: 'Usuario no encontrado' })

        const tipoMov = await selectTipoMovimientoInventarioById(tip_id);
        if (!tipoMov) return res.status(404).json({ message: 'Tipo de movimiento no encontrado' })

        const item = await selectInventarioId(inv_id);
        if (!item) return res.status(404).json({ message: 'Item no encontrado' });

        // Si quien registra el movimiento es un técnico, el material sale
        // de SU vehículo, no del almacén general -- el almacén ya se
        // descontó cuando se le transfirió (ver
        // inventarioVehiculoController.transferirAVehiculo). Sin esto,
        // una "salida" de campo descontaba el almacén otra vez y nunca
        // bajaba lo que el técnico trae en la camioneta.
        const tecId = usuarioExiste.rol_id === 4 ? await getTecnicoIdByUserId(usu_id) : null;

        // Ya no comparamos el nombre del tipo -- cada tipo declara su
        // propia dirección con "es_entrada", así funciona sin importar
        // cuántos tipos nuevos agregues después (Ajustes, Devoluciones, etc.)
        if (!tipoMov.es_entrada) {
            if (tecId) {
                const stockVehiculo = await selectInventarioVehiculoPorTecnicoYArticulo(tecId, inv_id);
                if (!stockVehiculo || Number(stockVehiculo.cantidad) < Number(cantidad)) {
                    return res.status(400).json({
                        message: `No tienes esa cantidad disponible en tu vehículo (disponible: ${stockVehiculo?.cantidad || 0})`
                    });
                }
            } else if (Number(item.stock_actual) < Number(cantidad)) {
                return res.status(400).json({ message: "Stock insuficiente" })
            }
        }

        const client = await pool.connect();
        let nuevoMovimientoInventario;
        try {
            await client.query('BEGIN');

            const resultadoInsert = await client.query(
                `INSERT INTO movimientos_inventario (inv_id, ord_id, usu_id, tip_id, cantidad) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
                [inv_id, ord_id || null, usu_id, tip_id, cantidad]
            );
            nuevoMovimientoInventario = resultadoInsert.rows[0];

            if (tecId) {
                if (tipoMov.es_entrada) {
                    await upsertInventarioVehiculo(client, inv_id, tecId, cantidad);
                } else {
                    await descontarInventarioVehiculo(client, tecId, inv_id, cantidad);
                }
            } else {
                const nuevoStock = tipoMov.es_entrada
                    ? Number(item.stock_actual) + Number(cantidad)
                    : Number(item.stock_actual) - Number(cantidad)
                await client.query(`UPDATE inventario SET stock_actual = $1 WHERE id = $2`, [nuevoStock, inv_id]);
            }

            await client.query('COMMIT');
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }

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

        if (ord_id) {
            const ordenesServicioExiste = await selectOrdenesServicioById(ord_id);
            if (!ordenesServicioExiste) return res.status(404).json({ message: 'Orden servicio no encontrada' });
        }

        const usuarioExiste = await findUserById(usu_id)
        if (!usuarioExiste) return res.status(404).json({ message: 'Usuario no encontrado' })

        const tipoMov = await selectTipoMovimientoInventarioById(tip_id);
        if (!tipoMov) return res.status(404).json({ message: 'Tipo de movimiento no encontrado' })

        const item = await selectInventarioId(inv_id);
        if (!item) return res.status(404).json({ message: 'Item no encontrado' });

        const updtMovimientosInventario = await updateMovimientosInventario(id, { inv_id, ord_id: ord_id || null, usu_id, tip_id, cantidad });

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