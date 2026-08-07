import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getOrdenById } from '../api/ordenesServicio';
import { getClienteById } from '../api/clientes';
import { getEquipoById } from '../api/equipos';

// Carga orden + cliente + equipo juntos -- lo usan la pantalla de Detalle
// de Orden y sus pestañas (Checklist, Inventario, Cierre), todas necesitan
// los mismos tres objetos.
export const useOrdenDetalle = (ordenId) => {
  const { apiFetch } = useAuth();
  const [orden, setOrden] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [equipo, setEquipo] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const recargar = useCallback(async () => {
    setError('');
    try {
      const ordenCargada = await getOrdenById(apiFetch, ordenId);
      // equ_id puede venir null (orden sin equipo específico asociado) --
      // no es un error, simplemente no hay equipo que mostrar.
      const [clienteCargado, equipoCargado] = await Promise.all([
        getClienteById(apiFetch, ordenCargada.cli_id),
        ordenCargada.equ_id ? getEquipoById(apiFetch, ordenCargada.equ_id) : Promise.resolve(null),
      ]);
      setOrden(ordenCargada);
      setCliente(clienteCargado);
      setEquipo(equipoCargado);
    } catch (err) {
      setError(err.message);
    }
  }, [apiFetch, ordenId]);

  useEffect(() => {
    setCargando(true);
    recargar().finally(() => setCargando(false));
  }, [recargar]);

  return { orden, cliente, equipo, cargando, error, recargar, setOrden };
};
