import pool from "../config/database.js";

export const selectRutas = async() => {
    const result = await pool.query(`SELECT * FROM rutas`);
    return result.rows;
}

export const selectRutasById = async(id) => {
    const result = await pool.query(`SELECT * FROM rutas WHERE id = $1`, [id]);
    return result.rows[0];
}

export const insertRutas = async( {fecha_ruta, estado}) => {
    const result = await pool.query(`INSERT INTO rutas (fecha_ruta, estado) VALUES 
        ($1, $2) RETURNING *`, [fecha_ruta, estado]);
    return result.rows[0];
}

export const updateRutas = async( id,{fecha_ruta, estado}) =>{
    const result = await pool.query(`UPDATE rutas SET fecha_ruta = $1, estado = $2
        WHERE id = $3 RETURNING *`, [fecha_ruta, estado, id]);
    return result.rows[0];
}

export const deleteRutas = async(id) => {
    const result = await pool.query(`DELETE FROM rutas WHERE id = $1 RETURNING *`, [id]);
    return result.rows[0];
}