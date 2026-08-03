import pool from '../config/database.js';
import { selectInventarioVehiculoByTecnico, selectInventarioVehiculoTodo, upsertInventarioVehiculo, descontarInventarioVehiculo, selectInventarioVehiculoPorTecnicoYArticulo } from '../models/inventario_vehiculo.js';
import { selectInventarioId } from '../models/inventario.js';
import { selectTecnicoById } from '../models/tecnicos.js';
import { puedeVerTodo } from '../utils/roleUtils.js';
import { getTecnicoIdByUserId } from '../utils/lookupUtils.js';

const getInventarioVehiculo = async (req, res) => {
    try {
        let lista;
        if (puedeVerTodo(req.user.rol_id)) {
            lista = await selectInventarioVehiculoTodo();
        } else if (req.user.rol_id === 4) {
            const tec_id = await getTecnicoIdByUserId(req.user.id);
            if (!tec_id) return res.status(404).json({ message: 'Tecnico no encontrado' });
            lista = await selectInventarioVehiculoByTecnico(tec_id);
        } else {
            return res.status(403).json({ message: 'No tienes acceso' });
        }

        if (lista.length === 0) {
            return res.status(404).json({ message: 'Sin inventario de vehículo registrado' });
        }

        res.status(200).json(lista);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
}

const transferirAVehiculo = async (req, res) => {
    const { inv_id, tec_id, cantidad } = req.body;

    if (!inv_id || !tec_id || !cantidad) {
        return res.status(400).json({ message: 'Faltan campos' });
    }
    if (cantidad <= 0) {
        return res.status(400).json({ message: 'La cantidad debe ser mayor a 0' });
    }

    const articulo = await selectInventarioId(inv_id);
    if (!articulo) return res.status(404).json({ message: 'Artículo no encontrado' });

    const tecnico = await selectTecnicoById(tec_id);
    if (!tecnico) return res.status(404).json({ message: 'Técnico no encontrado' });

    if (Number(articulo.stock_actual) < Number(cantidad)) {
        return res.status(400).json({ message: `Stock insuficiente en almacén (disponible: ${articulo.stock_actual})` });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        await client.query(
            `UPDATE inventario SET stock_actual = stock_actual - $1 WHERE id = $2`,
            [cantidad, inv_id]
        );

        const resultado = await upsertInventarioVehiculo(client, inv_id, tec_id, cantidad);

        await client.query('COMMIT');

        res.status(200).json({
            message: `Se transfirieron ${cantidad} unidades de "${articulo.nombre}" a la camioneta del técnico`,
            inventario_vehiculo: resultado,
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error:', error);
        res.status(500).json({ message: 'Error del servidor' });
    } finally {
        client.release();
    }
}

const devolverAlAlmacen = async (req, res) => {
    const { inv_id, tec_id, cantidad } = req.body;

    if (!inv_id || !tec_id || !cantidad) {
        return res.status(400).json({ message: 'Faltan campos' });
    }
    if (cantidad <= 0) {
        return res.status(400).json({ message: 'La cantidad debe ser mayor a 0' });
    }

    const articulo = await selectInventarioId(inv_id);
    if (!articulo) return res.status(404).json({ message: 'Artículo no encontrado' });

    const tecnico = await selectTecnicoById(tec_id);
    if (!tecnico) return res.status(404).json({ message: 'Técnico no encontrado' });

    const stockVehiculo = await selectInventarioVehiculoPorTecnicoYArticulo(tec_id, inv_id);
    if (!stockVehiculo || Number(stockVehiculo.cantidad) < Number(cantidad)) {
        return res.status(400).json({
            message: `El técnico no tiene esa cantidad disponible en su vehículo (disponible: ${stockVehiculo?.cantidad || 0})`
        });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        await descontarInventarioVehiculo(client, tec_id, inv_id, cantidad);

        await client.query(
            `UPDATE inventario SET stock_actual = stock_actual + $1 WHERE id = $2`,
            [cantidad, inv_id]
        );

        await client.query('COMMIT');

        res.status(200).json({
            message: `Se devolvieron ${cantidad} unidades de "${articulo.nombre}" al almacén`,
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error:', error);
        res.status(500).json({ message: 'Error del servidor' });
    } finally {
        client.release();
    }
}

export { getInventarioVehiculo, transferirAVehiculo, devolverAlAlmacen };