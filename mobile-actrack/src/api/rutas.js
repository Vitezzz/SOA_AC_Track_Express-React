// "YYYY-MM-DD" en hora LOCAL del celular -- toISOString() es UTC, y en
// cuanto pasan las 6pm hora local (somos UTC-6) ya se brinca al día
// siguiente. Con eso, un técnico con ruta de HOY dejaba de verla en la
// noche porque "hoy" ya no coincidía con la fecha guardada. Mismo bug que
// se arregló en PlanificarRuta.jsx (desktop) -- ver aFechaLocal ahí.
export const aFechaLocal = (fecha) => {
  const d = new Date(fecha);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// GET /api/rutas ya viene auto-filtrado por técnico en el backend
// (rol_id=4 -> selectRutasByTecnico). "fecha" es "YYYY-MM-DD"; si no se
// manda, es hoy -- ojo, el controller regresa 400 (no 200 con []) cuando
// la lista sale vacía, así que lo tratamos como "no hay rutas" en vez de
// error.
export const getRutaPorFecha = async (apiFetch, fecha) => {
  const res = await apiFetch('/api/rutas');
  if (res.status === 400 || res.status === 404) return null;
  if (!res.ok) throw new Error('No se pudieron cargar las rutas');

  const rutas = await res.json();
  const buscada = fecha || aFechaLocal(new Date());
  return rutas.find((r) => aFechaLocal(r.fecha_ruta) === buscada) ?? null;
};

// Mismo caso: 404 cuando no hay paradas, lo tratamos como lista vacía.
export const getParadasDeRuta = async (apiFetch, rutId) => {
  const res = await apiFetch(`/api/ruta_paradas/ruta/${rutId}`);
  if (res.status === 404) return [];
  if (!res.ok) throw new Error('No se pudieron cargar las paradas de la ruta');

  const paradas = await res.json();
  return paradas.sort((a, b) => a.posicion - b.posicion);
};
