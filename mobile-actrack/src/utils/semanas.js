// Lunes de la semana que contiene `fecha` -- usamos esto como "llave" para
// agrupar órdenes completadas por semana.
export const inicioDeSemana = (fecha) => {
  const d = new Date(fecha);
  const dia = d.getDay(); // 0=domingo .. 6=sábado
  const diff = (dia === 0 ? -6 : 1) - dia; // días para llegar al lunes
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + diff);
  return d;
};

// Últimas `cantidad` semanas (empezando por la de hoy), en orden
// cronológico ascendente.
export const ultimasSemanas = (cantidad) => {
  const semanas = [];
  const cursor = inicioDeSemana(new Date());
  for (let i = 0; i < cantidad; i++) {
    semanas.unshift(new Date(cursor));
    cursor.setDate(cursor.getDate() - 7);
  }
  return semanas;
};

export const etiquetaSemana = (inicioSemana) => {
  const dia = inicioSemana.getDate();
  const mes = inicioSemana.toLocaleDateString('es-MX', { month: 'short' }).replace('.', '');
  return `${dia} ${mes}`;
};
