import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getRutaDeHoy, getParadasDeRuta } from '../api/rutas';
import { getOrdenById } from '../api/ordenesServicio';
import { getClienteById } from '../api/clientes';

// Paradas de la ruta de HOY, ya hidratadas con orden + cliente -- lo usan
// tanto la Agenda (lista) como la Ruta Optimizada (mapa).
export const useAgendaHoy = () => {
  const { apiFetch, user, loading: cargandoSesion } = useAuth();
  const [paradas, setParadas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const cargar = useCallback(async () => {
    setError('');
    try {
      const ruta = await getRutaDeHoy(apiFetch);
      if (!ruta) {
        setParadas([]);
        return;
      }

      const paradasBase = await getParadasDeRuta(apiFetch, ruta.id);
      const paradasHidratadas = await Promise.all(
        paradasBase.map(async (parada) => {
          const orden = await getOrdenById(apiFetch, parada.ord_id);
          const cliente = await getClienteById(apiFetch, orden.cli_id);
          return { ...parada, orden, cliente };
        })
      );
      setParadas(paradasHidratadas);
    } catch (err) {
      setError(err.message);
    }
  }, [apiFetch]);

  useEffect(() => {
    if (cargandoSesion || !user) return;
    setCargando(true);
    cargar().finally(() => setCargando(false));
  }, [cargandoSesion, user, cargar]);

  return { paradas, cargando, error, recargar: cargar };
};
