import pool from '../config/database.js'
import { aFechaSinZona } from '../utils/fechaLocal.js'

export const selectPagos = async () => {
    const result = await pool.query(`SELECT * from pagos`);
    return result.rows;
}

export const selectPagosById = async (id) => {
    const result = await pool.query('SELECT * FROM pagos WHERE id = $1', [id])
    return result.rows[0]
}

export const selectPagosByCliente = async (cli_id) => {
    const result = await pool.query(`SELECT * FROM pagos WHERE cli_id = $1`,
        [cli_id]);
    return result.rows;
}

export const selectPagosByTecnico = async (tec_id) => {
    const result = await pool.query(
        `SELECT p.* FROM pagos p
         JOIN ordenes_servicio o ON p.ord_id = o.id
         WHERE o.tec_id = $1`,
        [tec_id]
    );
    return result.rows;
}

// created_at NO se deja al DEFAULT now() de Postgres -- la sesión de la
// base corre en UTC, pero esa columna es TIMESTAMP sin zona y se lee de
// vuelta como hora LOCAL (ver fechaLocal.js), así que un now() de la base
// terminaba mostrándose 6h adelantado (UTC-6). Se manda ya normalizada.
export const insertPagos = async ({ cot_id, ord_id, cli_id, metodo, monto, estado }) => {
    const creado = aFechaSinZona(new Date());
    const result = await pool.query(`INSERT INTO pagos (cot_id, ord_id, cli_id, metodo, monto, estado, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [cot_id, ord_id, cli_id, metodo, monto, estado, creado])

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

export const selectPagosPorOrden = async (ord_id) => {
    const result = await pool.query(`SELECT * FROM pagos WHERE ord_id = $1`, [ord_id]);
    return result.rows;
}