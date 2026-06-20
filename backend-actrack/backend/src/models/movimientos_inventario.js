import pool from '../config/database.js'

export const selectAllMovimientosInventario = async () => {
    const result = await pool.query(`SELECT * FROM movimientos_inventario`);
    return result.rows;
}

export const selectMovimientosInventarioId = async (id) => {
    const result = await pool.query(`SELECT * FROM movimientos_inventario WHERE id = $1`, [id]);
    return result.rows[0]
}

export const insertMovimientosInventario = async ({ inv_id, ord_id, usu_id, tip_id, cantidad }) => {
    const result = await pool.query(`INSERT INTO movimientos_inventario (inv_id, ord_id, usu_id, tip_id, cantidad) VALUES ($1, $2, $3, $4, $5)
        RETURNING  *`, [inv_id, ord_id, usu_id, tip_id, cantidad])
    return result.rows[0]
}

export const updateMovimientosInventario = async (id, { inv_id, ord_id, usu_id, tip_id, cantidad }) => {
    const result = await pool.query(`UPDATE movimientos_inventario SET inv_id = $1, 
        ord_id = $2, usu_id = $3, tip_id = $4, cantidad = $5 WHERE id = $6 RETURNING *` ,
        [inv_id, ord_id, usu_id, tip_id, cantidad, id]);
    return result.rows[0]
}

export const deleteMovimientosInventario = async (id) => {
    const result = await pool.query(`DELETE FROM movimientos_inventario WHERE id = $1 RETURNING *`, [id]);
    return result.rows[0];
}