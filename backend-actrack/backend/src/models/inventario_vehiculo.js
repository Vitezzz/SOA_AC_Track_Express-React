import pool from '../config/database.js'

export const selectInventarioVehiculoByTecnico = async (tec_id) => {
    const result = await pool.query(`SELECT * FROM inventario_vehiculo WHERE tec_id = $1`, [tec_id]);
    return result.rows;
}

export const selectInventarioVehiculoTodo = async () => {
    const result = await pool.query(`SELECT * FROM inventario_vehiculo`);
    return result.rows;
}

// "client" aquí es la conexión DENTRO de una transacción (no el pool
// general) -- así el descuento del almacén y el ajuste del vehículo
// ocurren juntos, o ninguno de los dos.
export const upsertInventarioVehiculo = async (client, inv_id, tec_id, cantidad) => {
    const existente = await client.query(
        `SELECT * FROM inventario_vehiculo WHERE inv_id = $1 AND tec_id = $2`,
        [inv_id, tec_id]
    );

    if (existente.rows.length > 0) {
        const result = await client.query(
            `UPDATE inventario_vehiculo SET cantidad = cantidad + $1 WHERE inv_id = $2 AND tec_id = $3 RETURNING *`,
            [cantidad, inv_id, tec_id]
        );
        return result.rows[0];
    } else {
        const result = await client.query(
            `INSERT INTO inventario_vehiculo (inv_id, tec_id, cantidad) VALUES ($1, $2, $3) RETURNING *`,
            [inv_id, tec_id, cantidad]
        );
        return result.rows[0];
    }
}

// "client" es la conexión de la transacción -- para descontar el stock
// del vehículo al mismo tiempo que se agrega el renglón de la cotización.
export const descontarInventarioVehiculo = async (client, tec_id, inv_id, cantidad) => {
    const result = await client.query(
        `UPDATE inventario_vehiculo SET cantidad = cantidad - $1 WHERE tec_id = $2 AND inv_id = $3 RETURNING *`,
        [cantidad, tec_id, inv_id]
    );
    return result.rows[0];
}

export const selectInventarioVehiculoPorTecnicoYArticulo = async (tec_id, inv_id) => {
    const result = await pool.query(
        `SELECT * FROM inventario_vehiculo WHERE tec_id = $1 AND inv_id = $2`,
        [tec_id, inv_id]
    );
    return result.rows[0];
}