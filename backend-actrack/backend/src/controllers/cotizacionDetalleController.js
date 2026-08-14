import pool from "../config/database.js";
import {
    selectCotizacionDetalle, selectCotizacionDetalleId,
    insertCotizacionDetalle, updateCotizacionDetalle, deleteCotizacionDetalle,
    selectCotizacionDetalleByCliente, selectCotizacionDetalleByTecnico
} from "../models/cotizacion_detalle.js";
import { selectCotizacionesById, recalcularTotalCotizacion } from "../models/cotizaciones.js";
import { selectInventarioId } from "../models/inventario.js";
import { selectInventarioVehiculoPorTecnicoYArticulo, descontarInventarioVehiculo } from "../models/inventario_vehiculo.js";
import { selectTecnicoById } from "../models/tecnicos.js";
import { puedeVerTodo } from "../utils/roleUtils.js";
import { getClienteIdByUserId, getTecnicoIdByUserId } from '../utils/lookupUtils.js'

// IDs de tipos_movimiento_inventario -- "Salida" cuando una pieza se usa
// en una cotización, "Entrada" cuando se quita/edita un renglón y la
// pieza vuelve al stock del técnico.
const TIPO_SALIDA_ID = 3;
const TIPO_ENTRADA_ID = 2;

// Antes, usar una pieza en una cotización descontaba el stock del vehículo
// pero no dejaba ningún rastro en movimientos_inventario -- esa tabla es
// el historial que alimenta reportes de "qué se usó y cuándo", y se
// quedaba ciega a la mayoría del consumo real (todo lo que se cotiza y
// cobra, que ahora es el flujo principal desde que el técnico cotiza en
// campo). Se registra aquí mismo, dentro de la misma transacción que
// mueve el stock, para que ambos números siempre cuenten la misma historia.
const registrarMovimientoPorCotizacion = async (client, { tec_id, inv_id, ord_id, cantidad, tip_id }) => {
    const tecnico = await selectTecnicoById(tec_id);
    if (!tecnico) return;
    await client.query(
        `INSERT INTO movimientos_inventario (inv_id, ord_id, usu_id, tip_id, cantidad) VALUES ($1, $2, $3, $4, $5)`,
        [inv_id, ord_id, tecnico.usu_id, tip_id, cantidad]
    );
};

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
        const { inv_id, cot_id, cantidad, precio_unitario, es_mano_obra, concepto } = req.body;

        if (!cot_id || !cantidad || !precio_unitario) {
            return res.status(400).json({ message: "Faltan campos" })
        }

        if (!es_mano_obra && !inv_id) {
            return res.status(400).json({ message: "Selecciona un artículo, o marca 'es mano de obra'" })
        }

        if (es_mano_obra && !concepto) {
            return res.status(400).json({ message: "Describe en qué consistió la mano de obra" })
        }

        const cotizacionExiste = await selectCotizacionesById(cot_id);
        if (!cotizacionExiste) return res.status(404).json({ message: 'Cotizacion no encontrada' })

        let inventarioExiste = null;
        if (!es_mano_obra) {
            inventarioExiste = await selectInventarioId(inv_id);
            if (!inventarioExiste) return res.status(404).json({ message: 'Inventario no encontrado' });

            if (!cotizacionExiste.tec_id) {
                return res.status(400).json({ message: 'Esta cotización no tiene técnico asignado; no se puede descontar stock de vehículo' });
            }

            const stockVehiculo = await selectInventarioVehiculoPorTecnicoYArticulo(cotizacionExiste.tec_id, inv_id);
            if (!stockVehiculo || Number(stockVehiculo.cantidad) < Number(cantidad)) {
                return res.status(400).json({
                    message: `El técnico no tiene suficiente stock de "${inventarioExiste?.nombre}" en su vehículo (disponible: ${stockVehiculo?.cantidad || 0})`
                });
            }
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const subtotal = cantidad * precio_unitario;
            const resultDetalle = await client.query(
                `INSERT INTO cotizacion_detalle (inv_id, cot_id, cantidad, precio_unitario, subtotal, es_mano_obra, concepto)
                 VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
                [inv_id || null, cot_id, cantidad, precio_unitario, subtotal, es_mano_obra, concepto || null]
            );
            const nuevaCotizacionDetalle = resultDetalle.rows[0];

            if (!es_mano_obra) {
                await descontarInventarioVehiculo(client, cotizacionExiste.tec_id, inv_id, cantidad);
                await registrarMovimientoPorCotizacion(client, {
                    tec_id: cotizacionExiste.tec_id, inv_id, ord_id: cotizacionExiste.ord_id,
                    cantidad, tip_id: TIPO_SALIDA_ID,
                });
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
                es_mano_obra: nuevaCotizacionDetalle.es_mano_obra,
                concepto: nuevaCotizacionDetalle.concepto
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
        const { inv_id, cot_id, cantidad, precio_unitario, es_mano_obra, concepto } = req.body;

        if (!id) {
            return res.status(400).json({ message: "Id no encontrado" })
        }

        const detalleAnterior = await selectCotizacionDetalleId(id);
        if (!detalleAnterior) return res.status(404).json({ message: "Id de cotizacion detalle no encontrado" });

        if (!es_mano_obra && !inv_id) {
            return res.status(400).json({ message: "Selecciona un artículo, o marca 'es mano de obra'" })
        }

        if (es_mano_obra && !concepto) {
            return res.status(400).json({ message: "Describe en qué consistió la mano de obra" })
        }

        if (!es_mano_obra) {
            const inventarioExiste = await selectInventarioId(inv_id);
            if (!inventarioExiste) return res.status(404).json({ message: 'Inventario no encontrado' });
        }

        const cotizacionExiste = await selectCotizacionesById(cot_id);
        if (!cotizacionExiste) return res.status(404).json({ message: 'Cotizacion no encontrada' })

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            if (!detalleAnterior.es_mano_obra && cotizacionExiste.tec_id) {
                await client.query(
                    `UPDATE inventario_vehiculo SET cantidad = cantidad + $1 WHERE tec_id = $2 AND inv_id = $3`,
                    [detalleAnterior.cantidad, cotizacionExiste.tec_id, detalleAnterior.inv_id]
                );
                await registrarMovimientoPorCotizacion(client, {
                    tec_id: cotizacionExiste.tec_id, inv_id: detalleAnterior.inv_id, ord_id: cotizacionExiste.ord_id,
                    cantidad: detalleAnterior.cantidad, tip_id: TIPO_ENTRADA_ID,
                });
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
                await registrarMovimientoPorCotizacion(client, {
                    tec_id: cotizacionExiste.tec_id, inv_id, ord_id: cotizacionExiste.ord_id,
                    cantidad, tip_id: TIPO_SALIDA_ID,
                });
            }

            const subtotal = cantidad * precio_unitario;
            const resultUpdate = await client.query(
                `UPDATE cotizacion_detalle SET inv_id = $1, cot_id = $2, cantidad = $3,
                 precio_unitario = $4, subtotal = $5, es_mano_obra = $6, concepto = $7 WHERE id = $8 RETURNING *`,
                [inv_id || null, cot_id, cantidad, precio_unitario, subtotal, es_mano_obra, concepto || null, id]
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
                es_mano_obra: cotizacionDetalleUpdt.es_mano_obra,
                concepto: cotizacionDetalleUpdt.concepto
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

            if (!detalleExistente.es_mano_obra && cotizacion?.tec_id) {
                await client.query(
                    `UPDATE inventario_vehiculo SET cantidad = cantidad + $1 WHERE tec_id = $2 AND inv_id = $3`,
                    [detalleExistente.cantidad, cotizacion.tec_id, detalleExistente.inv_id]
                );
                await registrarMovimientoPorCotizacion(client, {
                    tec_id: cotizacion.tec_id, inv_id: detalleExistente.inv_id, ord_id: cotizacion.ord_id,
                    cantidad: detalleExistente.cantidad, tip_id: TIPO_ENTRADA_ID,
                });
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