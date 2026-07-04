import pool from '../config/database.js';

export const selectOrdenesServicio = async () => {
    const result = await pool.query(`SELECT * FROM ordenes_servicio`);
    return result.rows;
}

export const selectOrdenesServicioById = async (id) => {
    const result = await pool.query(`SELECT * FROM ordenes_servicio WHERE id = $1`, [id]);
    return result.rows[0];
}

export const selectOrdenesByCliente = async(cli_id) => {
    const result = await pool.query(`SELECT * FROM ordenes_servicio WHERE cli_id = $1`, [cli_id]);
    return result.rows;
}

export const insertOrdenesServicio = async ({ cli_id, equ_id, cat_id, pri_id, folio,
    prioridad, estatus, descripcion, fecha_programada, fecha_cierre, tec_id }) => {

    const result = await pool.query(`INSERT INTO ordenes_servicio (cli_id, equ_id, cat_id, pri_id, folio,
    prioridad, estatus, descripcion, fecha_programada, fecha_cierre, tec_id) VALUES(
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`, [cli_id, equ_id, cat_id, pri_id, folio,
        prioridad, estatus, descripcion, fecha_programada, fecha_cierre, tec_id]);

    return result.rows[0];
}

export const updateOrdenesServicio = async(id ,{ cli_id, equ_id, cat_id, pri_id, folio,
    prioridad, estatus, descripcion, fecha_programada, fecha_cierre, tec_id }) => {
        const result = await pool.query(`UPDATE ordenes_servicio SET cli_id = $1, equ_id = $2, cat_id = $3, pri_id = $4, folio = $5,
    prioridad = $6, estatus = $7, descripcion = $8, fecha_programada = $9, fecha_cierre = $10,
    tec_id = $11 WHERE id = $12 
    RETURNING *`, [cli_id, equ_id, cat_id, pri_id, folio,
    prioridad, estatus, descripcion, fecha_programada, fecha_cierre,tec_id,id]);

    return result.rows[0];
}

export const deleteOrdenesServicio = async(id) => {
    const result = await pool.query(`DELETE FROM ordenes_servicio WHERE id = $1 RETURNING *`, [id]);
    return result.rows[0];
}

export const selectOrdenesByTecnico = async (tec_id) => {
    const result = await pool.query(`SELECT * FROM ordenes_servicio WHERE tec_id = $1`, [tec_id]);
    return result.rows;
}

