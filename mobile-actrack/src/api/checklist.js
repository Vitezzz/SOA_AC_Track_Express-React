// Ninguno de estos dos endpoints filtra en el servidor (che_id / cat_id) --
// se trae todo y se filtra en el cliente. Los catálogos son chicos
// (plantillas y sus ítems), así que no pesa.
export const getPlantillasChecklist = async (apiFetch) => {
  const res = await apiFetch('/api/checklist_plantillas');
  if (!res.ok) throw new Error('No se pudieron cargar las plantillas de checklist');
  return res.json();
};

export const getItemsPlantilla = async (apiFetch) => {
  const res = await apiFetch('/api/checklist_items_plantilla');
  if (!res.ok) throw new Error('No se pudieron cargar los ítems del checklist');
  return res.json();
};

export const getEjecucionesOrden = async (apiFetch, ordId) => {
  const res = await apiFetch(`/api/checklist_ejecucion/orden/${ordId}`);
  if (res.status === 404) return [];
  if (!res.ok) throw new Error('No se pudo cargar el checklist de la orden');
  return res.json();
};

// item_id (ítem real de la plantilla) o item_desc (improvisado) -- exactamente
// uno de los dos, nunca ambos (ver migrations/001_checklist_ejecucion_item_id.sql).
export const crearEjecucion = async (apiFetch, { che_id, ord_id, item_id, item_desc, completado }) => {
  const res = await apiFetch('/api/checklist_ejecucion', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ che_id, ord_id, item_id: item_id ?? null, item_desc: item_desc ?? null, completado }),
  });
  if (!res.ok) throw new Error((await res.json()).message || 'No se pudo guardar el ítem');
  return res.json();
};

export const actualizarEjecucion = async (apiFetch, id, { che_id, ord_id, item_id, item_desc, completado }) => {
  const res = await apiFetch(`/api/checklist_ejecucion/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ che_id, ord_id, item_id: item_id ?? null, item_desc: item_desc ?? null, completado }),
  });
  if (!res.ok) throw new Error((await res.json()).message || 'No se pudo actualizar el ítem');
  return res.json();
};
