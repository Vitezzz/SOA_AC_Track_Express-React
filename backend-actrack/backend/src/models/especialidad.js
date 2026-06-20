import pool from '../config/database.js'

export const selectEspecialidad = async () => {
    const result = await pool.query(`SELECT * FROM especialidad`);
    return result.rows;
}

export const selectEspecialidadById = async (id) => {
    const result = await pool.query(`SELECT * FROM especialidad WHERE id = $1`, [id]);
    return result.rows[0];
}