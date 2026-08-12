import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getRutaPorFecha, getParadasDeRuta, aFechaLocal } from '../api/rutas';
import { getOrdenById } from '../api/ordenesServicio';
import { getClienteById } from '../api/clientes';

// Paradas de la ruta del día pedido ("YYYY-MM-DD"; sin fecha = hoy), ya
// hidratadas con orden + cliente -- lo usan tanto la Agenda (lista, con
// navegación de día) como la Ruta Optimizada (mapa, siempre hoy).
export const useAgendaHoy = (fecha) => {
  const { apiFetch, user, loading: cargandoSesion } = useAuth();
  const [paradas, setParadas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const cargar = useCallback(async () => {
    setError('');
    try {
      const ruta = await getRutaPorFecha(apiFetch, fecha);
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
      // El backend no las regresa ordenadas -- Agenda (candado de "la
      // siguiente se habilita hasta cerrar esta") y Ruta (línea de la
      // ruta, siguiente parada) asumen que vienen en orden de visita.
      paradasHidratadas.sort((a, b) => a.posicion - b.posicion);
      setParadas(paradasHidratadas);
    } catch (err) {
      setError(err.message);
    }
  }, [apiFetch, fecha]);

  useEffect(() => {
    if (cargandoSesion || !user) return;
    setCargando(true);
    cargar().finally(() => setCargando(false));
  }, [cargandoSesion, user, cargar]);

  return { paradas, cargando, error, recargar: cargar };
};

export const esHoy = (fecha) => !fecha || fecha === aFechaLocal(new Date());
