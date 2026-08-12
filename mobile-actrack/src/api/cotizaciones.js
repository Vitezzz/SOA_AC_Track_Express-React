// Ya viene auto-filtrada a las cotizaciones de las órdenes del técnico
// logueado (rol_id=4 -> selectCotizacionesByTecnico en el backend).
export const getMisCotizaciones = async (apiFetch) => {
  const res = await apiFetch('/api/cotizaciones');
  if (res.status === 404) return [];
  if (!res.ok) throw new Error('No se pudieron cargar las cotizaciones');
  return res.json();
};
