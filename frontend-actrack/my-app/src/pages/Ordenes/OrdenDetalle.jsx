import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import LineaTiempoEstado from "../../components/LineaTiempoEstado.jsx";
import LoadingState from "../../components/LoadingState.jsx";
import Icon from "../../components/Icon.jsx";

// Coincide con lo que el backend acepta en POST /api/ordenes_servicio/:id/solicitud
// -- ver postSolicitudCliente en ordenes_servicioController.js.
const ESTADOS_SOLICITABLES = ["pendiente", "en_proceso"];

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

    const [formAbierto, setFormAbierto] = useState(null);
    const [fechaNueva, setFechaNueva] = useState("");
    const [motivo, setMotivo] = useState("");
    const [enviando, setEnviando] = useState(false);
    const [mensajeSolicitud, setMensajeSolicitud] = useState("");

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

    useEffect(() => {
        (async () => {
            await cargarDatos();
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const enviarSolicitud = async (tipo) => {
        setError("");
        setMensajeSolicitud("");

        if (tipo === "reagendar" && !fechaNueva) {
            setError("Elige la nueva fecha y hora");
            return;
        }
        if (tipo === "cancelar" && !window.confirm("¿Seguro que quieres cancelar esta orden?")) return;

        setEnviando(true);
        try {
            const res = await apiFetch(`/api/ordenes_servicio/${id}/solicitud`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tipo, fecha_nueva: fechaNueva || null, motivo }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "No se pudo enviar la solicitud");

            setMensajeSolicitud(
                data.aplicadaDeInmediato
                    ? (tipo === "cancelar" ? "Tu orden fue cancelada." : "Tu orden fue reagendada.")
                    : "Tu solicitud fue enviada, un administrador la va a revisar."
            );
            setFormAbierto(null);
            setFechaNueva("");
            setMotivo("");
            await cargarDatos();
        } catch (err) {
            setError(err.message);
        } finally {
            setEnviando(false);
        }
    };

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

                {mensajeSolicitud && <p className="text-sm text-green-600 mt-3">{mensajeSolicitud}</p>}
                {error && <p className="form-error mt-3">{error}</p>}

                {orden.solicitud_estado === "pendiente" && (
                    <div className="form-section" style={{ background: "#fffbeb" }}>
                        <p className="text-sm text-gray-700">
                            Ya pediste {orden.solicitud_tipo === "cancelar" ? "cancelar" : "reagendar"} esta orden
                            {orden.solicitud_tipo === "reagendar" && orden.solicitud_fecha_nueva &&
                                ` para el ${formatearFechaHora(orden.solicitud_fecha_nueva)}`}. Está pendiente de revisión.
                        </p>
                    </div>
                )}

                {orden.solicitud_estado === "rechazada" && (
                    <div className="form-section" style={{ background: "#fef2f2" }}>
                        <p className="text-sm text-gray-700">
                            Tu solicitud de {orden.solicitud_tipo === "cancelar" ? "cancelación" : "reagendado"} fue rechazada.
                            {orden.solicitud_respuesta && <> Motivo: {orden.solicitud_respuesta}</>}
                        </p>
                    </div>
                )}

                {orden.solicitud_estado !== "pendiente" && ESTADOS_SOLICITABLES.includes(orden.estatus) && (
                    <div className="form-section">
                        {!formAbierto ? (
                            <div className="flex gap-2">
                                <button type="button" className="btn-secondary" onClick={() => setFormAbierto("reagendar")}>
                                    Reagendar
                                </button>
                                <button type="button" className="btn-secondary text-red-600" onClick={() => enviarSolicitud("cancelar")} disabled={enviando}>
                                    Cancelar orden
                                </button>
                            </div>
                        ) : (
                            <div>
                                <label className="block mb-2">
                                    <span className="text-sm text-gray-600">Nueva fecha y hora</span>
                                    <input
                                        type="datetime-local"
                                        className="form-input"
                                        value={fechaNueva}
                                        onChange={(e) => setFechaNueva(e.target.value)}
                                    />
                                </label>
                                <label className="block mb-2">
                                    <span className="text-sm text-gray-600">Motivo (opcional)</span>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={motivo}
                                        onChange={(e) => setMotivo(e.target.value)}
                                    />
                                </label>
                                <div className="flex gap-2">
                                    <button type="button" className="btn-primary" onClick={() => enviarSolicitud("reagendar")} disabled={enviando}>
                                        {enviando ? "Enviando..." : "Enviar solicitud"}
                                    </button>
                                    <button type="button" onClick={() => setFormAbierto(null)}>Cancelar</button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

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
                                    {registro.estado_nuevo === "tecnico_en_camino" && "🚗 Técnico en camino"}
                                    {registro.estado_nuevo === "tecnico_llego" && "📍 Técnico llegó al domicilio"}
                                    {!["tecnico_en_camino", "tecnico_llego"].includes(registro.estado_nuevo) && (
                                        <>
                                            {registro.estado_anterior ? `${registro.estado_anterior} → ` : "Creada como "}
                                            <span className="capitalize">{registro.estado_nuevo}</span>
                                        </>
                                    )}
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