import pool from '../config/database.js'

export const getCategoriaServicio = async() => {
    const result = await pool.query('SELECT * FROM categoria_servicio');
    return result.rows;
}

export const getCategoriaServicioId = async(id) => {
    const result = await pool.query(`SELECT * FROM categoria_servicio WHERE id = $1`, [id]);
    return result.rows[0];
}

export const createCategoriaServicio = async({nombre, precio_sugerido}) => {
    const result = await pool.query(`INSERT INTO categoria_servicio (nombre, precio_sugerido) VALUES ($1, $2) RETURNING *`, [nombre, precio_sugerido ?? null]);
    return result.rows[0];
}

export const updateCategoriaServicio = async(id, {nombre, precio_sugerido}) => {
    const result = await pool.query(`UPDATE categoria_servicio SET nombre = $1, precio_sugerido = $2 WHERE id = $3 RETURNING *`,
        [nombre, precio_sugerido ?? null, id]);
    return result.rows[0];
}

export const deleteCategoriaServicio = async(id) => {
    const result = await pool.query(`DELETE FROM categoria_servicio WHERE id = $1 RETURNING *`, [id]);
    return result.rows[0]
}

 export const getCategoriaServicioByNombre = async (nombre) => {
     const result = await pool.query(`SELECT * FROM categoria_servicio WHERE LOWER(nombre) = LOWER($1)`, [nombre]);
     return result.rows[0];
}