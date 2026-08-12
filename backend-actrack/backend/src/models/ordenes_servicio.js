import pool from '../config/database.js';
import { aFechaSinZona } from '../utils/fechaLocal.js';

export const selectOrdenesServicio = async () => {
    const result = await pool.query(`SELECT * FROM ordenes_servicio`);
    return result.rows;
}

export const selectOrdenesServicioById = async (id) => {
    const result = await pool.query(`SELECT * FROM ordenes_servicio WHERE id = $1`, [id]);
    return result.rows[0];
}

export const selectOrdenesByCliente = async (cli_id) => {
    const result = await pool.query(`SELECT * FROM ordenes_servicio WHERE cli_id = $1`, [cli_id]);
    return result.rows;
}

export const insertOrdenesServicio = async ({ cli_id, equ_id, cat_id, pri_id, folio,
    prioridad, estatus, descripcion, fecha_programada, fecha_cierre, tec_id, duracion_estimada_horas }) => {

    const result = await pool.query(`INSERT INTO ordenes_servicio (cli_id, equ_id, cat_id, pri_id, folio,
    prioridad, estatus, descripcion, fecha_programada, fecha_cierre, tec_id, duracion_estimada_horas) VALUES(
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`, [cli_id, equ_id, cat_id, pri_id, folio,
        prioridad, estatus, descripcion, aFechaSinZona(fecha_programada), aFechaSinZona(fecha_cierre), tec_id, duracion_estimada_horas ?? 2]);

    return result.rows[0];
}

export const updateOrdenesServicio = async (id, { cli_id, equ_id, cat_id, pri_id, folio,
    prioridad, estatus, descripcion, fecha_programada, fecha_cierre, tec_id, duracion_estimada_horas }) => {
    const result = await pool.query(`UPDATE ordenes_servicio SET cli_id = $1, equ_id = $2, cat_id = $3, pri_id = $4, folio = $5,
    prioridad = $6, estatus = $7, descripcion = $8, fecha_programada = $9, fecha_cierre = $10,
    tec_id = $11, duracion_estimada_horas = $12 WHERE id = $13
    RETURNING *`, [cli_id, equ_id, cat_id, pri_id, folio,
        prioridad, estatus, descripcion, aFechaSinZona(fecha_programada), aFechaSinZona(fecha_cierre), tec_id, duracion_estimada_horas ?? 2, id]);

    return result.rows[0];
}

// Aparte de updateOrdenesServicio a propósito -- ese es un full-replace que
// usan las pantallas de edición completa; si le agregáramos estos 3 campos
// ahí, cada guardado normal del admin borraría sin querer una solicitud
// pendiente que no tenía nada que ver. Esta solo toca lo suyo.
export const updateSolicitudCliente = async (id, { solicitud_tipo, solicitud_fecha_nueva, solicitud_motivo, solicitud_estado, solicitud_respuesta }) => {
    const result = await pool.query(
        `UPDATE ordenes_servicio SET solicitud_tipo = $1, solicitud_fecha_nueva = $2, solicitud_motivo = $3,
         solicitud_estado = $4, solicitud_respuesta = $5
         WHERE id = $6 RETURNING *`,
        [solicitud_tipo, aFechaSinZona(solicitud_fecha_nueva), solicitud_motivo, solicitud_estado ?? null, solicitud_respuesta ?? null, id]
    );
    return result.rows[0];
}

export const deleteOrdenesServicio = async (id) => {
    const result = await pool.query(`DELETE FROM ordenes_servicio WHERE id = $1 RETURNING *`, [id]);
    return result.rows[0];
}

export const selectOrdenesByTecnico = async (tec_id) => {
    const result = await pool.query(`SELECT * FROM ordenes_servicio WHERE tec_id = $1`, [tec_id]);
    return result.rows;
}

export const generarSiguienteFolio = async () => {
    const anio = new Date().getFullYear();

    const result = await pool.query(
        `SELECT folio FROM ordenes_servicio WHERE folio LIKE $1 ORDER BY folio DESC LIMIT 1`,
        [`OS-${anio}-%`]
    );

    const ultimoFolio = result.rows[0]?.folio;
    const siguienteNumero = ultimoFolio ? parseInt(ultimoFolio.split('-')[2], 10) + 1 : 1;

    return `OS-${anio}-${String(siguienteNumero).padStart(3, '0')}`;
}

// Ya no usamos un margen fijo de horas -- comparamos el RANGO real de
// cada trabajo (inicio + su propia duración) contra el rango del nuevo
// trabajo. 2 rangos chocan si: inicio1 < fin2 Y inicio2 < fin1.
export const getOrdenesPorTecnicoEnConflicto = async (tec_id, fechaNueva, duracionNueva, idExcluir) => {
    const result = await pool.query(
        `SELECT * FROM ordenes_servicio
         WHERE tec_id = $1
           AND estatus != 'cancelada'
           AND ($2::int IS NULL OR id != $2)
           AND $3::timestamp < (fecha_programada + (duracion_estimada_horas || ' hours')::interval)
           AND fecha_programada < ($3::timestamp + ($4 || ' hours')::interval)`,
        [tec_id, idExcluir, aFechaSinZona(fechaNueva), duracionNueva]
    );
    return result.rows;
}