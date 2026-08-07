// Stock que trae el técnico en su vehículo -- ya viene auto-filtrado por
// técnico en el backend (rol_id=4). 404 cuando no tiene nada asignado.
export const getInventarioVehiculo = async (apiFetch) => {
  const res = await apiFetch('/api/inventario_vehiculo');
  if (res.status === 404) return [];
  if (!res.ok) throw new Error('No se pudo cargar el inventario del vehículo');
  return res.json();
};

// Catálogo general -- lo usamos solo para sacar nombre/unidad_medida de
// cada inv_id (inventario_vehiculo no trae esos datos, solo cantidades).
export const getCatalogoInventario = async (apiFetch) => {
  const res = await apiFetch('/api/inventario');
  if (!res.ok) throw new Error('No se pudo cargar el catálogo de inventario');
  return res.json();
};

export const getTiposMovimiento = async (apiFetch) => {
  const res = await apiFetch('/api/tipo_movimiento_inventario');
  if (!res.ok) throw new Error('No se pudieron cargar los tipos de movimiento');
  return res.json();
};

export const registrarMovimiento = async (apiFetch, { inv_id, ord_id, usu_id, tip_id, cantidad }) => {
  const res = await apiFetch('/api/movimientos_inventario', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ inv_id, ord_id, usu_id, tip_id, cantidad }),
  });
  if (!res.ok) throw new Error((await res.json()).message || 'No se pudo registrar el movimiento');
  return res.json();
};
