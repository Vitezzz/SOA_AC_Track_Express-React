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

export const createEquipo = async ({ cli_id, mar_id, modelo, numero_serie, tipo }) => {
    const result = await pool.query(`INSERT INTO equipos_ac (cli_id, mar_id, modelo, numero_serie, tipo) VALUES
        ($1, $2, $3, $4, $5) RETURNING id, cli_id, mar_id, modelo, numero_serie,tipo`,
        [cli_id, mar_id, modelo, numero_serie, tipo]);
    return result.rows[0];
}

export const updateEquipo = async (id, { cli_id, mar_id, modelo, numero_serie, tipo }) => {
    const result = await pool.query(`UPDATE equipos_ac SET cli_id = $1, mar_id = $2, modelo = $3,
        numero_serie = $4, tipo = $5 WHERE id = $6 RETURNING id, cli_id, mar_id, modelo, numero_serie, tipo`,
        [cli_id, mar_id, modelo, numero_serie, tipo, id])
    return result.rows[0];
}

export const deleteEquipo = async (id) => {
    const result = await pool.query(`UPDATE equipos_ac SET activo = false WHERE id = $1 RETURNING * `,
        [id]);
    return result.rows[0];
}
