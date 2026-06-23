import pool from '../config/database.js'

export const selectChecklistPlantillas = async() => {
    const result = await pool.query(`SELECT * FROM checklist_plantillas`);
    return result.rows;
}

export const selectChecklistPlantillasById = async(id) => {
    const result = await pool.query(`SELECT * FROM checklist_plantillas WHERE id = $1`, [id]);
    return result.rows[0];
}

export const insertChecklistPlantillas = async({ cat_id, nombre, activo}) => {
    const result = await pool.query(`INSERT INTO checklist_plantillas (cat_id, nombre, activo) VALUES 
        ($1, $2, $3) RETURNING *`, [cat_id, nombre, activo]);
    return result.rows[0];
}

export const updateChecklistPlantillas = async(id , { cat_id, nombre, activo}) => {
    const result = await pool.query(`UPDATE checklist_plantillas SET cat_id = $1, nombre = $2, activo = $3
        WHERE id = $4 RETURNING *`, [cat_id, nombre, activo, id]);
    return result.rows[0]
}

export const deleteChecklistPlantillas = async(id) => {
    const result = await pool.query('UPDATE checklist_plantillas SET activo = false WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
}