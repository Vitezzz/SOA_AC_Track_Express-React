import pool from '../config/database.js'

export const selectChecklistEjecucion = async (ord_id) => {
    const result = await pool.query(`SELECT * FROM checklist_ejecucion WHERE ord_id = $1`, 
        [ord_id]);
    return result.rows;
}

export const insertChecklistEjecucion = async({ che_id, ord_id, item_desc, completado, total, notas}) => {
    const result = await pool.query(`INSERT INTO checklist_ejecucion (che_id, ord_id, item_desc, completado, total, notas) VALUES
        ($1, $2, $3, $4, $5, $6) RETURNING *`, [ che_id, ord_id, item_desc, completado, total, notas ]);
    return result.rows[0]
}

export const updateChecklistEjecucion = async(id , { che_id, ord_id, item_desc, completado, total, notas}) => {
    const result = await pool.query(`UPDATE checklist_ejecucion SET che_id = $1, 
        ord_id = $2, item_desc = $3, completado = $4, total = $5, notas = $6 WHERE id = $7 RETURNING *`, 
        [che_id, ord_id, item_desc, completado, total, notas, id])
    return result.rows[0];
}