import pool from '../config/database.js'

export const getCategoriaServicio = async() => {
    const result = await pool.query('SELECT * FROM categoria_servicio');
    return result.rows;
}

export const getCategoriaServicioId = async(id) => {
    const result = await pool.query(`SELECT * FROM categoria_servicio WHERE id = $1`, [id]);
    return result.rows[0];
}

export const createCategoriaServicio = async({nombre}) => {
    const result = await pool.query(`INSERT INTO categoria_servicio (nombre) VALUES ($1) RETURNING *`, [nombre]);
    return result.rows[0];
}

export const updateCategoriaServicio = async(id, {nombre}) => {
    const result = await pool.query(`UPDATE categoria_servicio SET nombre = $1 WHERE id = $2 RETURNING *`,
        [nombre, id]);
    return result.rows[0];
}

export const deleteCategoriaServicio = async(id) => {
    const result = await pool.query(`DELETE FROM categoria_servicio WHERE id = $1 RETURNING *`, [id]);
    return result.rows[0]
}