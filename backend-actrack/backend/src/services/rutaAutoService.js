import { selectRutaByTecnicoYFecha, insertRutas } from '../models/rutas.js';
import {
    selectRutaParadaByOrdId, insertRutaParadas, updateRutaParadas,
    deleteRutaParadaByOrdId, siguientePosicion
} from '../models/rutaParadas.js';

// "YYYY-MM-DD" en LOCAL -- mismo criterio que PlanificarRuta.jsx en
// desktop (aFechaLocal): fecha_programada llega como Date, y
// toISOString() la corre al día siguiente en cuanto la hora local pasa
// las 6pm (somos UTC-6). Nunca usar toISOString() para esto.
const aFechaLocal = (fecha) => {
    const d = new Date(fecha);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const aHoraLocal = (fecha) => {
    const d = new Date(fecha);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:00`;
};

// Antes, asignar un técnico a una orden (crearla o editarla) no la ponía
// en ningún lado que el técnico pudiera ver -- "Planificar Ruta" es un
// paso APARTE que nadie hacía para cada orden nueva, así que la orden
// asignada nunca aparecía en Mi Agenda del técnico en mobile. Esto la
// mete sola a la ruta del técnico para ese día (creándola si no existe),
// como última parada -- sin optimizar el orden ni el ETA con OSRM, eso
// sigue siendo trabajo de "Planificar Ruta" si el admin quiere afinarlo
// después. Es un fallback razonable, no un reemplazo de esa pantalla.
export const sincronizarRutaParada = async (orden) => {
    const existente = await selectRutaParadaByOrdId(orden.id);

    // Sin técnico o sin fecha -- no hay ruta que armar. Si ya tenía una
    // parada de antes (se le quitó el técnico o la fecha), se quita.
    if (!orden.tec_id || !orden.fecha_programada) {
        if (existente) await deleteRutaParadaByOrdId(orden.id);
        return;
    }

    const fechaStr = aFechaLocal(orden.fecha_programada);
    const horaStr = aHoraLocal(orden.fecha_programada);

    let ruta = await selectRutaByTecnicoYFecha(orden.tec_id, fechaStr);
    if (!ruta) {
        ruta = await insertRutas({ fecha_ruta: fechaStr, estado: 'planificada', tecnico_id: orden.tec_id });
    }

    // Ya estaba en la ruta correcta (mismo técnico, mismo día) -- solo se
    // actualiza la hora por si cambió fecha_programada, sin tocar su
    // posición (no hay por qué reordenar solo por esto).
    if (existente && existente.rut_id === ruta.id) {
        await updateRutaParadas(existente.id, { ...existente, hora_estimada: horaStr });
        return;
    }

    // Estaba en la ruta de OTRO día/técnico (se reasignó o se reagendó) --
    // se quita de ahí y se vuelve a poner, al final, en la ruta correcta.
    if (existente) {
        await deleteRutaParadaByOrdId(orden.id);
    }

    const posicion = await siguientePosicion(ruta.id);
    await insertRutaParadas({ rut_id: ruta.id, ord_id: orden.id, posicion, hora_estimada: horaStr, estado: 'pendiente' });
}
