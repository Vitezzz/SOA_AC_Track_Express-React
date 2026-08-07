import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import LineaTiempoEstado from '../../components/LineaTiempoEstado.jsx';
import { Link } from "react-router-dom";
import LoadingState from "../../components/LoadingState.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import { indiceProgreso, ordenEstaActiva } from "../../utils/ordenesProgreso.js";

const formatearFecha = (fecha) =>
    new Date(fecha).toLocaleDateString("es-MX", {
        day: "numeric", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    });

const FILTROS = [
    { key: "todas", label: "Todas" },
    { key: "pendiente", label: "Pendientes" },
    { key: "en_proceso", label: "En curso" },
    { key: "completada", label: "Completadas" },
];

// "Completadas" agrupa completada + pagada -- para el cliente, ambas ya
// significan "el servicio terminó".
const coincideFiltro = (filtro, estatus) => {
    if (filtro === "todas") return true;
    if (filtro === "completada") return estatus === "completada" || estatus === "pagada";
    return estatus === filtro;
};

const TarjetaOrden = ({ orden, historial, destacada = false }) => (
    <Link
        to={`/ordenes/${orden.id}`}
        className={`panel block hover:shadow-md transition-shadow ${destacada ? "panel-featured" : ""}`}
    >
        <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
                {destacada && (
                    <span className="badge-status badge-status-success">Más cerca de completarse</span>
                )}
                <span className="font-semibold text-gray-900">Folio: {orden.folio}</span>
            </div>
            <span className="text-gray-400 text-xs">{formatearFecha(orden.fecha_programada)}</span>
        </div>

        <LineaTiempoEstado estatus={orden.estatus} historial={historial} />

        <p className="text-gray-600 text-sm mt-4">{orden.descripcion}</p>
    </Link>
);

const Ordenes = () => {
    const [ordenes, setOrdenes] = useState([]);
    const [historiales, setHistoriales] = useState({}); // { [ord_id]: ["pendiente", "en_proceso", ...] }
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filtro, setFiltro] = useState("todas");

    const { apiFetch } = useAuth();

    useEffect(() => {
        const cargarOrdenes = async () => {
            try {
                const res = await apiFetch("/api/ordenes_servicio");
                if (!res.ok) throw new Error("No se pudieron cargar tus órdenes");
                const dataOrdenes = await res.json();
                setOrdenes(dataOrdenes);

                // Por cada orden, pedimos su historial real de bitácora
                const resultados = await Promise.all(
                    dataOrdenes.map((orden) => apiFetch(`/api/bitacora_estados/orden/${orden.id}`))
                );

                const historialesPorOrden = {};
                for (let i = 0; i < dataOrdenes.length; i++) {
                    if (resultados[i].ok) {
                        const filas = await resultados[i].json();
                        historialesPorOrden[dataOrdenes[i].id] = filas.map((f) => f.estado_nuevo);
                    }
                }
                setHistoriales(historialesPorOrden);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        cargarOrdenes();
    }, []);

    if (loading) return <LoadingState />;

    // Cada orden con su historial ya resuelto (o el estatus actual como
    // único punto conocido, si la bitácora no cargó), y ya filtrada por lo
    // que el cliente eligió arriba.
    const conHistorial = ordenes
        .filter((orden) => coincideFiltro(filtro, orden.estatus))
        .map((orden) => ({
            orden,
            historial: historiales[orden.id] || [orden.estatus],
        }));

    // Activas = todavía en curso (no completada/pagada/cancelada), ordenadas
    // de la más avanzada a la que apenas va empezando -- así lo primero que
    // ve el cliente es la orden más cerca de terminar.
    const activas = conHistorial
        .filter(({ orden }) => ordenEstaActiva(orden.estatus))
        .sort((a, b) => indiceProgreso(b.historial) - indiceProgreso(a.historial));

    // El resto (completada, pagada, cancelada) es historial -- más reciente
    // primero.
    const finalizadas = conHistorial
        .filter(({ orden }) => !ordenEstaActiva(orden.estatus))
        .sort((a, b) => new Date(b.orden.fecha_programada) - new Date(a.orden.fecha_programada));

    // La tarjeta destacada solo tiene sentido viendo "Todas" -- con un
    // filtro específico ya sabemos qué estás viendo, no hay que resaltar
    // nada extra.
    const [destacada, ...restoActivas] = filtro === "todas" ? activas : [];
    const listaSimple = filtro === "todas" ? [] : [...activas, ...finalizadas];

    return (
        <div className="page-container">
            <h2 className="page-title">Mis Órdenes</h2>

            {error && <p className="form-error mb-4">{error}</p>}

            {ordenes.length === 0 ? (
                <EmptyState
                    icon="wrench"
                    title="Todavía no tienes órdenes de servicio"
                    description="Cuando solicites un servicio, aparecerá aquí con su estatus en tiempo real."
                />
            ) : (
                <>
                    <div className="flex gap-2 mb-6 flex-wrap">
                        {FILTROS.map((f) => (
                            <button
                                key={f.key}
                                type="button"
                                onClick={() => setFiltro(f.key)}
                                className={`filter-pill ${filtro === f.key ? "filter-pill-active" : ""}`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>

                    {activas.length === 0 && finalizadas.length === 0 ? (
                        <p className="text-gray-500 text-sm">No tienes órdenes con ese filtro.</p>
                    ) : filtro === "todas" ? (
                        <div className="space-y-8">
                            {destacada && (
                                <div className="space-y-4">
                                    <TarjetaOrden orden={destacada.orden} historial={destacada.historial} destacada />
                                    {restoActivas.length > 0 && (
                                        <div className="space-y-4">
                                            <h3 className="text-sm font-medium text-gray-500">Otras órdenes en curso</h3>
                                            {restoActivas.map(({ orden, historial }) => (
                                                <TarjetaOrden key={orden.id} orden={orden} historial={historial} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {finalizadas.length > 0 && (
                                <div className="space-y-4">
                                    {destacada && <h3 className="text-sm font-medium text-gray-500">Historial</h3>}
                                    {finalizadas.map(({ orden, historial }) => (
                                        <TarjetaOrden key={orden.id} orden={orden} historial={historial} />
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {listaSimple.map(({ orden, historial }) => (
                                <TarjetaOrden key={orden.id} orden={orden} historial={historial} />
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Ordenes;
