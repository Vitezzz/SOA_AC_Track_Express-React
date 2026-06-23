import pool from '../config/database.js'

export const selectBitacoraEstados = async () => {
    const result = await pool.query(`SELECT * FROM bitacora_estados`);
    return result.rows;
}

export const selectBitacoraEstadosById = async (id) => {
    const result = await pool.query(`SELECT * FROM bitacora_estados WHERE id = $1`, [id])
    return result.rows[0];
}

export const insertBitacoraEstados = async ({ ord_id, usu_id, estado_anterior, estado_nuevo }) => {
    const result = await pool.query(`INSERT INTO bitacora_estados (ord_id, usu_id, estado_anterior, estado_nuevo) VALUES
        ($1, $2, $3, $4) RETURNING *`, [ord_id, usu_id, estado_anterior, estado_nuevo]);
    return result.rows[0];
}



