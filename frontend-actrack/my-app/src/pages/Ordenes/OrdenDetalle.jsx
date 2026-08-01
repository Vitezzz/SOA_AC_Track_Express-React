import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import LineaTiempoEstado from "../../components/LineaTiempoEstado.jsx";
import LoadingState from "../../components/LoadingState.jsx";
import Icon from "../../components/Icon.jsx";

const formatoMoneda = (valor) =>
    new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(valor);

const formatearFechaHora = (fecha) =>
    new Date(fecha).toLocaleDateString("es-MX", {
        day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    });

const OrdenDetalle = () => {
    const { id } = useParams();
    const { apiFetch } = useAuth();

    const [orden, setOrden] = useState(null);
    const [categorias, setCategorias] = useState([]);
    const [equipos, setEquipos] = useState([]);
    const [cotizaciones, setCotizaciones] = useState([]);
    const [pagos, setPagos] = useState([]);
    const [bitacora, setBitacora] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const [resOrden, resCategorias, resEquipos, resCotizaciones, resPagos, resBitacora] = await Promise.all([
                    apiFetch(`/api/ordenes_servicio/${id}`),
                    apiFetch("/api/categoriaServicio"),
                    apiFetch("/api/equipos/"),
                    apiFetch("/api/cotizaciones"),
                    apiFetch("/api/pagos"),
                    apiFetch(`/api/bitacora_estados/orden/${id}`),
                ]);

                if (!resOrden.ok) throw new Error("No se pudo cargar la orden");
                setOrden(await resOrden.json());

                if (resCategorias.ok) setCategorias(await resCategorias.json());
                if (resEquipos.ok) setEquipos(await resEquipos.json());
                if (resCotizaciones.status !== 404 && resCotizaciones.ok) setCotizaciones(await resCotizaciones.json());
                if (resPagos.status !== 404 && resPagos.ok) setPagos(await resPagos.json());
                if (resBitacora.ok) setBitacora(await resBitacora.json());
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        cargarDatos();
    }, [id]);

    if (loading) return <LoadingState />;
    if (error) return <p className="form-error text-center mt-10">{error}</p>;
    if (!orden) return null;

    const categoria = categorias.find((c) => c.id === orden.cat_id);
    const equipo = equipos.find((eq) => eq.id === orden.equ_id);
    const cotizacion = cotizaciones.find((c) => c.ord_id === orden.id);
    const pago = pagos.find((p) => p.ord_id === orden.id);
    const historialEstados = bitacora.map((f) => f.estado_nuevo);

    return (
        <div className="page-container" style={{ maxWidth: "600px" }}>
            <Link to="/ordenes">← Volver a mis órdenes</Link>

            <div className="panel" style={{ marginTop: "16px" }}>
                <h2 className="page-title" style={{ margin: 0 }}>Folio: {orden.folio}</h2>
                <p className="text-gray-400 text-xs mb-4">
                    Programada: {formatearFechaHora(orden.fecha_programada)}
                </p>

                <LineaTiempoEstado estatus={orden.estatus} historial={historialEstados.length ? historialEstados : [orden.estatus]} />

                <div className="grid grid-cols-2 gap-4 mt-6 text-sm">
                    <p><span className="text-gray-400">Categoría:</span> <span className="text-gray-700">{categoria?.nombre || "—"}</span></p>
                    <p><span className="text-gray-400">Prioridad:</span> <span className="text-gray-700 capitalize">{orden.prioridad}</span></p>
                </div>

                {equipo && (
                    <div className="form-section">
                        <p className="form-section-title"><Icon name="wrench" /> Equipo</p>
                        <div className="flex items-center gap-3">
                            {equipo.imagen_url && (
                                <img src={equipo.imagen_url} alt={equipo.modelo} className="w-16 h-16 object-cover rounded-lg" />
                            )}
                            <p className="text-sm text-gray-600">{equipo.tipo} — {equipo.modelo} ({equipo.numero_serie})</p>
                        </div>
                    </div>
                )}

                <div className="form-section">
                    <p className="form-section-title"><Icon name="note" /> Descripción de la falla</p>
                    <p className="text-sm text-gray-600 whitespace-pre-line">{orden.descripcion}</p>
                </div>

                {cotizacion && (
                    <div className="form-section">
                        <p className="form-section-title"><Icon name="tag" /> Cotización</p>
                        <p className="text-sm text-gray-600">
                            {cotizacion.folio} — {formatoMoneda(cotizacion.total)} — <span className="capitalize">{cotizacion.estado}</span>
                        </p>
                    </div>
                )}

                {pago && (
                    <div className="form-section">
                        <p className="form-section-title"><Icon name="card" /> Pago</p>
                        <p className="text-sm text-gray-600">
                            {formatoMoneda(pago.monto)} — <span className="capitalize">{pago.metodo}</span> — <span className="capitalize">{pago.estado}</span>
                        </p>
                    </div>
                )}

                {bitacora.length > 0 && (
                    <div className="form-section">
                        <p className="form-section-title"><Icon name="calendar" /> Historial de cambios</p>
                        <ul className="space-y-1">
                            {bitacora.map((registro) => (
                                <li key={registro.id} className="text-xs text-gray-500">
                                    {registro.estado_anterior ? `${registro.estado_anterior} → ` : "Creada como "}
                                    <span className="capitalize">{registro.estado_nuevo}</span>
                                    {registro.created_at && ` · ${formatearFechaHora(registro.created_at)}`}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrdenDetalle;