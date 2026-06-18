import pool from "../config/database.js"

export const getRoles = async() => {
    const result = await pool.query(`SELECT * FROM roles`)
    return result.rows;
}

export const getRolesById = async(id) =>{
    const result = await pool.query(`SELECT * FROM roles WHERE id = $1`, [id])
    return result.rows[0];
} 