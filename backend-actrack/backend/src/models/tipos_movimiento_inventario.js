import pool from '../config/database.js';

export const selectTipoMovimientoInventario = async() => {
    const result = await pool.query(`SELECT * FROM tipos_movimiento_inventario `)
    return result.rows;
}

export const selectTipoMovimientoInventarioById = async(id) => {
    const result = await pool.query(`SELECT * FROM tipos_movimiento_inventario WHERE id = $1`, [id])
    return result.rows[0];
}