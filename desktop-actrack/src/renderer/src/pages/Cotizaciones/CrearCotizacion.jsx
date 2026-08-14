import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const CrearCotizacion = () => {
    const navigate = useNavigate();
    const { apiFetch, user } = useAuth();

    const [ordenes, setOrdenes] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [tecnicos, setTecnicos] = useState([]);
    const [equipos, setEquipos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [cotizacionesExistentes, setCotizacionesExistentes] = useState([]);

    const [ordId, setOrdId] = useState("");
    const [tecId, setTecId] = useState("");
    const [notas, setNotas] = useState("");

    const [loading, setLoading] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const cargarCatalogos = async () => {
            try {
                const [resOrdenes, resClientes, resTecnicos, resCotizaciones, resEquipos, resCategorias] = await Promise.all([
                    apiFetch("/api/ordenes_servicio"),
                    apiFetch("/api/clientes/"),
                    apiFetch("/api/tecnicos/"),
                    apiFetch("/api/cotizaciones"),
                    apiFetch("/api/equipos/"),
                    apiFetch("/api/categoriaServicio"),
                ]);

                if (resOrdenes.ok) setOrdenes(await resOrdenes.json());
                if (resClientes.ok) setClientes(await resClientes.json());
                if (resEquipos.ok) setEquipos(await resEquipos.json());
                if (resCategorias.ok) setCategorias(await resCategorias.json());

                if (resTecnicos.status !== 404 && resTecnicos.ok) {
                    const listaTecnicos = await resTecnicos.json();
                    setTecnicos(listaTecnicos);

                    if (user.rol_id === 4) {
                        const yoMismo = listaTecnicos.find((t) => t.usu_id === user.id);
                        if (yoMismo) setTecId(String(yoMismo.id));
                    }
                }

                if (resCotizaciones.status === 404) {
                    setCotizacionesExistentes([]);
                } else if (resCotizaciones.ok) {
                    setCotizacionesExistentes(await resCotizaciones.json());
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        cargarCatalogos();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Una orden ya no aparece disponible si tiene una cotización activa
    // (borrador, enviada o aprobada) -- pero si su única cotización fue
    // rechazada, sí se puede volver a cotizar.
    const ordenesDisponibles = ordenes.filter((orden) => {
        const cotizacionesDeEstaOrden = cotizacionesExistentes.filter((c) => c.ord_id === orden.id);
        const tieneCotizacionActiva = cotizacionesDeEstaOrden.some((c) => c.estado !== "rechazada");
        return !tieneCotizacionActiva;
    });

    const ordenSeleccionada = ordenes.find((o) => String(o.id) === ordId);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!ordId || !tecId) {
            setError("Completa todos los campos obligatorios");
            return;
        }

        setGuardando(true);
        try {
            const res = await apiFetch("/api/cotizaciones", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ord_id: Number(ordId),
                    tec_id: Number(tecId),
                    cli_id: ordenSeleccionada.cli_id,
                    estado: "borrador",
                    total: 0,
                    notas,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "No se pudo crear la cotización");

            navigate(`/cotizaciones/${data.id}/editar`);
        } catch (err) {
            setError(err.message);
        } finally {
            setGuardando(false);
        }
    };

    if (loading) return <p className="page">Cargando...</p>;

    return (
        <div className="page">
            <Link to="/cotizaciones" className="page-back">← Volver a Cotizaciones</Link>
            <div className="page-header">
                <h2>Nueva Cotización</h2>
            </div>

            {error && <p className="error-text">{error}</p>}

            <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: "1.5rem", alignItems: "start", width: "100%" }}>
            <div className="panel">
            <form onSubmit={handleSubmit} className="form">
                <label>
                    <span>Orden de servicio *</span>
                    <select value={ordId} onChange={(e) => setOrdId(e.target.value)}>
                        <option value="">Selecciona una orden</option>
                        {ordenesDisponibles.map((orden) => {
                            const cliente = clientes.find((c) => c.id === orden.cli_id);
                            return (
                                <option key={orden.id} value={orden.id}>
                                    {orden.folio} — {cliente?.nombre || `Cliente #${orden.cli_id}`}
                                </option>
                            );
                        })}
                    </select>
                    {ordenesDisponibles.length === 0 && (
                        <span className="hint-text">
                            No hay órdenes disponibles para cotizar (todas ya tienen una cotización activa).
                        </span>
                    )}
                </label>

                <label>
                    <span>Técnico responsable *</span>
                    {user.rol_id === 4 ? (
                        <p style={{ padding: "8px", background: "#f3f4f6", borderRadius: "6px" }}>
                            Tú mismo ({user.nombre || `Técnico #${user.id}`})
                        </p>
                    ) : (
                        <select value={tecId} onChange={(e) => setTecId(e.target.value)}>
                            <option value="">Selecciona un técnico</option>
                            {tecnicos.map((tec) => (
                                <option key={tec.id} value={tec.id}>{tec.nombre || `Técnico #${tec.usu_id}`}</option>
                            ))}
                        </select>
                    )}
                </label>

                <label>
                    <span>Notas</span>
                    <textarea value={notas} onChange={(e) => setNotas(e.target.value)} />
                </label>

                <div className="form-actions">
                    <button type="submit" disabled={guardando} className="btn-primary">
                        {guardando ? "Creando..." : "Crear cotización"}
                    </button>
                    <button type="button" onClick={() => navigate("/cotizaciones")}>Cancelar</button>
                </div>
            </form>
            </div>

            <div className="panel">
                <p style={{ fontWeight: 600, marginBottom: "0.9rem" }}>Detalle de la orden</p>
                {!ordenSeleccionada ? (
                    <p className="muted-text">Elige una orden para ver aquí el cliente, equipo y falla reportada.</p>
                ) : (() => {
                    const cliente = clientes.find((c) => c.id === ordenSeleccionada.cli_id);
                    const equipo = equipos.find((e) => e.id === ordenSeleccionada.equ_id);
                    const categoria = categorias.find((c) => c.id === ordenSeleccionada.cat_id);
                    return (
                        <div style={{ fontSize: "14px", lineHeight: "1.6" }}>
                            <p><strong>Cliente:</strong> {cliente?.nombre || `#${ordenSeleccionada.cli_id}`}
                                {cliente?.telefono && ` · ${cliente.telefono}`}
                            </p>
                            <p><strong>Equipo:</strong> {equipo ? `${equipo.tipo || "—"}${equipo.modelo ? ` ${equipo.modelo}` : ""}` : "Sin equipo asociado"}</p>
                            <p><strong>Servicio solicitado:</strong> {categoria?.nombre || `#${ordenSeleccionada.cat_id}`}</p>
                            {ordenSeleccionada.descripcion && <p style={{ marginBottom: 0 }}><strong>Descripción:</strong> {ordenSeleccionada.descripcion}</p>}
                        </div>
                    );
                })()}
            </div>
            </div>
        </div>
    );
};

export default CrearCotizacion;