import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMisCotizaciones, getMisRenglonesCotizacion } from '../api/cotizaciones';

// Prioridad de estado si por lo que sea hay más de una cotización no
// rechazada para la misma orden (p.ej. varias en "borrador" de intentos
// anteriores) -- una aprobada manda sobre una enviada, que manda sobre un
// borrador; dentro del mismo estado, la más reciente (id más alto) gana.
// Antes esto usaba .find(), que agarra la PRIMERA que Postgres regrese --
// sin ORDER BY eso no está garantizado que sea siempre la misma, así que
// un renglón agregado en una recarga podía "desaparecer" en la siguiente
// si la consulta regresaba las filas en otro orden y se elegía otra
// cotización borrador distinta.
const PRIORIDAD_ESTADO = { aprobada: 3, enviada: 2, borrador: 1 };

const elegirActiva = (cotizaciones) => {
  const noRechazadas = cotizaciones.filter((c) => c.estado !== 'rechazada');
  if (noRechazadas.length === 0) return null;
  return [...noRechazadas].sort((a, b) => {
    const prioridad = (PRIORIDAD_ESTADO[b.estado] || 0) - (PRIORIDAD_ESTADO[a.estado] || 0);
    return prioridad !== 0 ? prioridad : b.id - a.id;
  })[0];
};

export const useCotizacionOrden = (ordId) => {
  const { apiFetch } = useAuth();
  const [cotizacionActiva, setCotizacionActiva] = useState(null);
  const [renglones, setRenglones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const cargar = useCallback(async () => {
    setError('');
    try {
      const [cotizaciones, todosLosRenglones] = await Promise.all([
        getMisCotizaciones(apiFetch),
        getMisRenglonesCotizacion(apiFetch),
      ]);
      const deEstaOrden = cotizaciones.filter((c) => c.ord_id === ordId);
      const activa = elegirActiva(deEstaOrden);
      setCotizacionActiva(activa);
      setRenglones(activa ? todosLosRenglones.filter((r) => r.cot_id === activa.id) : []);
    } catch (err) {
      setError(err.message);
    }
  }, [apiFetch, ordId]);

  useEffect(() => {
    setCargando(true);
    cargar().finally(() => setCargando(false));
  }, [cargar]);

  return { cotizacionActiva, renglones, cargando, error, recargar: cargar };
};
