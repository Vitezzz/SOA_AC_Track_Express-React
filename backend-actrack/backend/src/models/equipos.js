import pool from '../config/database.js'

export const getEquipos = async () => {
    const result = await pool.query('SELECT * FROM equipos_ac');
    return result.rows
}

export const getEquipoById = async (id) => {
    const result = await pool.query('SELECT * FROM equipos_ac WHERE id = $1', [id]);
    return result.rows[0];
}

export const selectEquiposByCliente = async (cli_id) => {
    const result = await pool.query(`SELECT * FROM equipos_ac WHERE cli_id =$1`, [cli_id]);
    return result.rows;
}

export const createEquipo = async ({ cli_id, mar_id, modelo, numero_serie, tipo, imagen_url }) => {
    const result = await pool.query(`INSERT INTO equipos_ac (cli_id, mar_id, modelo, numero_serie, tipo, imagen_url) VALUES
         ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [cli_id, mar_id, modelo, numero_serie, tipo, imagen_url || null]);
    return result.rows[0];
}

export const updateEquipo = async (id, { cli_id, mar_id, modelo, numero_serie, tipo, imagen_url }) => {
    const result = await pool.query(`UPDATE equipos_ac SET cli_id = $1, mar_id = $2, modelo = $3,
         numero_serie = $4, tipo = $5, imagen_url = $6 WHERE id = $7 RETURNING *`,
        [cli_id, mar_id, modelo, numero_serie, tipo, imagen_url || null, id])
    return result.rows[0];
}

export const deleteEquipo = async (id) => {
    const result = await pool.query(`UPDATE equipos_ac SET activo = false WHERE id = $1 RETURNING * `,
        [id]);
    return result.rows[0];
}

export const getEquipoByNumeroSerie = async (numero_serie) => {
    const result = await pool.query(`SELECT * FROM equipos_ac WHERE numero_serie = $1`, [numero_serie]);
    return result.rows[0];
}

