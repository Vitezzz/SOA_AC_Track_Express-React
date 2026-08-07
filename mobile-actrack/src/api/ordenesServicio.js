// Ya viene auto-filtrada a las órdenes del técnico logueado (rol_id=4 ->
// selectOrdenesByTecnico en el backend).
export const getMisOrdenes = async (apiFetch) => {
  const res = await apiFetch('/api/ordenes_servicio');
  if (!res.ok) throw new Error('No se pudieron cargar tus órdenes');
  return res.json();
};

export const getOrdenById = async (apiFetch, id) => {
  const res = await apiFetch(`/api/ordenes_servicio/${id}`);
  if (!res.ok) throw new Error('No se pudo cargar la orden de servicio');
  return res.json();
};

// PUT es full-replace en este backend -- hay que reenviar todos los campos,
// no solo el que cambia. `orden` debe ser el objeto completo ya cargado
// (de getOrdenById) con los campos a modificar ya mezclados encima.
export const actualizarOrden = async (apiFetch, id, orden) => {
  const res = await apiFetch(`/api/ordenes_servicio/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orden),
  });
  if (!res.ok) throw new Error((await res.json()).message || 'No se pudo actualizar la orden');
  return res.json();
};
