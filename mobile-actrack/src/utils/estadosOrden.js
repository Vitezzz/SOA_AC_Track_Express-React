// Mismo criterio que Desktop usa para filtrar "órdenes pendientes" en
// PlanificarRuta.jsx (o.estatus !== "cancelada" && ... !== "completada" && ... !== "pagada").
export const ordenEstaCerrada = (estatus) =>
  estatus === 'completada' || estatus === 'cancelada' || estatus === 'pagada';
