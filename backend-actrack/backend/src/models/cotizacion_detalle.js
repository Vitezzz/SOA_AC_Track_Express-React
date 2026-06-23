import pool from '../config/database.js'

export const selectCotizacionDetalle = async () => {
    const result = await pool.query(`SELECT * FROM cotizacion_detalle`);
    return result.rows;
}

export const selectCotizacionDetalleId = async (id) => {
    const result = await pool.query(`SELECT * FROM cotizacion_detalle WHERE id = $1`, [id]);
    return result.rows[0];
}

export const insertCotizacionDetalle = async ({ inv_id, cot_id, cantidad,
    precio_unitario, es_mano_obra
}) => {
    const subtotal = cantidad * precio_unitario;
    const result = await pool.query(`INSERT INTO cotizacion_detalle ( inv_id, cot_id, cantidad,
    precio_unitario, subtotal, es_mano_obra) VALUES ($1,$2, $3, $4, $5, $6) RETURNING *`,
        [inv_id, cot_id, cantidad, precio_unitario, subtotal, es_mano_obra]);

    return result.rows[0];
}

export const updateCotizacionDetalle = async (id, { inv_id, cot_id, cantidad,
    precio_unitario, es_mano_obra }) => {
    const subtotal = cantidad * precio_unitario;
    const result = await pool.query(`UPDATE cotizacion_detalle SET inv_id = $1, cot_id = $2, cantidad = $3,
    precio_unitario = $4, subtotal = $5, es_mano_obra = $6 WHERE id = $7 RETURNING  *`, [inv_id, cot_id, cantidad,
        precio_unitario, subtotal,es_mano_obra, id])
    
        return result.rows[0];
}

export const deleteCotizacionDetalle = async (id) => {
    const result = await pool.query(`DELETE FROM cotizacion_detalle WHERE id = $1 RETURNING *`, [id]);

    return result.rows[0];
}