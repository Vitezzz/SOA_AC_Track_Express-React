// estado_nuevo 'tecnico_en_camino' / 'tecnico_llego' son los dos valores
// que el backend reconoce para mandarle push al cliente automáticamente
// (ver controllers/bitacoraEstadosController.js) -- cualquier otro string
// solo queda registrado en el historial, sin push.
export const postBitacoraEstado = async (apiFetch, { ord_id, usu_id, estado_anterior, estado_nuevo }) => {
  const res = await apiFetch('/api/bitacora_estados', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ord_id, usu_id, estado_anterior, estado_nuevo }),
  });
  if (!res.ok) throw new Error((await res.json()).message || 'No se pudo registrar el evento');
  return res.json();
};

export const getHistorialOrden = async (apiFetch, ordId) => {
  const res = await apiFetch(`/api/bitacora_estados/orden/${ordId}`);
  if (res.status === 404) return [];
  if (!res.ok) throw new Error('No se pudo cargar el historial de la orden');
  return res.json();
};
