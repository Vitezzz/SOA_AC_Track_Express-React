import pool from '../config/database.js'

export const upsertPushToken = async (usu_id, token) => {
    const result = await pool.query(
        `INSERT INTO push_tokens (usu_id, token) VALUES ($1, $2)
         ON CONFLICT (token) DO UPDATE SET usu_id = $1
         RETURNING *`,
        [usu_id, token]
    );
    return result.rows[0];
}

export const selectTokensByUsuario = async (usu_id) => {
    const result = await pool.query(`SELECT token FROM push_tokens WHERE usu_id = $1`, [usu_id]);
    return result.rows.map((r) => r.token);
}