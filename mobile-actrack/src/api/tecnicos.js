// /api/tecnicos (sin /todos) filtra a solo los DISPONIBLES -- si el técnico
// se marcó como no disponible, no se encontraría a sí mismo ahí. /todos no
// filtra nada, por eso lo usamos para "¿cuál es mi propio tec_id?".
export const getMiTecnico = async (apiFetch, usuId) => {
  const res = await apiFetch('/api/tecnicos/todos');
  if (!res.ok) throw new Error('No se pudo cargar el técnico');
  const tecnicos = await res.json();
  return tecnicos.find((t) => t.usu_id === usuId) ?? null;
};

// PUT es full-replace -- hay que reenviar esp_id también, no solo disponible.
export const actualizarDisponibilidad = async (apiFetch, tecId, { usu_id, esp_id, disponible }) => {
  const res = await apiFetch(`/api/tecnicos/${tecId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usu_id, esp_id, disponible }),
  });
  if (!res.ok) throw new Error((await res.json()).message || 'No se pudo actualizar la disponibilidad');
  return res.json();
};
