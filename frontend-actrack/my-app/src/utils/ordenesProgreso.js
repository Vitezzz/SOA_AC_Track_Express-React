// Única fuente de verdad del orden de etapas -- lo usan tanto el timeline
// (LineaTiempoEstado) como el ordenamiento de "Mis Órdenes".
export const ETAPAS_ORDEN = ["pendiente", "en_proceso", "completada", "pagada"];

// Índice de la etapa más avanzada que el historial REAL de bitácora dice
// que la orden alcanzó -- no asumimos que llegar a una etapa implica haber
// pasado por las anteriores, solo leemos lo que de verdad ocurrió.
export const indiceProgreso = (historial = []) => {
    let indice = -1;
    ETAPAS_ORDEN.forEach((etapa, i) => {
        if (historial.includes(etapa)) indice = Math.max(indice, i);
    });
    return indice;
};

// "Activa" = todavía le falta algo (no terminó ni se canceló). Sirve para
// separar lo que el cliente sigue esperando de lo que ya es historial.
export const ordenEstaActiva = (estatus) =>
    estatus !== "completada" && estatus !== "pagada" && estatus !== "cancelada";
