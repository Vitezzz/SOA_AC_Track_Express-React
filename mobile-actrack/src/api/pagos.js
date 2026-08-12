// Ya viene auto-filtrada a los pagos de las órdenes del técnico logueado
// (rol_id=4 -> selectPagosByTecnico en el backend, vía ordenes_servicio.tec_id).
export const getMisPagos = async (apiFetch) => {
  const res = await apiFetch('/api/pagos');
  if (res.status === 404) return [];
  if (!res.ok) throw new Error('No se pudieron cargar los pagos');
  return res.json();
};

// El técnico siempre registra el cobro como YA recibido (estado: 'pagado')
// -- está confirmando dinero que ya tiene en la mano, no una expectativa
// futura. El backend valida que no exceda el saldo pendiente de la
// cotización aprobada de la orden.
export const registrarPago = async (apiFetch, { ord_id, cli_id, metodo, monto }) => {
  const res = await apiFetch('/api/pagos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ord_id, cli_id, metodo, monto, estado: 'pagado' }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'No se pudo registrar el pago');
  return data;
};
