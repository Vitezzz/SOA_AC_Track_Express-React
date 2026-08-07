import pool from '../config/database.js';
import { upsertReporteCache } from '../models/reportes_cache.js';

export const recalcularTodosLosReportes = async () => {
    // 1) Órdenes por estado
    const resOrdenesPorEstado = await pool.query(
        `SELECT estatus, COUNT(*) AS cantidad FROM ordenes_servicio GROUP BY estatus`
    );
    await upsertReporteCache('ordenes_por_estado', resOrdenesPorEstado.rows);

    // 2) Técnico más productivo (versión resumida, para el Dashboard)
    const resTecnicoProductivo = await pool.query(
        `SELECT t.id AS tec_id, t.usu_id, COUNT(o.id) AS ordenes_completadas
         FROM tecnicos t
         LEFT JOIN ordenes_servicio o ON o.tec_id = t.id AND o.estatus IN ('completada', 'pagada')
         GROUP BY t.id, t.usu_id
         ORDER BY ordenes_completadas DESC`
    );
    await upsertReporteCache('tecnico_mas_productivo', resTecnicoProductivo.rows);

    // 3) Ingresos del mes
    const resIngresosMes = await pool.query(
        `SELECT TO_CHAR(created_at, 'YYYY-MM') AS mes, SUM(monto) AS total
         FROM pagos
         WHERE estado = 'pagado'
         GROUP BY mes
         ORDER BY mes`
    );
    await upsertReporteCache('ingresos_mes', resIngresosMes.rows);

    // 4) Stock crítico
    const resStockCritico = await pool.query(
        `SELECT id, nombre, stock_actual, stock_minimo
         FROM inventario
         WHERE stock_actual <= stock_minimo`
    );
    await upsertReporteCache('stock_critico', resStockCritico.rows);

    // 5) Productividad detallada -- versión completa para el reporte de
    // exportación, no solo "quién va ganando" sino el desglose por técnico.
    const resProductividad = await pool.query(
        `SELECT t.id AS tec_id, t.usu_id,
                COUNT(o.id) FILTER (WHERE o.estatus IN ('completada', 'pagada')) AS completadas,
                COUNT(o.id) FILTER (WHERE o.estatus = 'cancelada') AS canceladas,
                COUNT(o.id) AS total_asignadas
         FROM tecnicos t
         LEFT JOIN ordenes_servicio o ON o.tec_id = t.id
         GROUP BY t.id, t.usu_id
         ORDER BY completadas DESC`
    );
    await upsertReporteCache('productividad_tecnicos', resProductividad.rows);

    // 6) Cobros -- desglose de pagos por método y estado, con totales.
    const resCobros = await pool.query(
        `SELECT metodo, estado, COUNT(*) AS cantidad, SUM(monto) AS total
         FROM pagos
         GROUP BY metodo, estado
         ORDER BY metodo, estado`
    );
    await upsertReporteCache('cobros', resCobros.rows);

    return true;
}