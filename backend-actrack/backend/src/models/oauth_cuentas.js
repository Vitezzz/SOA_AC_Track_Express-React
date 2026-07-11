import pool from "../config/database.js";

export const selectOauthCuentas = async () => {
    const result = await pool.query(`SELECT * FROM oauth_cuentas`)
    return result.rows;
}

export const selectOauthCuentasById = async(id) => {
    const result = await pool.query(`SELECT * FROM oauth_cuentas WHERE id = $1`, [id])
    return result.rows[0];
}

export const selectOauthCuentaByProvider = async (provider_uid, proveedor) => {
    const result = await pool.query(
        'SELECT * FROM oauth_cuentas WHERE provider_uid = $1 AND proveedor = $2',
        [provider_uid, proveedor]
    )
    return result.rows[0]
}

export const insertOauthCuentas = async ({ usu_id, proveedor, provider_uid}) => {
    const result = await pool.query(`INSERT INTO oauth_cuentas (usu_id, proveedor, provider_uid) VALUES 
        ($1, $2, $3) RETURNING *`, [usu_id, proveedor, provider_uid])
    return result.rows[0]
}

export const updateOauthCuentas = async (id , { usu_id, proveedor, provider_uid}) => {
    const result = await pool.query(`UPDATE oauth_cuentas SET usu_id = $1, 
        proveedor = $2, provider_uid = $3 WHERE id = $4 RETURNING *`, [usu_id, proveedor, provider_uid,id]);
    return result.rows[0];
}

export const deleteOauthCuentas = async (id) => {
    const result = await pool.query(`DELETE FROM oauth_cuentas WHERE id = $1 RETURNING *`, [id]);
    return result.rows[0];
}