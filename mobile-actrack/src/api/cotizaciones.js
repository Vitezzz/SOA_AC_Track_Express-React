// Ya viene auto-filtrada a las cotizaciones de las órdenes del técnico
// logueado (rol_id=4 -> selectCotizacionesByTecnico en el backend).
export const getMisCotizaciones = async (apiFetch) => {
  const res = await apiFetch('/api/cotizaciones');
  if (res.status === 404) return [];
  if (!res.ok) throw new Error('No se pudieron cargar las cotizaciones');
  return res.json();
};

// Se crea siempre en 'borrador' con total 0 -- el total se calcula solo
// en el backend según los renglones que se agreguen después
// (recalcularTotalCotizacion). Recién ahí se puede pasar a 'enviada'.
export const crearCotizacion = async (apiFetch, { ord_id, tec_id, cli_id, notas }) => {
  const res = await apiFetch('/api/cotizaciones', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ord_id, tec_id, cli_id, estado: 'borrador', total: 0, notas }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'No se pudo crear la cotización');
  return data;
};

// PUT es full-replace -- se manda la cotización completa aunque solo
// cambie el estado (p.ej. de 'borrador' a 'enviada' cuando ya se
// agregaron los renglones).
export const actualizarCotizacion = async (apiFetch, id, { ord_id, tec_id, cli_id, folio, estado, total, notas }) => {
  const res = await apiFetch(`/api/cotizaciones/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ord_id, tec_id, cli_id, folio, estado, total, notas }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'No se pudo actualizar la cotización');
  return data;
};

// Sin filtro por cot_id en el backend (igual que desktop) -- se trae todo
// lo del técnico y se filtra en el cliente.
export const getMisRenglonesCotizacion = async (apiFetch) => {
  const res = await apiFetch('/api/cotizacion_detalle');
  if (res.status === 404) return [];
  if (!res.ok) throw new Error('No se pudieron cargar los renglones');
  return res.json();
};

export const agregarRenglonCotizacion = async (apiFetch, { inv_id, cot_id, cantidad, precio_unitario, es_mano_obra, concepto }) => {
  const res = await apiFetch('/api/cotizacion_detalle', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      inv_id: es_mano_obra ? null : inv_id,
      cot_id, cantidad, precio_unitario, es_mano_obra,
      concepto: es_mano_obra ? concepto : null,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'No se pudo agregar el renglón');
  return data;
};
