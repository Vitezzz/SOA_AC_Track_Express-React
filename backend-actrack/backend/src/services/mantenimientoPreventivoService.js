import { selectMantenimientoPreventivo, updateMantenimientoPreventivo } from '../models/mantenimientoPreventivo.js';
import { getClienteById } from '../models/clientes.js';
import { getEquipoById } from '../models/equipos.js';
import { insertOrdenesServicio, generarSiguienteFolio } from '../models/ordenes_servicio.js';
import { insertBitacoraEstados } from '../models/bitacora_estados.js';
import { insertNotificaciones } from '../models/notificaciones.js';
import { enviarSMS } from '../utils/smsService.js';

const CAT_MANTENIMIENTO_ID = 3; // categoria_servicio "Mantenimiento"
const PRI_NORMAL_ID = 3; // prioridad num_prioridad = 2 ("normal")

// Revisa mantenimiento_preventivo activos cuya proxima_fecha ya llegó,
// genera automáticamente la orden de servicio correspondiente, notifica al
// cliente (push + SMS) y recorre proxima_fecha al siguiente ciclo -- así
// nunca se genera dos veces la misma fecha. Se llama desde un cron diario
// (ver index.js) y también manualmente desde Configuración para probar.
export const generarOrdenesVencidas = async () => {
    const todos = await selectMantenimientoPreventivo();
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const vencidos = todos.filter((m) => m.activo && new Date(m.proxima_fecha) <= hoy);

    const resultados = [];
    for (const mantenimiento of vencidos) {
        try {
            const cliente = await getClienteById(mantenimiento.cli_id);
            if (!cliente) continue;

            const equipo = mantenimiento.equ_id ? await getEquipoById(mantenimiento.equ_id) : null;

            const folio = await generarSiguienteFolio();
            const nuevaOrden = await insertOrdenesServicio({
                cli_id: mantenimiento.cli_id,
                equ_id: mantenimiento.equ_id,
                cat_id: CAT_MANTENIMIENTO_ID,
                pri_id: PRI_NORMAL_ID,
                folio,
                prioridad: 'normal',
                estatus: 'pendiente',
                descripcion: `Mantenimiento preventivo programado${equipo ? ` — ${equipo.tipo || 'equipo'}${equipo.modelo ? ` ${equipo.modelo}` : ''}` : ''}`,
                fecha_programada: mantenimiento.proxima_fecha,
                fecha_cierre: null,
                tec_id: null,
                duracion_estimada_horas: 2,
            });

            // usu_id null = evento generado por el sistema, no por una
            // persona -- la columna ya lo permite (nullable).
            await insertBitacoraEstados({
                ord_id: nuevaOrden.id,
                usu_id: null,
                estado_anterior: null,
                estado_nuevo: nuevaOrden.estatus,
            });

            if (cliente.usu_id) {
                await insertNotificaciones({
                    usu_id: cliente.usu_id,
                    tipo: 'nueva_orden',
                    titulo: `Mantenimiento preventivo programado — orden ${folio}`,
                    leido: false,
                });
            }

            await enviarSMS(
                cliente.telefono,
                `AC Track: es momento de tu mantenimiento preventivo. Generamos la orden ${folio}, pronto te contactaremos para agendar.`
            );

            // Avanza al siguiente ciclo. Si el equipo estuvo abandonado
            // varios ciclos (proxima_fecha muy vieja), recalcula desde HOY
            // en vez de encimar fechas que ya quedaron todas en el pasado.
            const siguienteFecha = new Date(mantenimiento.proxima_fecha);
            siguienteFecha.setDate(siguienteFecha.getDate() + mantenimiento.frecuencia_dias);
            const fechaFinal =
                siguienteFecha <= hoy
                    ? new Date(hoy.getTime() + mantenimiento.frecuencia_dias * 24 * 60 * 60 * 1000)
                    : siguienteFecha;

            await updateMantenimientoPreventivo(mantenimiento.id, {
                cli_id: mantenimiento.cli_id,
                equ_id: mantenimiento.equ_id,
                frecuencia_dias: mantenimiento.frecuencia_dias,
                proxima_fecha: fechaFinal.toISOString().slice(0, 10),
                activo: mantenimiento.activo,
            });

            resultados.push({ mantenimiento_id: mantenimiento.id, orden_folio: folio, cliente: cliente.nombre });
        } catch (err) {
            console.error(`Error generando orden para mantenimiento ${mantenimiento.id}:`, err.message);
        }
    }

    return resultados;
};
