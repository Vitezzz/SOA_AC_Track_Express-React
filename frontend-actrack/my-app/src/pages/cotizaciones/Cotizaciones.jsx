import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

const ESTILOS_ESTADO = {
    borrador: "badge-status-neutral",
    enviada: "badge-status-info",
    aprobada: "badge-status-success",
    rechazada: "badge-status-danger",
};

const formatoMoneda = (valor) =>
    new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(valor);

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

    if (loading) return <p className="text-center mt-10">Cargando...</p>;

    return (
        <div className="page-container">
            <h2 className="page-title">Mis Cotizaciones</h2>

            {error && <p className="form-error mb-4">{error}</p>}

            {cotizaciones.length === 0 ? (
                <p className="text-gray-500 text-center">Todavía no tienes cotizaciones.</p>
            ) : (
                <div className="space-y-4">
                    {cotizaciones.map((cot) => {
                        const clase = ESTILOS_ESTADO[cot.estado] || "badge-status-neutral";
                        const renglones = detalles.filter((d) => d.cot_id === cot.id);

                        const orden = ordenes.find((o) => o.id === cot.ord_id);
                        const categoria = categorias.find((c) => c.id === orden?.cat_id);
                        const equipo = equipos.find((e) => e.id === orden?.equ_id);
                        const tecnico = tecnicos.find((t) => t.id === cot.tec_id);

                        return (
                            <div key={cot.id} className="panel">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-gray-900 text-lg font-semibold">
                                        {categoria?.nombre || "Cotización de servicio"}
                                    </span>
                                    <span className={`badge-status ${clase}`}>
                                        {cot.estado}
                                    </span>
                                </div>
                                <p className="text-gray-500 text-sm mb-3">
                                    Folio: {cot.folio}
                                    {orden && ` · Orden: ${orden.folio}`}
                                    {equipo && ` · Equipo: ${equipo.tipo}${equipo.modelo ? ` (${equipo.modelo})` : ""}`}
                                </p>
                                {orden?.descripcion && (
                                    <p className="text-gray-600 text-sm mb-2">{orden.descripcion}</p>
                                )}
                                <p className="text-gray-400 text-xs mb-3">
                                    {tecnico && `Elaborada por ${tecnico.nombre || `Técnico #${tecnico.usu_id}`}`}
                                    {tecnico && orden?.fecha_programada && " · "}
                                    {orden?.fecha_programada &&
                                        `Fecha de servicio: ${new Date(orden.fecha_programada).toLocaleDateString("es-MX")}`}
                                </p>
                                <p className="text-gray-900 text-lg font-semibold mb-1">
                                    {formatoMoneda(cot.total)}
                                </p>
                                {cot.notas && <p className="text-gray-600 text-sm mb-4">{cot.notas}</p>}

                                {renglones.length > 0 && (
                                    <div className="border-t border-gray-100 pt-3 mb-4">
                                        <p className="text-sm font-medium text-gray-700 mb-2">Desglose</p>
                                        <ul className="space-y-1">
                                            {renglones.map((r) => {
                                                const articulo = inventario.find((i) => i.id === r.inv_id);
                                                return (
                                                    <li key={r.id} className="flex justify-between text-sm text-gray-600">
                                                        <span>
                                                            {r.es_mano_obra ? (r.concepto || "Mano de obra") : (articulo?.nombre || "Artículo")}
                                                            {" "}× {r.cantidad}
                                                        </span>
                                                        <span>{formatoMoneda(r.subtotal)}</span>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                )}

                                {cot.estado === "enviada" && (
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => responder(cot, "aprobada")}
                                            disabled={procesandoId === cot.id}
                                            className="btn-primary flex-1 py-2"
                                        >
                                            Aceptar
                                        </button>
                                        <button
                                            onClick={() => responder(cot, "rechazada")}
                                            disabled={procesandoId === cot.id}
                                            className="btn-secondary flex-1 py-2"
                                        >
                                            Rechazar
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Cotizaciones;