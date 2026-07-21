import pool from '../config/database.js'

export const getClientes = async () => {

    const result = await pool.query('SELECT * FROM clientes');
    return result.rows;
}

export const getClienteById = async (id) => {
    const result = await pool.query('SELECT  * FROM clientes WHERE id = $1', [id])
    return result.rows[0];
}

export const getClienteByEmail = async (email) => {
    const result = await pool.query('SELECT  * FROM clientes WHERE email = $1', [email])
    return result.rows[0];
}

export const createCliente = async ({ usu_id, nombre, email, telefono, direccion, activo }) => {
    const result = await pool.query('INSERT INTO clientes (usu_id, nombre, email, telefono, direccion, activo) VALUES' +
        '($1 , $2, $3, $4, $5, $6) RETURNING id, nombre, email',
        [usu_id, nombre, email, telefono, direccion, activo]
    )
    return result.rows[0];
}

export const updateCliente = async (id, { usu_id, nombre, email, telefono,
    direccion, activo }) => {
    const result = await pool.query(`UPDATE clientes SET usu_id = $1, nombre = $2, email = $3, telefono = $4,
            direccion = $5, activo = $6 WHERE id = $7 RETURNING *`,
        [usu_id, nombre, email, telefono, direccion, activo, id]
    )
    return result.rows[0];
}

export const deleteCliente = async (id) => {
    const result = await pool.query(`UPDATE clientes SET activo = false WHERE id = $1 RETURNING *`,
        [id])
    return result.rows[0];
}

export const completarPerfilCliente = async(id, {telefono, direccion}) =>{
    const result = await pool.query(`UPDATE clientes SET telefono = $1, direccion = $2, perfil_completo = true WHERE id = $3 RETURNING *`,
        [telefono, direccion , id]
    )
    return result.rows[0];
}

