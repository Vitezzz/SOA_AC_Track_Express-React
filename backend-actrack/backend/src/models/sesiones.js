import pool from '../config/database.js'

export const insertSesiones = async (usu_id, refresh_token, expira) => {
    const result = await pool.query(`INSERT INTO sesiones (usu_id, refresh_token, expira) VALUES
    ($1, $2, $3) RETRURNING *`, [usu_id, refresh_token, expira]);
    return result.rows;
}

export const selectSesionesByToken = async (refreseh_token) => {
    const result = await pool.query(`SELECT * from sesiones WHERE refresh_token = $1`, 
        [refreseh_token]);
    return result.rows[0];
}



