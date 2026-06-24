import pool from "../config/database.js";

export const selectNotificaciones = async () => {
    const result = await pool.query(`SELECT * FROM notificaciones`)
    return result.rows;
}

export const selectNotificacionesById = async(id) => {
    const result = await pool.query(`SELECT * FROM notificaciones WHERE id = $1`, [id]);
    return result.rows[0];
}

export const insertNotificaciones = async({usu_id, tipo, titulo, leido}) => {
    const result = await pool.query(`INSERT INTO notificaciones (usu_id, tipo, titulo, leido) VALUES ($1, $2, $3, $4) RETURNING *`, 
        [usu_id, tipo, titulo, leido]);
    return result.rows[0];
}

export const updateNotificaciones = async(id, {usu_id, tipo, titulo, leido }) => {
    const result = await pool.query(`UPDATE notificaciones SET 
        usu_id = $1, tipo = $2, titulo = $3, leido = $4 WHERE id = $5 RETURNING *`, 
        [usu_id, tipo, titulo, leido, id]);
    return result.rows[0];
}

export const deleteNotificaciones = async(id) => {
    const result = await pool.query(`DELETE FROM notificaciones WHERE id = $1 RETURNING *`, [id]);
    return result.rows[0];
}