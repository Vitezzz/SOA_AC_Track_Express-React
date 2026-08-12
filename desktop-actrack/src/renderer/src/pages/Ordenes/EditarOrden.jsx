import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// El admin ya NO puede saltar el estatus a mano a cualquier valor -- eso
// era justo lo que hacía que el flujo se sintiera "inventado". El resto del
// flujo avanza solo por eventos reales: pendiente -> en_proceso cuando el
// técnico marca que llegó (mobile), -> completada cuando cierra el
// servicio (mobile), -> pagada cuando se cubre el saldo (pagosService).
// Lo único que sigue siendo decisión humana es cancelar/reactivar.
const opcionesEstatus = (estatusActual) => {
    if (estatusActual === "cancelada") return [{ valor: "cancelada", label: "Cancelada" }, { valor: "pendiente", label: "Reactivar orden" }];
    if (estatusActual === "completada" || estatusActual === "pagada") return null;
    return [{ valor: estatusActual, label: estatusActual }, { valor: "cancelada", label: "Cancelar orden" }];
};

const EditarOrden = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { apiFetch } = useAuth();

    const [orden, setOrden] = useState(null);
    const [tecnicos, setTecnicos] = useState([]);
    const [disponibilidad, setDisponibilidad] = useState({});

    // Solo para mostrar el contexto de la orden (qué pidió el cliente, en
    // qué equipo) -- así se puede elegir técnico con criterio, no a ciegas.
    const [cliente, setCliente] = useState(null);
    const [equipo, setEquipo] = useState(null);
    const [marca, setMarca] = useState(null);
    const [categoria, setCategoria] = useState(null);

    const [estatus, setEstatus] = useState("");
    const [tecId, setTecId] = useState("");
    const [duracionEstimada, setDuracionEstimada] = useState("2");

    const [loading, setLoading] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState("");
    const [guardado, setGuardado] = useState(false);
    const [resolviendo, setResolviendo] = useState(false);

    const cargarDatos = async () => {
        try {
            const [resOrden, resTecnicos] = await Promise.all([
                apiFetch(`/api/ordenes_servicio/${id}`),
                apiFetch("/api/tecnicos/todos"),
            ]);

            if (!resOrden.ok) throw new Error("No se pudo cargar la orden");
            const dataOrden = await resOrden.json();
            setOrden(dataOrden);
            setEstatus(dataOrden.estatus);
            setTecId(dataOrden.tec_id || "");
            setDuracionEstimada(String(dataOrden.duracion_estimada_horas ?? 2));

            if (resTecnicos.status === 404) {
                setTecnicos([]);
            } else if (resTecnicos.ok) {
                setTecnicos(await resTecnicos.json());
            }

            const [resCliente, resEquipo, resCategoria] = await Promise.all([
                dataOrden.cli_id ? apiFetch(`/api/clientes/${dataOrden.cli_id}`) : null,
                dataOrden.equ_id ? apiFetch(`/api/equipos/${dataOrden.equ_id}`) : null,
                dataOrden.cat_id ? apiFetch(`/api/categoriaServicio/${dataOrden.cat_id}`) : null,
            ]);

            if (resCliente?.ok) setCliente(await resCliente.json());
            if (resCategoria?.ok) setCategoria(await resCategoria.json());

            if (resEquipo?.ok) {
                const dataEquipo = await resEquipo.json();
                setEquipo(dataEquipo);
                if (dataEquipo.mar_id) {
                    const resMarca = await apiFetch(`/api/marcas/${dataEquipo.mar_id}`);
                    if (resMarca.ok) setMarca(await resMarca.json());
                }
            }
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

    const resolverSolicitud = async (aprobar) => {
        setError("");

        let motivoRespuesta = "";
        if (!aprobar) {
            motivoRespuesta = window.prompt("Motivo del rechazo (el cliente lo va a ver):", "") || "";
            if (motivoRespuesta === "" && !window.confirm("¿Rechazar sin dar motivo?")) return;
        }

        setResolviendo(true);
        try {
            const res = await apiFetch(`/api/ordenes_servicio/${id}/resolver-solicitud`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ aprobar, motivo_respuesta: motivoRespuesta || null }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "No se pudo resolver la solicitud");
            await cargarDatos();
        } catch (err) {
            setError(err.message);
        } finally {
            setResolviendo(false);
        }
    };

    useEffect(() => {
        if (!orden?.fecha_programada) return;

        const consultarDisponibilidad = async () => {
            const res = await apiFetch(
                `/api/tecnicos/disponibilidad?fecha=${orden.fecha_programada}&duracion=${duracionEstimada || 2}&excluir=${id}`
            );
            if (res.ok) {
                const datos = await res.json();
                const mapa = {};
                datos.forEach((t) => { mapa[t.id] = t.ocupado; });
                setDisponibilidad(mapa);
            }
        };
        consultarDisponibilidad();
    }, [orden?.fecha_programada, duracionEstimada, id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setGuardado(false);
        setGuardando(true);

        try {
            const res = await apiFetch(`/api/ordenes_servicio/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    cli_id: orden.cli_id,
                    equ_id: orden.equ_id,
                    cat_id: orden.cat_id,
                    pri_id: orden.pri_id,
                    folio: orden.folio,
                    prioridad: orden.prioridad,
                    estatus,
                    descripcion: orden.descripcion,
                    fecha_programada: orden.fecha_programada,
                    fecha_cierre: orden.fecha_cierre,
                    tec_id: tecId ? Number(tecId) : null,
                    duracion_estimada_horas: Number(duracionEstimada) || 2,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "No se pudo actualizar la orden");

            setGuardado(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setGuardando(false);
        }
    };

    if (loading) return <p className="page">Cargando...</p>;

    return (
        <div className="page page-narrow">
            <h2>Editar Orden: {orden?.folio}</h2>

            {error && <p className="error-text">{error}</p>}
            {guardado && <p className="success-text">¡Orden actualizada correctamente!</p>}

            <div className="panel" style={{ marginBottom: "16px", fontSize: "14px", lineHeight: "1.6" }}>
                <p><strong>Cliente:</strong> {cliente?.nombre || `#${orden.cli_id}`}
                    {cliente?.telefono && ` · ${cliente.telefono}`}
                    {cliente?.direccion && ` · ${cliente.direccion}`}
                </p>
                <p><strong>Equipo:</strong> {equipo ? `${equipo.tipo || "—"}${marca?.nombre ? ` ${marca.nombre}` : ""}${equipo.modelo ? ` ${equipo.modelo}` : ""}` : "Sin equipo asociado"}</p>
                <p><strong>Servicio solicitado:</strong> {categoria?.nombre || `#${orden.cat_id}`}</p>
                <p><strong>Prioridad:</strong> {orden.prioridad || "—"}</p>
                <p><strong>Fecha programada:</strong> {orden.fecha_programada ? new Date(orden.fecha_programada).toLocaleString("es-MX") : "Sin fecha"}</p>
                {orden.descripcion && <p><strong>Descripción:</strong> {orden.descripcion}</p>}
            </div>

            {orden.solicitud_estado === "pendiente" && (
                <div className="panel" style={{ marginBottom: "16px", background: "#fffbeb", fontSize: "14px" }}>
                    <p style={{ fontWeight: "600", marginBottom: "8px" }}>
                        El cliente pidió {orden.solicitud_tipo === "cancelar" ? "cancelar" : "reagendar"} esta orden
                        {orden.solicitud_tipo === "reagendar" && orden.solicitud_fecha_nueva &&
                            ` para el ${new Date(orden.solicitud_fecha_nueva).toLocaleString("es-MX")}`}.
                    </p>
                    {orden.solicitud_motivo && <p style={{ marginBottom: "8px" }}>Motivo: {orden.solicitud_motivo}</p>}
                    <div style={{ display: "flex", gap: "8px" }}>
                        <button type="button" className="btn-primary" onClick={() => resolverSolicitud(true)} disabled={resolviendo}>
                            Aprobar
                        </button>
                        <button type="button" onClick={() => resolverSolicitud(false)} disabled={resolviendo}>
                            Rechazar
                        </button>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="form">
                <label>
                    <span>Estatus</span>
                    {opcionesEstatus(orden.estatus) ? (
                        <select
                            value={estatus}
                            onChange={(e) => setEstatus(e.target.value)}
                        >
                            {opcionesEstatus(orden.estatus).map((op) => (
                                <option key={op.valor} value={op.valor}>{op.label}</option>
                            ))}
                        </select>
                    ) : (
                        <p style={{ margin: 0, fontWeight: "600" }}>{orden.estatus} — ya no se puede modificar desde aquí</p>
                    )}
                </label>

                <label>
                    <span>Duración estimada (horas)</span>
                    <input
                        type="number"
                        min="0.5"
                        step="0.5"
                        value={duracionEstimada}
                        onChange={(e) => setDuracionEstimada(e.target.value)}
                    />
                </label>

                <label>
                    <span>Técnico asignado</span>
                    <select
                        value={tecId}
                        onChange={(e) => setTecId(e.target.value)}
                    >
                        <option value="">Sin asignar</option>
                        {tecnicos.map((tec) => (
                            <option key={tec.id} value={tec.id} disabled={disponibilidad[tec.id]}>
                                {tec.nombre || `Técnico #${tec.usu_id}`} {disponibilidad[tec.id] ? "— Ocupado en ese horario" : ""}
                            </option>
                        ))}
                    </select>
                </label>

                <div className="form-actions">
                    <button type="submit" disabled={guardando} className="btn-primary">
                        {guardando ? "Guardando..." : "Guardar cambios"}
                    </button>
                    <button type="button" onClick={() => navigate("/ordenes")}>
                        Volver
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditarOrden;
