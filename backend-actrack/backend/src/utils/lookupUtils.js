import pool from '../config/database.js'

export const getClienteIdByUserId = async (usu_id) => {
    const result = await pool.query('SELECT id FROM clientes WHERE usu_id = $1', [usu_id]);
    return result.rows[0]?.id;
}

export const getTecnicoIdByUserId = async(usu_id) => {
    const result = await pool.query('SELECT id FROM tecnicos WHERE usu_id = $1', [usu_id]);
    return result.rows[0]?.id;
}