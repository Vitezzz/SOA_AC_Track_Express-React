import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMisCotizaciones } from '../api/cotizaciones';
import { getMisPagos } from '../api/pagos';

// Mismo cálculo que desktop-actrack/.../Pagos/CrearPago.jsx: saldo
// pendiente = total de la cotización aprobada - suma de lo ya cobrado
// (pagos con estado 'pagado') para esa orden.
export const usePagoOrden = (ordId) => {
  const { apiFetch } = useAuth();
  const [cotizacionAprobada, setCotizacionAprobada] = useState(null);
  const [pagos, setPagos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const cargar = useCallback(async () => {
    setError('');
    try {
      const [cotizaciones, misPagos] = await Promise.all([getMisCotizaciones(apiFetch), getMisPagos(apiFetch)]);
      setCotizacionAprobada(cotizaciones.find((c) => c.ord_id === ordId && c.estado === 'aprobada') ?? null);
      setPagos(misPagos.filter((p) => p.ord_id === ordId));
    } catch (err) {
      setError(err.message);
    }
  }, [apiFetch, ordId]);

  useEffect(() => {
    setCargando(true);
    cargar().finally(() => setCargando(false));
  }, [cargar]);

  const sumaYaPagada = pagos.filter((p) => p.estado === 'pagado').reduce((suma, p) => suma + Number(p.monto), 0);
  const saldoPendiente = cotizacionAprobada ? Number(cotizacionAprobada.total) - sumaYaPagada : null;

  return { cotizacionAprobada, pagos, sumaYaPagada, saldoPendiente, cargando, error, recargar: cargar };
};
