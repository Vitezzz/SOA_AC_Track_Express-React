import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { postBitacoraEstado, getHistorialOrden } from '../api/bitacora';

// Historial real de bitácora para una orden -- lo usan tanto el Cierre de
// Servicio (Detalle de Orden) como la tarjeta de "siguiente parada" en el
// mapa de Ruta, para saber si ya se avisó "en camino"/"llegué" y no dejar
// marcarlo dos veces sin querer.
export const usePingsOrden = (ordenId, estatusOrden) => {
  const { apiFetch, user } = useAuth();
  const [historial, setHistorial] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(null);
  const [error, setError] = useState('');

  const cargarHistorial = useCallback(async () => {
    try {
      setHistorial(await getHistorialOrden(apiFetch, ordenId));
    } catch (err) {
      setError(err.message);
    }
  }, [apiFetch, ordenId]);

  useEffect(() => {
    setCargando(true);
    cargarHistorial().finally(() => setCargando(false));
  }, [cargarHistorial]);

  const yaSeMando = (estado) => historial.some((h) => h.estado_nuevo === estado);

  const mandarPing = async (estadoNuevo) => {
    setError('');
    setEnviando(estadoNuevo);
    try {
      await postBitacoraEstado(apiFetch, {
        ord_id: ordenId,
        usu_id: user.id,
        estado_anterior: estatusOrden,
        estado_nuevo: estadoNuevo,
      });
      await cargarHistorial();
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(null);
    }
  };

  return { cargando, error, yaSeMando, mandarPing, enviando };
};
