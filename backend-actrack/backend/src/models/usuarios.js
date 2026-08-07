import pool from "../config/database.js";

export const createUser = async ({ nombre, email, password, rol_id, paterno,
    materno
}) => {
    const result = await pool.query(
        `INSERT INTO usuarios (rol_id, nombre, paterno, materno, email, password) VALUES` +
        `($1, $2, $3, $4, $5, $6) RETURNING id, nombre, email`,
        [rol_id, nombre, paterno, materno, email, password]
    )
    return result.rows[0]
}

export const findUserByEmail = async (email) => {
    const result = await pool.query(`SELECT * FROM usuarios WHERE email = $1`, [
        email
    ])
    return result.rows[0];
}

export const findUserById = async ( id ) => {
     const result = await pool.query(`SELECT id, nombre, paterno, materno, email, rol_id FROM usuarios WHERE id = $1`,
          [id])
      return result.rows[0]
}

// Solo datos personales -- password tiene su propio flujo (verificar
// contraseña actual, hash, etc.), no se toca aquí.
export const updateUsuario = async (id, { nombre, paterno, materno, email }) => {
    const result = await pool.query(
        `UPDATE usuarios SET nombre = $1, paterno = $2, materno = $3, email = $4 WHERE id = $5
         RETURNING id, nombre, paterno, materno, email, rol_id`,
        [nombre, paterno, materno, email, id]
    );
    return result.rows[0];
}

