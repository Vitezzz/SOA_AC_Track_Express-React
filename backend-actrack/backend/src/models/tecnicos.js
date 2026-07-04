import pool from '../config/database.js'

export const selectTecnicos = async() => {
    const result = await pool.query(`SELECT * FROM tecnicos WHERE disponible = true`);
    return result.rows;
}

export const selectTecnicoById = async(id) => {
    const result = await pool.query(`SELECT * FROM tecnicos WHERE id = $1`, [id]);
    return result.rows[0];
}

export const insertTecnicos = async({ usu_id,esp_id }) => {
    const result = await pool.query(`INSERT INTO tecnicos (usu_id,esp_id, disponible) VALUES ($1 , $2, true)
        RETURNING *`, [usu_id,esp_id]);
    return result.rows[0];
}

export const updateTecnicos = async( id, { usu_id,esp_id, disponible }) =>{
    const result = await pool.query(`UPDATE tecnicos SET usu_id = $1, esp_id = $2,
        disponible = $3 WHERE id = $4 RETURNING *`, [usu_id, esp_id, disponible, id]);
    return result.rows[0];
}

export const deleteTecnicos = async(id) => {
    const result = await pool.query(`UPDATE tecnicos SET disponible = false WHERE id = $1 RETURNING *`, [id]);
    return result.rows[0];
}


