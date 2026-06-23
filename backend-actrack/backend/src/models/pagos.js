import pool from '../config/database.js'

export const selectPagos = async () => {
    const result = await pool.query(`SELECT * from pagos`);
    return result.rows;
}

export const selectPagosById = async (id) => {
    const result = await pool.query('SELECT * FROM pagos WHERE id = $1', [id])
    return result.rows[0]
}

export const insertPagos = async ({ cot_id, ord_id, cli_id, metodo, monto, estado }) => {
    const result = await pool.query(`INSERT INTO pagos (cot_id, ord_id, cli_id, metodo, monto, estado)
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [cot_id, ord_id, cli_id, metodo, monto, estado])

    return result.rows[0];
}

export const updatePagos = async (id, { cot_id, ord_id, cli_id, metodo, monto, estado }) => {
    const result = await pool.query(`UPDATE pagos SET cot_id = $1, ord_id = $2, cli_id = $3
        , metodo = $4, monto = $5, estado = $6 WHERE id = $7 RETURNING *` , [
        cot_id, ord_id, cli_id, metodo, monto, estado, id
    ])
    return result.rows[0];
}

export const deletePagos = async (id) => {
    const result = await pool.query(`DELETE FROM pagos WHERE id = $1 RETURNING *`, [id]);
    return result.rows[0];
}