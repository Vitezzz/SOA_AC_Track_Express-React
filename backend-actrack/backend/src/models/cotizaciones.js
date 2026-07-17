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
    const result = await pool.query(`SELECT * FROM cotizaciones WHERE cli_id = $1`, [cli_id]);
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