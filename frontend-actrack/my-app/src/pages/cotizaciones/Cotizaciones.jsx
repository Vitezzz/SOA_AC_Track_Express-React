import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Icon from "../../components/Icon";
import EmptyState from "../../components/EmptyState";
import LoadingState from "../../components/LoadingState";

const ESTILOS_ESTADO = {
    borrador: "badge-status-neutral",
    enviada: "badge-status-info",
    aprobada: "badge-status-success",
    rechazada: "badge-status-danger",
};

const formatoMoneda = (valor) =>
    new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(valor);

const TarjetaCotizacion = ({ cot, contexto, procesando, onResponder }) => {
    const clase = ESTILOS_ESTADO[cot.estado] || "badge-status-neutral";
    const { renglones, orden, categoria, equipo, tecnico } = contexto;

    return (
        <div className={`panel quote-card quote-card-${cot.estado} flex flex-col ${cot.estado === "enviada" ? "panel-featured" : ""}`}>
            <div className="flex justify-between items-start mb-3 gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    <span className="card-icon-badge">
                        <Icon name="tag" />
                    </span>
                    <div className="min-w-0">
                        <p className="text-gray-900 font-semibold truncate">
                            {categoria?.nombre || "Cotización de servicio"}
                        </p>
                        <p className="text-gray-400 text-xs">Folio: {cot.folio}</p>
                    </div>
                </div>
                <span className={`badge-status ${clase} shrink-0`}>{cot.estado}</span>
            </div>

            <p className="text-gray-500 text-sm mb-3">
                {orden && `Orden: ${orden.folio}`}
                {equipo && ` · Equipo: ${equipo.tipo}${equipo.modelo ? ` (${equipo.modelo})` : ""}`}
            </p>
            {orden?.descripcion && (
                <p className="text-gray-600 text-sm mb-2">{orden.descripcion}</p>
            )}
            <p className="text-gray-400 text-xs mb-4">
                {tecnico && `Elaborada por ${tecnico.nombre || `Técnico #${tecnico.usu_id}`}`}
                {tecnico && orden?.fecha_programada && " · "}
                {orden?.fecha_programada &&
                    `Fecha de servicio: ${new Date(orden.fecha_programada).toLocaleDateString("es-MX")}`}
            </p>

            <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">Total</span>
                <span className="price-tag">{formatoMoneda(cot.total)}</span>
            </div>
            {cot.notas && <p className="text-gray-600 text-sm mt-3">{cot.notas}</p>}

            {renglones.length > 0 && (
                <details className="detalle-toggle">
                    <summary>
                        <Icon name="chevron-right" />
                        Ver desglose ({renglones.length})
                    </summary>
                    <ul className="detalle-list">
                        {renglones.map((r) => (
                            <li key={r.id} className="flex justify-between text-sm text-gray-600">
                                <span>
                                    {r.nombreArticulo} × {r.cantidad}
                                </span>
                                <span>{formatoMoneda(r.subtotal)}</span>
                            </li>
                        ))}
                    </ul>
                </details>
            )}

            {cot.estado === "enviada" && (
                <div className="flex gap-3 mt-auto pt-4">
                    <button
                        onClick={() => onResponder(cot, "aprobada")}
                        disabled={procesando}
                        className="btn-primary flex-1 py-2 inline-flex items-center justify-center gap-1.5"
                    >
                        <Icon name="check" className="w-4 h-4" /> Aceptar
                    </button>
                    <button
                        onClick={() => onResponder(cot, "rechazada")}
                        disabled={procesando}
                        className="btn-secondary flex-1 py-2 inline-flex items-center justify-center gap-1.5"
                    >
                        <Icon name="close" className="w-4 h-4" /> Rechazar
                    </button>
                </div>
            )}
        </div>
    );
};

const Cotizaciones = () => {
    const [cotizaciones, setCotizaciones] = useState([]);
    const [detalles, setDetalles] = useState([]);
    const [inventario, setInventario] = useState([]);
    const [ordenes, setOrdenes] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [equipos, setEquipos] = useState([]);
    const [tecnicos, setTecnicos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [procesandoId, setProcesandoId] = useState(null);

    const { apiFetch } = useAuth();

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const [
                    resCotizaciones, resDetalles, resInventario,
                    resOrdenes, resCategorias, resEquipos, resTecnicos,
                ] = await Promise.all([
                    apiFetch("/api/cotizaciones"),
                    apiFetch("/api/cotizacion_detalle"),
                    apiFetch("/api/inventario"),
                    apiFetch("/api/ordenes_servicio"),
                    apiFetch("/api/categoriaServicio"),
                    apiFetch("/api/equipos/"),
                    apiFetch("/api/tecnicos/todos"),
                ]);

                if (resCotizaciones.status === 404) {
                    setCotizaciones([]);
                } else if (!resCotizaciones.ok) {
                    throw new Error("No se pudieron cargar tus cotizaciones");
                } else {
                    setCotizaciones(await resCotizaciones.json());
                }

                if (resDetalles.status === 404) {
                    setDetalles([]);
                } else if (resDetalles.ok) {
                    setDetalles(await resDetalles.json());
                }

                if (resInventario.ok) setInventario(await resInventario.json());
                if (resOrdenes.ok) setOrdenes(await resOrdenes.json());
                if (resCategorias.ok) setCategorias(await resCategorias.json());
                if (resEquipos.ok) setEquipos(await resEquipos.json());
                if (resTecnicos.status !== 404 && resTecnicos.ok) setTecnicos(await resTecnicos.json());
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        cargarDatos();
    }, []);

    const responder = async (cotizacion, nuevoEstado) => {
        setError("");
        setProcesandoId(cotizacion.id);
        try {
            const res = await apiFetch(`/api/cotizaciones/${cotizacion.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ord_id: cotizacion.ord_id,
                    tec_id: cotizacion.tec_id,
                    cli_id: cotizacion.cli_id,
                    folio: cotizacion.folio,
                    estado: nuevoEstado,
                    total: cotizacion.total,
                    notas: cotizacion.notas,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "No se pudo actualizar la cotización");

            setCotizaciones((prev) =>
                prev.map((c) => (c.id === cotizacion.id ? { ...c, estado: nuevoEstado } : c))
            );
        } catch (err) {
            setError(err.message);
        } finally {
            setProcesandoId(null);
        }
    };

    if (loading) return <LoadingState />;

    const contextoDe = (cot) => {
        const orden = ordenes.find((o) => o.id === cot.ord_id);
        return {
            renglones: detalles
                .filter((d) => d.cot_id === cot.id)
                .map((r) => ({
                    ...r,
                    nombreArticulo: r.es_mano_obra
                        ? (r.concepto || "Mano de obra")
                        : (inventario.find((i) => i.id === r.inv_id)?.nombre || "Artículo"),
                })),
            orden,
            categoria: categorias.find((c) => c.id === orden?.cat_id),
            equipo: equipos.find((e) => e.id === orden?.equ_id),
            tecnico: tecnicos.find((t) => t.id === cot.tec_id),
        };
    };

    const pendientes = cotizaciones.filter((c) => c.estado === "enviada");
    const historial = cotizaciones.filter((c) => c.estado !== "enviada");

    return (
        <div className="page-container-wide">
            <div className="list-header">
                <span className="list-header-icon">
                    <Icon name="tag" />
                </span>
                <div>
                    <p className="list-header-title">Mis Cotizaciones</p>
                    <p className="list-header-subtitle">
                        {cotizaciones.length === 0
                            ? "Aquí verás las cotizaciones que te envíe el equipo de servicio"
                            : pendientes.length > 0
                                ? `${pendientes.length} ${pendientes.length === 1 ? "cotización" : "cotizaciones"} esperando tu respuesta`
                                : `${cotizaciones.length} en tu historial`}
                    </p>
                </div>
            </div>

            {error && <p className="form-error mb-4">{error}</p>}

            {cotizaciones.length === 0 ? (
                <EmptyState
                    icon="tag"
                    title="Todavía no tienes cotizaciones"
                    description="Cuando un técnico elabore una cotización para tu servicio, aparecerá aquí."
                />
            ) : (
                <div className="space-y-8">
                    {pendientes.length > 0 && (
                        <div>
                            <h3 className="list-section-title">
                                Necesitan tu respuesta
                                <span className="badge-status badge-status-info">{pendientes.length}</span>
                            </h3>
                            <div className="quote-grid">
                                {pendientes.map((cot) => (
                                    <TarjetaCotizacion
                                        key={cot.id}
                                        cot={cot}
                                        contexto={contextoDe(cot)}
                                        procesando={procesandoId === cot.id}
                                        onResponder={responder}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {historial.length > 0 && (
                        <div>
                            {pendientes.length > 0 && <h3 className="list-section-title">Historial</h3>}
                            <div className="quote-grid">
                                {historial.map((cot) => (
                                    <TarjetaCotizacion
                                        key={cot.id}
                                        cot={cot}
                                        contexto={contextoDe(cot)}
                                        procesando={procesandoId === cot.id}
                                        onResponder={responder}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Cotizaciones;