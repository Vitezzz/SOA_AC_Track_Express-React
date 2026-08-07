export const getEquipoById = async (apiFetch, id) => {
  const res = await apiFetch(`/api/equipos/${id}`);
  if (!res.ok) throw new Error('No se pudo cargar el equipo');
  return res.json();
};
