export const getClienteById = async (apiFetch, id) => {
  const res = await apiFetch(`/api/clientes/${id}`);
  if (!res.ok) throw new Error('No se pudo cargar el cliente');
  return res.json();
};
