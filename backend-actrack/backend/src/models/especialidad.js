import pool from '../config/database.js'

export const selectEspecialidad = async () => {
    const result = await pool.query(`SELECT * FROM especialidad`);
    return result.rows;
}

export const selectEspecialidadById = async (id) => {
    const result = await pool.query(`SELECT * FROM especialidad WHERE id = $1`, [id]);
    return result.rows[0];
}

export const selectEspecialidadByNombre = async (nombre) => {
    const result = await pool.query(`SELECT * FROM especialidad WHERE LOWER(nombre) = LOWER($1)`, [nombre]);
    return result.rows[0];
}

export const insertEspecialidad = async ({ nombre }) => {
    const result = await pool.query(`INSERT INTO especialidad (nombre) VALUES ($1) RETURNING *`, [nombre]);
    return result.rows[0];
}

export const updateEspecialidad = async (id, { nombre }) => {
    const result = await pool.query(`UPDATE especialidad SET nombre = $1 WHERE id = $2 RETURNING *`, [nombre, id]);
    return result.rows[0];
}

export const deleteEspecialidad = async (id) => {
    const result = await pool.query(`DELETE FROM especialidad WHERE id = $1 RETURNING *`, [id]);
    return result.rows[0];
}