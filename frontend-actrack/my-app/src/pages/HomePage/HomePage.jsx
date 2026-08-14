import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Icon from "../../components/Icon";

const ESTATUS_CERRADOS = ["completada", "pagada", "cancelada"];

const formatoMoneda = (valor) =>
    new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(valor);

const formatearFecha = (fecha) =>
    new Date(fecha).toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });

const HomePage = () => {
    const { user, apiFetch, registrarNotificaciones } = useAuth();

    const [activando, setActivando] = useState(false);
    const [activado, setActivado] = useState(false);
    const [cargando, setCargando] = useState(true);

    const [ordenes, setOrdenes] = useState([]);
    const [cotizaciones, setCotizaciones] = useState([]);
    const [pagos, setPagos] = useState([]);
    const [mantenimientos, setMantenimientos] = useState([]);
    const [equipos, setEquipos] = useState([]);

    const esCliente = user?.rol_id === 3;
    const primerNombre = user?.nombre?.split(" ")[0];

    // El navbar de arriba YA tiene los links a cada sección -- repetirlos
    // aquí abajo como tarjetas no aportaba nada. Este panel es lo que el
    // navbar no puede mostrar: un resumen real de qué necesita tu atención.
    useEffect(() => {
        const cargarResumen = async () => {
            try {
                const [resOrdenes, resCotizaciones, resPagos, resMant, resEquipos] = await Promise.all([
                    apiFetch("/api/ordenes_servicio"),
                    apiFetch("/api/cotizaciones"),
                    apiFetch("/api/pagos"),
                    esCliente ? apiFetch("/api/mantenimiento_preventivo") : Promise.resolve(null),
                    esCliente ? apiFetch("/api/equipos/") : Promise.resolve(null),
                ]);

                if (resOrdenes.ok) setOrdenes(await resOrdenes.json());
                if (resCotizaciones.status !== 404 && resCotizaciones.ok) setCotizaciones(await resCotizaciones.json());
                if (resPagos && resPagos.status !== 404 && resPagos.ok) setPagos(await resPagos.json());
                if (resMant && resMant.status !== 404 && resMant.ok) setMantenimientos(await resMant.json());
                if (resEquipos?.ok) setEquipos(await resEquipos.json());
            } catch {
                // El resumen es un plus, no algo crítico -- si falla, la
                // página sigue funcionando sin esos números.
            } finally {
                setCargando(false);
            }
        };
        cargarResumen();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [esCliente]);

    const handleActivarNotificaciones = async () => {
        setActivando(true);
        const token = await registrarNotificaciones();
        setActivado(!!token);
        setActivando(false);
    };

    const ordenesActivas = ordenes.filter((o) => !ESTATUS_CERRADOS.includes(o.estatus));
    const cotizacionesPendientes = cotizaciones.filter((c) => c.estado === "enviada");

    // La próxima visita real: la orden activa más próxima que todavía no pasa.
    const proximaCita = [...ordenesActivas]
        .filter((o) => o.fecha_programada && new Date(o.fecha_programada) >= new Date())
        .sort((a, b) => new Date(a.fecha_programada) - new Date(b.fecha_programada))[0];

    // Saldo real pendiente: total de cotizaciones aprobadas menos lo que
    // ya se registró como pagado en pagos.
    const totalAprobado = cotizaciones.filter((c) => c.estado === "aprobada").reduce((s, c) => s + Number(c.total), 0);
    const totalPagado = pagos.filter((p) => p.estado === "pagado").reduce((s, p) => s + Number(p.monto), 0);
    const saldoPendiente = Math.max(0, totalAprobado - totalPagado);

    const proximoMantenimiento = [...mantenimientos]
        .filter((m) => m.activo)
        .sort((a, b) => new Date(a.proxima_fecha) - new Date(b.proxima_fecha))[0];
    const equipoDelMantenimiento = proximoMantenimiento && equipos.find((eq) => eq.id === proximoMantenimiento.equ_id);

    return (
      <div className="page-container-wide">
        <div className="panel-hero mb-8">
          <span className="badge-status badge-status-success mb-4">Panel de servicio</span>
          <h1 className="text-4xl font-semibold text-gray-900 mb-3">
            {primerNombre ? `Hola, ${primerNombre}` : "Bienvenido a AC Track"}
          </h1>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Da seguimiento a tus órdenes, cotizaciones y equipos desde un solo lugar.
          </p>

          {!cargando && (
            <div className="flex justify-center gap-16 mb-8 flex-wrap">
              <div>
                <p className="text-4xl font-semibold text-gray-900">{ordenesActivas.length}</p>
                <p className="text-sm text-gray-500">Órdenes activas</p>
              </div>
              <div>
                <p className="text-4xl font-semibold text-gray-900">{cotizacionesPendientes.length}</p>
                <p className="text-sm text-gray-500">Cotizaciones por responder</p>
              </div>
              {esCliente && (
                <div>
                  <p className="text-4xl font-semibold text-gray-900">{formatoMoneda(saldoPendiente)}</p>
                  <p className="text-sm text-gray-500">Saldo pendiente</p>
                </div>
              )}
            </div>
          )}

          {!activado && (
            <button
              className="btn-secondary px-6"
              onClick={handleActivarNotificaciones}
              disabled={activando}
            >
              {activando ? "Activando..." : "🔔 Activar notificaciones"}
            </button>
          )}
          {activado && (
            <p className="text-sm text-green-600">✓ Notificaciones activadas</p>
          )}
        </div>

        {!cargando && (
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="panel" style={{ padding: "1.75rem" }}>
              <p className="font-medium text-gray-900 mb-3 flex items-center gap-2 text-base">
                <Icon name="calendar" className="w-4 h-4" /> Tu próxima cita
              </p>
              {proximaCita ? (
                <Link to={`/ordenes/${proximaCita.id}`} className="block text-sm text-gray-600 hover:underline">
                  <span className="block font-medium text-gray-900">{formatearFecha(proximaCita.fecha_programada)}</span>
                  {proximaCita.folio}
                </Link>
              ) : (
                <p className="text-sm text-gray-400">No tienes ninguna visita programada por ahora.</p>
              )}
            </div>

            {esCliente && (
              <div className="panel" style={{ padding: "1.75rem" }}>
                <p className="font-medium text-gray-900 mb-3 flex items-center gap-2 text-base">
                  <Icon name="box" className="w-4 h-4" /> Próximo mantenimiento
                </p>
                {proximoMantenimiento ? (
                  <Link to="/misequipos" className="block text-sm text-gray-600 hover:underline">
                    <span className="block font-medium text-gray-900">
                      {new Date(proximoMantenimiento.proxima_fecha).toLocaleDateString("es-MX", { day: "numeric", month: "long" })}
                    </span>
                    {equipoDelMantenimiento ? `${equipoDelMantenimiento.tipo} — ${equipoDelMantenimiento.modelo}` : "Equipo registrado"}
                  </Link>
                ) : (
                  <p className="text-sm text-gray-400">No tienes mantenimientos preventivos programados.</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    )
}

export default HomePage;
