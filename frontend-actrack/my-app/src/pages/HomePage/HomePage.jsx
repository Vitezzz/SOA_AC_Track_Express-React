import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Icon from "../../components/Icon";

// El accesos rápidos cambian según el rol -- un cliente necesita todo el
// ciclo de servicio, mientras que admin/técnico/supervisor (si llegan a
// entrar por la web en vez de Desktop/Móvil) solo necesitan lo operativo.
const ENLACES_CLIENTE = [
    { to: "/ordenes", icon: "wrench", label: "Mis órdenes", desc: "Da seguimiento a tus servicios activos." },
    { to: "/SolicitudServicio", icon: "spark", label: "Solicitar servicio", desc: "Pide un nuevo servicio o mantenimiento." },
    { to: "/misequipos", icon: "box", label: "Mis equipos", desc: "Consulta tus equipos de AC registrados." },
    { to: "/cotizaciones", icon: "tag", label: "Cotizaciones", desc: "Revisa y responde tus cotizaciones." },
    { to: "/pagos", icon: "card", label: "Pagos", desc: "Historial de pagos de tus servicios." },
    { to: "/mi-dashboard", icon: "calendar", label: "Mi Dashboard", desc: "Gráficas de tu actividad." },
];

const ENLACES_OTROS = [
    { to: "/ordenes", icon: "wrench", label: "Órdenes", desc: "Consulta y da seguimiento a las órdenes." },
    { to: "/cotizaciones", icon: "tag", label: "Cotizaciones", desc: "Revisa las cotizaciones enviadas." },
    { to: "/pagos", icon: "card", label: "Pagos", desc: "Historial de pagos registrados." },
];

const HomePage = () => {
    const { user, apiFetch, registrarNotificaciones } = useAuth();

    const [activando, setActivando] = useState(false);
    const [activado, setActivado] = useState(false);
    const [resumen, setResumen] = useState(null);

    const esCliente = user?.rol_id === 3;
    const enlaces = esCliente ? ENLACES_CLIENTE : ENLACES_OTROS;
    const primerNombre = user?.nombre?.split(" ")[0];

    // El resumen (órdenes activas / cotizaciones por responder) solo aplica
    // a cliente -- es su propio panel de "qué me falta revisar hoy".
    useEffect(() => {
        if (!esCliente) return;

        const cargarResumen = async () => {
            try {
                const [resOrdenes, resCotizaciones] = await Promise.all([
                    apiFetch("/api/ordenes_servicio"),
                    apiFetch("/api/cotizaciones"),
                ]);

                const ordenes = resOrdenes.ok ? await resOrdenes.json() : [];
                const cotizaciones =
                    resCotizaciones.status === 404 ? [] : resCotizaciones.ok ? await resCotizaciones.json() : [];

                setResumen({
                    activas: ordenes.filter(
                        (o) => o.estatus !== "completada" && o.estatus !== "pagada" && o.estatus !== "cancelada"
                    ).length,
                    cotizacionesPendientes: cotizaciones.filter((c) => c.estado === "enviada").length,
                });
            } catch {
                // El resumen es un plus, no algo crítico -- si falla, la
                // página sigue funcionando sin esos números.
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

    return (
      <div className="page-container">
        <div className="panel-hero mb-8">
          <span className="badge-status badge-status-success mb-4">Panel de servicio</span>
          <h1 className="text-4xl font-semibold text-gray-900 mb-3">
            {primerNombre ? `Hola, ${primerNombre}` : "Bienvenido a AC Track"}
          </h1>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            Da seguimiento a tus órdenes, cotizaciones y equipos desde un solo lugar.
          </p>

          {resumen && (resumen.activas > 0 || resumen.cotizacionesPendientes > 0) && (
            <div className="flex justify-center gap-10 mb-8">
              <div>
                <p className="text-3xl font-semibold text-gray-900">{resumen.activas}</p>
                <p className="text-sm text-gray-500">Órdenes activas</p>
              </div>
              <div>
                <p className="text-3xl font-semibold text-gray-900">{resumen.cotizacionesPendientes}</p>
                <p className="text-sm text-gray-500">Cotizaciones por responder</p>
              </div>
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

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {enlaces.map((enlace) => (
            <Link key={enlace.to} to={enlace.to} className="panel quick-link-card">
              <span className="quick-link-icon"><Icon name={enlace.icon} /></span>
              <span>
                <span className="block font-medium text-gray-900">{enlace.label}</span>
                <span className="block text-sm text-gray-500 mt-0.5">{enlace.desc}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    )
}

export default HomePage;
