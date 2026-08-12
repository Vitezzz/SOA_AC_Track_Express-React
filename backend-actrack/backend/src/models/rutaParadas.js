import pool from "../config/database.js";

export const selectRutaParadasByRutaId = async(rut_id) => {
    const result = await pool.query(`SELECT * FROM ruta_paradas WHERE rut_id = $1`, [rut_id]);
    return result.rows;
}

export const selectRutaParadaByOrdId = async(ord_id) => {
    const result = await pool.query(`SELECT * FROM ruta_paradas WHERE ord_id = $1 ORDER BY id ASC LIMIT 1`, [ord_id]);
    return result.rows[0];
}

export const siguientePosicion = async (rut_id) => {
    const result = await pool.query(`SELECT COALESCE(MAX(posicion), 0) + 1 AS siguiente FROM ruta_paradas WHERE rut_id = $1`, [rut_id]);
    return result.rows[0].siguiente;
}

export const deleteRutaParadaByOrdId = async (ord_id) => {
    const result = await pool.query(`DELETE FROM ruta_paradas WHERE ord_id = $1 RETURNING *`, [ord_id]);
    return result.rows[0];
}

// Recorre en bloque, en SQL, las horas estimadas de las paradas que
// siguen en la ruta -- más simple y sin riesgo de desfase de zona horaria
// que ir sumando minutos a un string "HH:MM:SS" en JS.
export const retrasarParadasSiguientes = async (rut_id, posicionActual, minutos) => {
    const result = await pool.query(
        `UPDATE ruta_paradas SET hora_estimada = hora_estimada + ($1 || ' minutes')::interval
         WHERE rut_id = $2 AND posicion > $3 RETURNING *`,
        [minutos, rut_id, posicionActual]
    );
    return result.rows;
}

export const insertRutaParadas = async({ rut_id, ord_id, posicion, hora_estimada, estado }) => {
    const result = await pool.query(`INSERT INTO ruta_paradas (rut_id, ord_id, posicion, hora_estimada, estado) VALUES 
        ($1, $2, $3, $4, $5) RETURNING *`, [ rut_id, ord_id, posicion, hora_estimada, estado]);
    return result.rows[0];
}

export const updateRutaParadas = async(id , {rut_id, ord_id, posicion, hora_estimada, estado}) => {
    const result = await pool.query(`UPDATE ruta_paradas SET rut_id = $1, ord_id = $2, posicion = $3, hora_estimada = $4, 
        estado = $5 WHERE id = $6 RETURNING *`, [rut_id, ord_id, posicion, hora_estimada, estado, id]);
    return result.rows[0];
    
}

export const deleteRutaParadas = async(id) => {
    const result = await pool.query(`DELETE FROM ruta_paradas WHERE id = $1 RETURNING *`, [id]);
    return result.rows[0];
}