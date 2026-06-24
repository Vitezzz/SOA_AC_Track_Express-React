import pool from '../config/database.js'

export const insertSesiones = async (usu_id, refresh_token, expira) => {
    const result = await pool.query(`INSERT INTO sesiones (usu_id, refresh_token, expira) VALUES
    ($1, $2, $3) RETURNING *`, [usu_id, refresh_token, expira]);
    return result.rows[0];
}

export const selectSesionesByToken = async (refresh_token) => {
    const result = await pool.query(`SELECT * from sesiones WHERE refresh_token = $1`, 
        [refresh_token]);
    return result.rows[0];
}

export const deleteSesiones = async(usu_id) => {
    const result = await pool.query(`DELETE FROM sesiones WHERE usu_id = $1 
        RETURNING *`, [usu_id]);
    return result.rows[0];
}


