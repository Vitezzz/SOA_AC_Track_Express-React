import pool from '../config/database.js';

export const selectChecklistItemsPlantilla = async () => {
    const result = await pool.query(`SELECT * FROM checklist_items_plantilla`);
    return result.rows;
}

export const selectChecklistItemsPlantillaById = async (id) => {
    const result = await pool.query(`SELECT * FROM checklist_items_plantilla WHERE id = $1`, [id]);
    return result.rows[0];
}

export const insertChecklistItemsPlantilla = async ({ che_id, descripcion, orden }) => {
    const result = await pool.query(`INSERT INTO checklist_items_plantilla 
        (che_id, descripcion, orden) VALUES ($1, $2, $3) RETURNING *`, [che_id, descripcion, orden])
    return result.rows[0];
}

export const updateChecklistItemsPlantilla = async (id, { che_id, descripcion, orden }) => {
    const result = await pool.query(`UPDATE checklist_items_plantilla SET 
        che_id = $1, descripcion = $2, orden = $3 WHERE id = $4 RETURNING *`,
        [che_id, descripcion, orden, id]);
    return result.rows[0]
}

export const deleteChecklistItemsPlantilla = async(id) => {
    const result = await pool.query(`DELETE FROM checklist_items_plantilla WHERE id = $1 RETURNING *`, [id])
    return result.rows[0];
}