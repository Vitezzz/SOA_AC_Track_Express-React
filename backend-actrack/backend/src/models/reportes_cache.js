import pool from '../config/database.js'

export const selectReportesCache = async () => {
    const result = await pool.query(`SELECT * FROM reportes_cache`);
    return result.rows;
}

// "Upsert" -- si ya existe una fila con ese tipo_reporte, la actualiza;
// si no existe, la crea. Necesita que tipo_reporte tenga UNIQUE (ya lo
// definimos así en el CREATE TABLE) para que ON CONFLICT sepa a qué
// fila exacta debe "chocar" y decidir actualizar en vez de duplicar.
export const upsertReporteCache = async (tipo_reporte, datos) => {
    const result = await pool.query(
        `INSERT INTO reportes_cache (tipo_reporte, datos, generado_en)
         VALUES ($1, $2, NOW())
         ON CONFLICT (tipo_reporte) DO UPDATE SET datos = $2, generado_en = NOW()
         RETURNING *`,
        [tipo_reporte, JSON.stringify(datos)]
    );
    return result.rows[0];
}