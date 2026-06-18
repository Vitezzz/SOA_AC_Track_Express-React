import pool from '../config/database.js'

export const getMarcas = async() => {
    const result = await pool.query('SELECT * FROM marca');
    return result.rows;
}

export const crearMarca = async({ nombre }) => {
    const result = await pool.query(`INSERT INTO marca (nombre) VALUES ($1) RETURNING *`, [nombre]);
    return result.rows[0];
}

export const getMarcaId = async (id) => {
    const result = await pool.query(`SELECT * FROM marca WHERE id = $1`, [id]);
    return result.rows[0]
}

export const updateMarca = async(id, {nombre}) => {
    const result = await pool.query(`UPDATE marca SET nombre=$1 WHERE id=$2 RETURNING *`, [nombre, id]);
    return result.rows[0];
}

export const deleteMarca = async(id) => {
    const result = await pool.query(`DELETE FROM marca WHERE id =$1`, [id])
    return result.rows[0];
}
