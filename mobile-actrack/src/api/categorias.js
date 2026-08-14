export const getCategoriaServicio = async (apiFetch, id) => {
  const res = await apiFetch(`/api/categoriaServicio/${id}`);
  if (!res.ok) throw new Error('No se pudo cargar la categoría de servicio');
  return res.json();
};
