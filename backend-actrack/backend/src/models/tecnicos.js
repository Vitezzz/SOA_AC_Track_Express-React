import pool from '../config/database.js'

export const selectTecnicos = async () => {
    const result = await pool.query(`SELECT * FROM tecnicos WHERE disponible = true`);
    return result.rows;
}

export const selectTecnicoById = async (id) => {
    const result = await pool.query(`SELECT * FROM tecnicos WHERE id = $1`, [id]);
    return result.rows[0];
}

export const insertTecnicos = async ({ usu_id, esp_id }) => {
    const result = await pool.query(`INSERT INTO tecnicos (usu_id,esp_id, disponible) VALUES ($1 , $2, true)
        RETURNING *`, [usu_id, esp_id]);
    return result.rows[0];
}

export const updateTecnicos = async (id, { usu_id, esp_id, disponible }) => {
    const result = await pool.query(`UPDATE tecnicos SET usu_id = $1, esp_id = $2,
        disponible = $3 WHERE id = $4 RETURNING *`, [usu_id, esp_id, disponible, id]);
    return result.rows[0];
}

export const deleteTecnicos = async (id) => {
    const result = await pool.query(`UPDATE tecnicos SET disponible = false WHERE id = $1 RETURNING *`, [id]);
    return result.rows[0];
}

export const selectTecnicosTodos = async () => {
    const result = await pool.query(`SELECT * FROM tecnicos`);
    return result.rows;
}

export const selectTecnicosConDisponibilidad = async (fecha_programada, duracionHoras = 2, idExcluir = null) => {
    const result = await pool.query(
        `SELECT t.*,
            EXISTS (
                SELECT 1 FROM ordenes_servicio o
                WHERE o.tec_id = t.id
                  AND o.estatus != 'cancelada'
                  AND ($2::int IS NULL OR o.id != $2)
                  AND $1::timestamp < (o.fecha_programada + (o.duracion_estimada_horas || ' hours')::interval)
                  AND o.fecha_programada < ($1::timestamp + ($3 || ' hours')::interval)
            ) AS ocupado
         FROM tecnicos t`,
        [fecha_programada, idExcluir, duracionHoras]
    );
    return result.rows;
}