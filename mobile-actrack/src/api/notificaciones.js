// Ya viene auto-filtrada al usuario logueado (ver
// backend-actrack/backend/src/controllers/notificaciones.controller.js).
export const getMisNotificaciones = async (apiFetch) => {
  const res = await apiFetch('/api/notificaciones');
  if (!res.ok) throw new Error('No se pudieron cargar tus notificaciones');
  return res.json();
};

// PUT es full-replace -- hay que reenviar tipo/titulo/usu_id también, no
// solo "leido". `notificacion` debe ser la fila completa ya cargada.
export const marcarNotificacionLeida = async (apiFetch, notificacion) => {
  const res = await apiFetch(`/api/notificaciones/${notificacion.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...notificacion, leido: true }),
  });
  if (!res.ok) throw new Error((await res.json()).message || 'No se pudo marcar como leída');
  return res.json();
};
