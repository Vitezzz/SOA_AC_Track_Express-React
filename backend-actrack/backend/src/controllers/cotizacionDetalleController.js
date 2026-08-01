import pool from "../config/database.js";
import {
    selectCotizacionDetalle, selectCotizacionDetalleId,
    insertCotizacionDetalle, updateCotizacionDetalle, deleteCotizacionDetalle,
    selectCotizacionDetalleByCliente, selectCotizacionDetalleByTecnico
} from "../models/cotizacion_detalle.js";
import { selectCotizacionesById, recalcularTotalCotizacion } from "../models/cotizaciones.js";
import { selectInventarioId } from "../models/inventario.js";
import { selectInventarioVehiculoPorTecnicoYArticulo, descontarInventarioVehiculo } from "../models/inventario_vehiculo.js";
import { puedeVerTodo } from "../utils/roleUtils.js";
import { getClienteIdByUserId, getTecnicoIdByUserId } from '../utils/lookupUtils.js'

const getCotizacionDetalle = async (req, res) => {
    try {
        let listaCotizacionDetalle;

        if (puedeVerTodo(req.user.rol_id)) {
            listaCotizacionDetalle = await selectCotizacionDetalle();
        } else if (req.user.rol_id === 3) {
            const cli_id = await getClienteIdByUserId(req.user.id);
            if (!cli_id) return res.status(404).json({ message: 'Cliente no encontrado' });
            listaCotizacionDetalle = await selectCotizacionDetalleByCliente(cli_id);
        } else if (req.user.rol_id === 4) {
            const tec_id = await getTecnicoIdByUserId(req.user.id);
            if (!tec_id) return res.status(404).json({ message: 'Tecnico no encontrado' });
            listaCotizacionDetalle = await selectCotizacionDetalleByTecnico(tec_id);
        } else {
            return res.status(403).json({ message: "No tienes acceso" });
        }

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

        if (req.user.rol_id === 3) {
            const cli_id = await getClienteIdByUserId(req.user.id);
            const cotizacion = await selectCotizacionesById(cotizacionDetalleId.cot_id);
            if (!cli_id || !cotizacion || cotizacion.cli_id !== cli_id) {
                return res.status(403).json({ message: "No tienes acceso a este renglón" });
            }
        } else if (req.user.rol_id === 4) {
            const tec_id = await getTecnicoIdByUserId(req.user.id);
            const cotizacion = await selectCotizacionesById(cotizacionDetalleId.cot_id);
            if (!tec_id || !cotizacion || cotizacion.tec_id !== tec_id) {
                return res.status(403).json({ message: "No tienes acceso a este renglón" });
            }
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

        if (!inv_id || !cot_id || !cantidad || !precio_unitario) {
            return res.status(400).json({ message: "Faltan campos" })
        }

        const inventarioExiste = await selectInventarioId(inv_id);
        if (!inventarioExiste) return res.status(404).json({ message: 'Inventario no encontrado' });

        const cotizacionExiste = await selectCotizacionesById(cot_id);
        if (!cotizacionExiste) return res.status(404).json({ message: 'Cotizacion no encontrada' })

        // Si es una pieza física (no mano de obra), debe salir del stock que
        // el técnico responsable YA trae en su camioneta -- la transferencia
        // almacén -> vehículo ya debió haber pasado antes, por separado.
        if (!es_mano_obra) {
            if (!cotizacionExiste.tec_id) {
                return res.status(400).json({ message: 'Esta cotización no tiene técnico asignado; no se puede descontar stock de vehículo' });
            }

            const stockVehiculo = await selectInventarioVehiculoPorTecnicoYArticulo(cotizacionExiste.tec_id, inv_id);
            if (!stockVehiculo || Number(stockVehiculo.cantidad) < Number(cantidad)) {
                return res.status(400).json({
                    message: `El técnico no tiene suficiente stock de "${inventarioExiste.nombre}" en su vehículo (disponible: ${stockVehiculo?.cantidad || 0})`
                });
            }
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const subtotal = cantidad * precio_unitario;
            const resultDetalle = await client.query(
                `INSERT INTO cotizacion_detalle (inv_id, cot_id, cantidad, precio_unitario, subtotal, es_mano_obra)
                 VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
                [inv_id, cot_id, cantidad, precio_unitario, subtotal, es_mano_obra]
            );
            const nuevaCotizacionDetalle = resultDetalle.rows[0];

            if (!es_mano_obra) {
                await descontarInventarioVehiculo(client, cotizacionExiste.tec_id, inv_id, cantidad);
            }

            await recalcularTotalCotizacion(client, cot_id);

            await client.query('COMMIT');

            res.status(201).json({
                id: nuevaCotizacionDetalle.id,
                inv_id: nuevaCotizacionDetalle.inv_id,
                cot_id: nuevaCotizacionDetalle.cot_id,
                cantidad: nuevaCotizacionDetalle.cantidad,
                precio_unitario: nuevaCotizacionDetalle.precio_unitario,
                subtotal: nuevaCotizacionDetalle.subtotal,
                es_mano_obra: nuevaCotizacionDetalle.es_mano_obra
            });
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
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

        const detalleAnterior = await selectCotizacionDetalleId(id);
        if (!detalleAnterior) return res.status(404).json({ message: "Id de cotizacion detalle no encontrado" });

        const inventarioExiste = await selectInventarioId(inv_id);
        if (!inventarioExiste) return res.status(404).json({ message: 'Inventario no encontrado' });

        const cotizacionExiste = await selectCotizacionesById(cot_id);
        if (!cotizacionExiste) return res.status(404).json({ message: 'Cotizacion no encontrada' })

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Primero "deshacemos" el efecto anterior en el stock del
            // vehículo (si era una pieza física), luego aplicamos el nuevo.
            if (!detalleAnterior.es_mano_obra && cotizacionExiste.tec_id) {
                await client.query(
                    `UPDATE inventario_vehiculo SET cantidad = cantidad + $1 WHERE tec_id = $2 AND inv_id = $3`,
                    [detalleAnterior.cantidad, cotizacionExiste.tec_id, detalleAnterior.inv_id]
                );
            }

            if (!es_mano_obra) {
                if (!cotizacionExiste.tec_id) {
                    throw new Error('Esta cotización no tiene técnico asignado');
                }
                const stockVehiculo = await client.query(
                    `SELECT * FROM inventario_vehiculo WHERE tec_id = $1 AND inv_id = $2`,
                    [cotizacionExiste.tec_id, inv_id]
                );
                const disponible = stockVehiculo.rows[0]?.cantidad || 0;
                if (Number(disponible) < Number(cantidad)) {
                    throw new Error(`Stock insuficiente en el vehículo (disponible: ${disponible})`);
                }
                await client.query(
                    `UPDATE inventario_vehiculo SET cantidad = cantidad - $1 WHERE tec_id = $2 AND inv_id = $3`,
                    [cantidad, cotizacionExiste.tec_id, inv_id]
                );
            }

            const subtotal = cantidad * precio_unitario;
            const resultUpdate = await client.query(
                `UPDATE cotizacion_detalle SET inv_id = $1, cot_id = $2, cantidad = $3,
                 precio_unitario = $4, subtotal = $5, es_mano_obra = $6 WHERE id = $7 RETURNING *`,
                [inv_id, cot_id, cantidad, precio_unitario, subtotal, es_mano_obra, id]
            );

            await recalcularTotalCotizacion(client, cot_id);

            await client.query('COMMIT');

            const cotizacionDetalleUpdt = resultUpdate.rows[0];
            res.status(200).json({
                id: cotizacionDetalleUpdt.id,
                inv_id: cotizacionDetalleUpdt.inv_id,
                cot_id: cotizacionDetalleUpdt.cot_id,
                cantidad: cotizacionDetalleUpdt.cantidad,
                precio_unitario: cotizacionDetalleUpdt.precio_unitario,
                subtotal: cotizacionDetalleUpdt.subtotal,
                es_mano_obra: cotizacionDetalleUpdt.es_mano_obra
            });
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(400).json({ message: error.message || "Error del servidor" })
    }
}

const dltCotizacionDetalle = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "Id no encontrado" })
        }

        const detalleExistente = await selectCotizacionDetalleId(id);
        if (!detalleExistente) return res.status(404).json({ message: "Id de cotizacion detalle no encontrado" });

        const cotizacion = await selectCotizacionesById(detalleExistente.cot_id);

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const resultDelete = await client.query(
                `DELETE FROM cotizacion_detalle WHERE id = $1 RETURNING *`,
                [id]
            );

            // Si era una pieza física, regresamos la cantidad al vehículo
            // del técnico -- estamos "deshaciendo" ese consumo.
            if (!detalleExistente.es_mano_obra && cotizacion?.tec_id) {
                await client.query(
                    `UPDATE inventario_vehiculo SET cantidad = cantidad + $1 WHERE tec_id = $2 AND inv_id = $3`,
                    [detalleExistente.cantidad, cotizacion.tec_id, detalleExistente.inv_id]
                );
            }

            await recalcularTotalCotizacion(client, detalleExistente.cot_id);

            await client.query('COMMIT');
            res.status(200).json(resultDelete.rows[0]);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: "Error del servidor" })
    }
}

export { getCotizacionDetalle, getCotizacionDetalleById, postCotizacionDetalleById, putCotizacionDetalleById, dltCotizacionDetalle }