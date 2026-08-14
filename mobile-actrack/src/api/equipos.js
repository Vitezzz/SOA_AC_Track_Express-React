export const getEquipoById = async (apiFetch, id) => {
  const res = await apiFetch(`/api/equipos/${id}`);
  if (!res.ok) throw new Error('No se pudo cargar el equipo');
  return res.json();
};

export const getMarcas = async (apiFetch) => {
  const res = await apiFetch('/api/marcas/');
  if (!res.ok) throw new Error('No se pudieron cargar las marcas');
  return res.json();
};

// Para cuando la orden se pidió sin equipo registrado (instalación nueva,
// o "otro" en Solicitud de Servicio) -- el técnico lo captura aquí mismo,
// en el momento de instalarlo, en vez de que quede solo en las notas de la
// cotización esperando que alguien en oficina lo transcriba después.
export const crearEquipo = async (apiFetch, { cli_id, mar_id, modelo, numero_serie, tipo }) => {
  const res = await apiFetch('/api/equipos/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cli_id, mar_id, modelo, numero_serie, tipo, imagen_url: null }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'No se pudo registrar el equipo');
  return data;
};
