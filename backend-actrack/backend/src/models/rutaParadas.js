import pool from "../config/database.js";

export const selectRutaParadasByRutaId = async(rut_id) => {
    const result = await pool.query(`SELECT * FROM ruta_paradas WHERE rut_id = $1`, [rut_id]);
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