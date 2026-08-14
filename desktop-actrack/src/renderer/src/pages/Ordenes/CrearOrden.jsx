import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const NIVELES_PRIORIDAD = { 1: "baja", 2: "normal", 3: "alta", 4: "urgente" };

const CrearOrden = () => {
    const navigate = useNavigate();
    const { apiFetch } = useAuth();

    const [clientes, setClientes] = useState([]);
    const [equipos, setEquipos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [prioridades, setPrioridades] = useState([]);
    const [tecnicos, setTecnicos] = useState([]);
    const [especialidades, setEspecialidades] = useState([]);
    const [disponibilidad, setDisponibilidad] = useState({});

    const [cliId, setCliId] = useState("");
    const [equId, setEquId] = useState("");
    const [catId, setCatId] = useState("");
    const [priId, setPriId] = useState("");
    const [tecId, setTecId] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [fechaProgramada, setFechaProgramada] = useState("");
    const [duracionEstimada, setDuracionEstimada] = useState("2");

    const [loading, setLoading] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!fechaProgramada) return;
        const consultarDisponibilidad = async () => {
            const res = await apiFetch(
                `/api/tecnicos/disponibilidad?fecha=${fechaProgramada}&duracion=${duracionEstimada || 2}`
            );
            if (res.ok) {
                const datos = await res.json();
                const mapa = {};
                datos.forEach((t) => { mapa[t.id] = t.ocupado; });
                setDisponibilidad(mapa);
            }
        };
        consultarDisponibilidad();
    }, [fechaProgramada, duracionEstimada]);

    useEffect(() => {
        const cargarCatalogos = async () => {
            try {
                const [resClientes, resEquipos, resCategorias, resPrioridades, resTecnicos, resEsp] = await Promise.all([
                    apiFetch("/api/clientes/"),
                    apiFetch("/api/equipos/"),
                    apiFetch("/api/categoriaServicio"),
                    apiFetch("/api/prioridad"),
                    apiFetch("/api/tecnicos/todos"),
                    apiFetch("/api/especialidad"),
                ]);

                if (resClientes.ok) setClientes(await resClientes.json());
                if (resEquipos.ok) setEquipos(await resEquipos.json());
                if (resCategorias.ok) setCategorias(await resCategorias.json());
                if (resPrioridades.ok) setPrioridades(await resPrioridades.json());
                if (resTecnicos.status !== 404 && resTecnicos.ok) setTecnicos(await resTecnicos.json());
                if (resEsp.ok) setEspecialidades(await resEsp.json());
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        cargarCatalogos();
    }, []);

    const equiposDelCliente = equipos.filter((eq) => String(eq.cli_id) === String(cliId));

    const prioridadNormal = prioridades.find((p) => p.num_prioridad === 2);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!cliId || !catId || !descripcion || !fechaProgramada) {
            setError("Completa los campos obligatorios");
            return;
        }

        const prioridadElegida = priId ? prioridades.find((p) => String(p.id) === String(priId)) : prioridadNormal;
        if (!prioridadElegida) {
            setError("No hay prioridad configurada en el catálogo");
            return;
        }

        setGuardando(true);
        try {
            const res = await apiFetch("/api/ordenes_servicio", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    cli_id: Number(cliId),
                    equ_id: equId ? Number(equId) : null,
                    cat_id: Number(catId),
                    pri_id: prioridadElegida.id,
                    prioridad: NIVELES_PRIORIDAD[prioridadElegida.num_prioridad] || "normal",
                    estatus: "pendiente",
                    descripcion,
                    fecha_programada: fechaProgramada,
                    fecha_cierre: null,
                    tec_id: tecId ? Number(tecId) : null,
                    duracion_estimada_horas: Number(duracionEstimada) || 2,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "No se pudo crear la orden");

            navigate("/ordenes");
        } catch (err) {
            setError(err.message);
        } finally {
            setGuardando(false);
        }
    };

    if (loading) return <p className="page">Cargando...</p>;

    const especialidadesPorId = new Map(especialidades.map((e) => [e.id, e]));
    const clienteElegido = clientes.find((c) => String(c.id) === cliId);
    const equipoElegido = equiposDelCliente.find((eq) => String(eq.id) === equId);
    const categoriaElegida = categorias.find((c) => String(c.id) === catId);
    const tecnicoElegido = tecnicos.find((t) => String(t.id) === tecId);

    return (
        <div className="page">
            <Link to="/ordenes" className="page-back">← Volver a Órdenes</Link>
            <div className="page-header">
                <h2>Nueva Orden de Servicio</h2>
            </div>

            {error && <p className="error-text">{error}</p>}

            <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "1.5rem", alignItems: "start", width: "100%" }}>
            <div className="panel">
            <form onSubmit={handleSubmit} className="form">
                <label>
                    <span>Cliente *</span>
                    <select value={cliId} onChange={(e) => { setCliId(e.target.value); setEquId(""); }}>
                        <option value="">Selecciona un cliente</option>
                        {clientes.map((c) => (
                            <option key={c.id} value={c.id}>{c.nombre}</option>
                        ))}
                    </select>
                </label>

                <label>
                    <span>Equipo (opcional)</span>
                    <select value={equId} onChange={(e) => setEquId(e.target.value)} disabled={!cliId}>
                        <option value="">Sin equipo registrado</option>
                        {equiposDelCliente.map((eq) => (
                            <option key={eq.id} value={eq.id}>{eq.tipo} — {eq.modelo}</option>
                        ))}
                    </select>
                </label>

                <label>
                    <span>Categoría de servicio *</span>
                    <select value={catId} onChange={(e) => setCatId(e.target.value)}>
                        <option value="">Selecciona una categoría</option>
                        {categorias.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                        ))}
                    </select>
                </label>

                <label>
                    <span>Descripción de la falla *</span>
                    <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
                </label>

                <label>
                    <span>Fecha programada *</span>
                    <input type="datetime-local" value={fechaProgramada} onChange={(e) => setFechaProgramada(e.target.value)} />
                </label>

                <label>
                    <span>Duración estimada (horas) *</span>
                    <input
                        type="number"
                        min="0.5"
                        step="0.5"
                        value={duracionEstimada}
                        onChange={(e) => setDuracionEstimada(e.target.value)}
                    />
                </label>

                <label>
                    <span>Técnico (opcional, asignar ahora)</span>
                    <select value={tecId} onChange={(e) => setTecId(e.target.value)}>
                        <option value="">Sin asignar</option>
                        {tecnicos.map((tec) => (
                            <option key={tec.id} value={tec.id} disabled={disponibilidad[tec.id]}>
                                {tec.nombre || `Técnico #${tec.usu_id}`}
                                {especialidadesPorId.get(tec.esp_id) ? ` — ${especialidadesPorId.get(tec.esp_id).nombre}` : ""}
                                {disponibilidad[tec.id] ? " — Ocupado en ese horario" : ""}
                            </option>
                        ))}
                    </select>
                </label>

                <div className="form-actions">
                    <button type="submit" disabled={guardando} className="btn-primary">
                        {guardando ? "Creando..." : "Crear orden"}
                    </button>
                    <button type="button" onClick={() => navigate("/ordenes")}>Cancelar</button>
                </div>
            </form>
            </div>

            <div className="panel">
                <p style={{ fontWeight: 600, marginBottom: "0.9rem" }}>Resumen</p>
                {!clienteElegido ? (
                    <p className="muted-text">Elige un cliente para ver aquí el resumen de la orden.</p>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", fontSize: "0.875rem" }}>
                        <p style={{ margin: 0 }}>
                            <span className="muted-text">Cliente: </span>
                            <strong>{clienteElegido.nombre}</strong>
                            {clienteElegido.telefono && <span className="muted-text"> · {clienteElegido.telefono}</span>}
                        </p>
                        {clienteElegido.direccion && (
                            <p style={{ margin: 0 }}><span className="muted-text">Dirección: </span>{clienteElegido.direccion}</p>
                        )}
                        <p style={{ margin: 0 }}>
                            <span className="muted-text">Equipo: </span>
                            {equipoElegido ? `${equipoElegido.tipo} — ${equipoElegido.modelo}` : "Sin equipo asociado"}
                        </p>
                        <p style={{ margin: 0 }}>
                            <span className="muted-text">Servicio: </span>
                            {categoriaElegida?.nombre || "Sin elegir"}
                        </p>
                        <p style={{ margin: 0 }}>
                            <span className="muted-text">Cuándo: </span>
                            {fechaProgramada ? new Date(fechaProgramada).toLocaleString("es-MX") : "Sin fecha"}
                            {" · "}{duracionEstimada || 2}h
                        </p>
                        <p style={{ margin: 0 }}>
                            <span className="muted-text">Técnico: </span>
                            {tecnicoElegido ? tecnicoElegido.nombre : "Sin asignar todavía"}
                        </p>
                    </div>
                )}
            </div>
            </div>
        </div>
    );
};

export default CrearOrden;