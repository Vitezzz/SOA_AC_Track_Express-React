import pool from '../config/database.js'

export const selectCotizaciones = async () => {
    const result = await pool.query(`SELECT * FROM cotizaciones`);
    return result.rows;
}

export const selectCotizacionesById = async (id) => {
    const result = await pool.query(`SELECT * FROM cotizaciones WHERE id = $1`, [id]);
    return result.rows[0];
}

export const selectCotizacionesByCliente = async (cli_id) => {
    const result = await pool.query(
        `SELECT * FROM cotizaciones WHERE cli_id = $1 AND estado != 'borrador'`,
        [cli_id]
    );
    return result.rows;
}

// Igual que selectPagosByTecnico (models/pagos.js): se filtra por el
// técnico ASIGNADO A LA ORDEN (ordenes_servicio.tec_id), no por
// cotizaciones.tec_id -- ese es "quién la redactó", que puede quedar
// desactualizado si la orden se reasigna a otro técnico después.
export const selectCotizacionesByTecnico = async (tec_id) => {
    const result = await pool.query(
        `SELECT c.* FROM cotizaciones c
         JOIN ordenes_servicio o ON c.ord_id = o.id
         WHERE o.tec_id = $1 AND c.estado != 'borrador'`,
        [tec_id]
    );
    return result.rows;
}
export const insertCotizaciones = async ({ ord_id, tec_id, cli_id, folio, estado, total,
    notas
}) => {
    const result = await pool.query(`INSERT INTO cotizaciones (ord_id, tec_id, cli_id, folio, estado, total,
    notas) VALUES ( $1, $2, $3, $4, $5, $6, $7) RETURNING *`, [ord_id, tec_id, cli_id, folio, estado, total,
        notas]);
    return result.rows[0];
}

export const updateCotizaciones = async (id, { ord_id, tec_id, cli_id, folio, estado, total,
    notas }) => {
    const result = await pool.query(`UPDATE cotizaciones SET ord_id = $1,  tec_id = $2, cli_id = $3, folio = $4, 
            estado = $5, total = $6 , notas = $7 WHERE id = $8 RETURNING *` ,
        [ord_id, tec_id, cli_id, folio, estado, total,
            notas, id])
    return result.rows[0];
}

export const deleteCotizaciones = async (id) => {
    const result = await pool.query(`DELETE FROM cotizaciones WHERE id = $1 RETURNING  *`, [id]);
    return result.rows[0];
}

export const generarSiguienteFolioCotizacion = async () => {
    const anio = new Date().getFullYear();

    const result = await pool.query(
        `SELECT folio FROM cotizaciones WHERE folio LIKE $1 ORDER BY folio DESC LIMIT 1`,
        [`COT-${anio}-%`]
    );

    const ultimoFolio = result.rows[0]?.folio;
    const siguienteNumero = ultimoFolio ? parseInt(ultimoFolio.split('-')[2], 10) + 1 : 1;

    return `COT-${anio}-${String(siguienteNumero).padStart(3, '0')}`;
}

// "client" es la conexión DENTRO de una transacción -- se usa junto con
// insertar/editar/borrar un renglón de cotizacion_detalle, para que el
// total quede sincronizado en la misma operación, nunca desfasado.
export const recalcularTotalCotizacion = async (client, cot_id) => {
    const result = await client.query(
        `UPDATE cotizaciones SET total = (
            SELECT COALESCE(SUM(subtotal), 0) FROM cotizacion_detalle WHERE cot_id = $1
        ) WHERE id = $1 RETURNING *`,
        [cot_id]
    );
    return result.rows[0];
}

export const selectCotizacionAprobadaPorOrden = async (ord_id) => {
    const result = await pool.query(
        `SELECT * FROM cotizaciones WHERE ord_id = $1 AND estado = 'aprobada' ORDER BY id DESC LIMIT 1`,
        [ord_id]
    );
    return result.rows[0];
}