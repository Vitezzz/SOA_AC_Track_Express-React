import pool from '../config/database.js'

export const selectAllCategoria_Inventario = async () => {
    const result = await pool.query('SELECT * FROM categoria_inventario');
    return result.rows;
}

export const selectCategoria_InventarioId = async (id) => {
    const result = await pool.query(`SELECT * FROM categoria_inventario WHERE id = $1`, [id]);
    return result.rows[0];
}

export const insertCategoria_Inventario = async ({ nombre }) => {
    const result = await pool.query(`INSERT INTO categoria_inventario (nombre) VALUES ($1) RETURNING *`, [nombre]);
    return result.rows[0];
}

export const updateCategoria_Inventario = async (id, {nombre}) => {
    const result = await pool.query(`UPDATE categoria_inventario SET nombre = $1 WHERE 
        id = $2 RETURNING *`, [nombre, id]);
    return result.rows[0];
}

export const deleteCategoria_Inventario = async(id) => {
    const result = await pool.query(`DELETE FROM categoria_inventario WHERE id = $1 RETURNING *`, [id]);
    return result.rows[0];
}