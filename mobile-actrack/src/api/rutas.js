// GET /api/rutas ya viene auto-filtrado por técnico en el backend
// (rol_id=4 -> selectRutasByTecnico). Aquí solo nos quedamos con la de
// hoy -- ojo, el controller regresa 400 (no 200 con []) cuando la lista
// sale vacía, así que lo tratamos como "no hay rutas" en vez de error.
export const getRutaDeHoy = async (apiFetch) => {
  const res = await apiFetch('/api/rutas');
  if (res.status === 400 || res.status === 404) return null;
  if (!res.ok) throw new Error('No se pudieron cargar las rutas');

  const rutas = await res.json();
  const hoy = new Date().toISOString().slice(0, 10);
  return rutas.find((r) => String(r.fecha_ruta).slice(0, 10) === hoy) ?? null;
};

// Mismo caso: 404 cuando no hay paradas, lo tratamos como lista vacía.
export const getParadasDeRuta = async (apiFetch, rutId) => {
  const res = await apiFetch(`/api/ruta_paradas/ruta/${rutId}`);
  if (res.status === 404) return [];
  if (!res.ok) throw new Error('No se pudieron cargar las paradas de la ruta');

  const paradas = await res.json();
  return paradas.sort((a, b) => a.posicion - b.posicion);
};
