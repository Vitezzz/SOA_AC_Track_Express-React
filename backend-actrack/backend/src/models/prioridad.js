import pool from '../config/database.js'

export const selectPrioridad = async() => {
    const result = await pool.query(`SELECT * FROM prioridad `);
    return result.rows;
}

export const selectPrioridadById = async(id) => {
    const result = await pool.query(`SELECT * FROM prioridad WHERE id = $1 `, [id]);
    return result.rows[0];
}

