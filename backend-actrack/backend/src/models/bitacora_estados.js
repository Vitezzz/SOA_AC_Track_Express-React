import pool from '../config/database.js'
import { aFechaSinZona } from '../utils/fechaLocal.js'

export const selectBitacoraEstados = async () => {
    const result = await pool.query(`SELECT * FROM bitacora_estados`);
    return result.rows;
}

export const selectBitacoraEstadosById = async (id) => {
    const result = await pool.query(`SELECT * FROM bitacora_estados WHERE id = $1`, [id])
    return result.rows[0];
}

// created_at se manda ya calculado desde la app (no DEFAULT now() de
// Postgres) -- mismo motivo que pagos.js: la sesión de la base corre en
// UTC, y esa columna se lee de vuelta como hora LOCAL, así que un now()
// de la base se vería 6h adelantado.
export const insertBitacoraEstados = async ({ ord_id, usu_id, estado_anterior, estado_nuevo }) => {
    const creado = aFechaSinZona(new Date());
    const result = await pool.query(`INSERT INTO bitacora_estados (ord_id, usu_id, estado_anterior, estado_nuevo, created_at) VALUES
        ($1, $2, $3, $4, $5) RETURNING *`, [ord_id, usu_id, estado_anterior, estado_nuevo, creado]);
    return result.rows[0];
}

export const selectBitacoraPorOrden = async (ord_id) => {
    const result = await pool.query(
        `SELECT * FROM bitacora_estados WHERE ord_id = $1 ORDER BY id ASC`,
        [ord_id]
    );
    return result.rows;
}


