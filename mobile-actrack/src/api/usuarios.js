export const getMiPerfil = async (apiFetch) => {
  const res = await apiFetch('/api/usuarios/me');
  if (!res.ok) throw new Error('No se pudo cargar tu perfil');
  return res.json();
};

export const actualizarMiPerfil = async (apiFetch, { nombre, paterno, materno, email }) => {
  const res = await apiFetch('/api/usuarios/me', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, paterno, materno, email }),
  });
  if (!res.ok) throw new Error((await res.json()).message || 'No se pudo actualizar tu perfil');
  return res.json();
};
