import { selectRutaParadaByOrdId, retrasarParadasSiguientes } from '../models/rutaParadas.js';
import { selectRutasById } from '../models/rutas.js';
import { selectOrdenesServicioById } from '../models/ordenes_servicio.js';
import { getClienteById } from '../models/clientes.js';
import { insertNotificaciones } from '../models/notificaciones.js';

// Solo se avisa si el atraso es real, no ruido de un par de minutos por
// tráfico normal o el GPS tardándose en confirmar la llegada.
const UMBRAL_MINUTOS = 10;

// "YYYY-MM-DD" en LOCAL -- fecha_ruta llega como Date (medianoche local,
// ver el mismo problema que se resolvió en PlanificarRuta.jsx: usar
// getters locales, NUNCA toISOString(), que da la fecha en UTC).
const aFechaLocal = (fecha) =>
    `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;

// Se llama justo cuando el técnico marca "llegué" a una orden. Si llegó
// tarde respecto a su hora_estimada planeada, recorre las paradas
// SIGUIENTES de esa misma ruta (mismo técnico, mismo día) ese mismo
// número de minutos, y avisa a los clientes afectados con la nueva hora
// aproximada -- así el horario que ve todo el mundo sigue siendo real,
// no el que se calculó una vez en la mañana y ya no significa nada.
export const recalcularRetrasoRuta = async (ord_id) => {
    const parada = await selectRutaParadaByOrdId(ord_id);
    if (!parada) return; // Orden sin ruta planeada -- nada que recorrer.

    const ruta = await selectRutasById(parada.rut_id);
    if (!ruta) return;

    const estimado = new Date(`${aFechaLocal(ruta.fecha_ruta)}T${parada.hora_estimada}`);
    const retrasoMinutos = Math.round((Date.now() - estimado.getTime()) / 60000);

    if (retrasoMinutos < UMBRAL_MINUTOS) return;

    const paradasAfectadas = await retrasarParadasSiguientes(parada.rut_id, parada.posicion, retrasoMinutos);

    for (const p of paradasAfectadas) {
        const orden = await selectOrdenesServicioById(p.ord_id);
        if (!orden) continue;
        const cliente = await getClienteById(orden.cli_id);
        if (!cliente?.usu_id) continue;

        await insertNotificaciones({
            usu_id: cliente.usu_id,
            tipo: 'retraso_ruta',
            titulo: `Tu técnico va retrasado -- nueva hora estimada para tu orden ${orden.folio}: ${p.hora_estimada.slice(0, 5)}`,
            leido: false,
        });
    }
}
