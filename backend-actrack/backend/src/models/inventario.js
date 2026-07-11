import pool from '../config/database.js'

export const selectAllInventario = async () => {
    const result = await pool.query('SELECT * FROM inventario WHERE activo = true');
    return result.rows;
}

export const selectInventarioId = async (id) => {
    const result = await pool.query(`SELECT * FROM inventario WHERE id = $1`, [id]);
    return result.rows[0];
}

export const insertInventario = async ({ cat_id, codigo, nombre, unidad_medida, stock_actual, precio_venta, stock_minimo }) => {
    const result = await pool.query(
        `INSERT INTO inventario (cat_id, codigo, nombre, unidad_medida, stock_actual, precio_venta, activo, stock_minimo) VALUES ($1, $2, $3, $4, $5, $6, $7, true) RETURNING *`,
        [cat_id, codigo, nombre, unidad_medida, stock_actual, precio_venta, stock_minimo]
    );
    return result.rows[0];
}

export const updateInventario = async (id, { cat_id, codigo, nombre, unidad_medida, stock_actual, precio_venta, stock_minimo }) => {
    const result = await pool.query(
        `UPDATE inventario SET cat_id = $1, codigo = $2, nombre = $3, unidad_medida = $4, stock_actual = $5, precio_venta = $6, stock_minimo = $7 WHERE id = $8 RETURNING *`,
        [cat_id, codigo, nombre, unidad_medida, stock_actual, precio_venta, stock_minimo,id]
    );
    return result.rows[0];
}

export const deleteInventario = async (id) => {
    const result = await pool.query(
        `UPDATE inventario SET activo = false WHERE id = $1 RETURNING *`,
        [id]
    );
    return result.rows[0];
}

export const updateInventarioStock = async (id, stock_actual) => {
    const result = await pool.query('UPDATE inventario SET stock_actual = $1 WHERE id = $2 RETURNING  *',         [stock_actual, id]);
    return result.rows[0];
}
