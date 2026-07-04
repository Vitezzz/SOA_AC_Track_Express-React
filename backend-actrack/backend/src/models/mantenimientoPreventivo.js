import pool from '../config/database.js'

export const selectMantenimientoPreventivo = async() => {
    const result = await pool.query(`SELECT * FROM mantenimiento_preventivo`);
    return result.rows;
}

export const selectMantenimientoById = async (id) => {
    const result = await pool.query(`SELECT * FROM mantenimiento_preventivo WHERE id = $1`, [id]);
    return result.rows[0];
}

export const insertMantenimientoPreventivo = async ( { cli_id, equ_id, frecuencia_dias, proxima_fecha, activo}) => {
    const result = await pool.query(`INSERT INTO mantenimiento_preventivo (cli_id, equ_id, frecuencia_dias, proxima_fecha, activo)
        VALUES ($1, $2, $3, $4, $5) RETURNING *`, [
            cli_id, equ_id, frecuencia_dias, proxima_fecha, activo ?? true
        ])
    return result.rows[0];
}

export const updateMantenimientoPreventivo = async( id, { cli_id, equ_id, frecuencia_dias, proxima_fecha, activo })  => {
    const result = await pool.query(`UPDATE mantenimiento_preventivo SET cli_id = $1, 
        equ_id = $2, frecuencia_dias = $3, proxima_fecha = $4, activo = $5 WHERE id = $6 RETURNING *`, [
            cli_id, equ_id, frecuencia_dias, proxima_fecha, activo, id
        ]);
    return result.rows[0];
}

export const deleteMantenimientoPreventivo = async (id) => {
    const result = await pool.query(`UPDATE mantenimiento_preventivo SET activo = false WHERE id = $1 
        RETURNING *`, [id]);
    return result.rows[0]
}

export const selectMantenimientoPreventivoByCliente = async (cli_id) => {
    const result = await pool.query(`SELECT * FROM mantenimiento_preventivo WHERE cli_id = $1`,[cli_id]);
    return result.rows;
}