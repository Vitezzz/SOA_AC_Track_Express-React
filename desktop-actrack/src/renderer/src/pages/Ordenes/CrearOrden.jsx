import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

    const [cliId, setCliId] = useState("");
    const [equId, setEquId] = useState("");
    const [catId, setCatId] = useState("");
    const [priId, setPriId] = useState("");
    const [tecId, setTecId] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [fechaProgramada, setFechaProgramada] = useState("");

    const [loading, setLoading] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const cargarCatalogos = async () => {
            try {
                const [resClientes, resEquipos, resCategorias, resPrioridades, resTecnicos] = await Promise.all([
                    apiFetch("/api/clientes/"),
                    apiFetch("/api/equipos/"),
                    apiFetch("/api/categoriaServicio"),
                    apiFetch("/api/prioridad"),
                    apiFetch("/api/tecnicos/"),
                ]);

                if (resClientes.ok) setClientes(await resClientes.json());
                if (resEquipos.ok) setEquipos(await resEquipos.json());
                if (resCategorias.ok) setCategorias(await resCategorias.json());
                if (resPrioridades.ok) setPrioridades(await resPrioridades.json());
                if (resTecnicos.status !== 404 && resTecnicos.ok) setTecnicos(await resTecnicos.json());
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        cargarCatalogos();
    }, []);

    // Solo mostramos equipos del cliente ya elegido -- no tiene sentido
    // ofrecer equipos de otros clientes al crear la orden.
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

    if (loading) return <p style={{ padding: "24px" }}>Cargando...</p>;

    return (
        <div style={{ padding: "24px", maxWidth: "480px" }}>
            <h2>Nueva Orden de Servicio</h2>

            {error && <p style={{ color: "red" }}>{error}</p>}

            <form onSubmit={handleSubmit}>
                <label style={{ display: "block", marginBottom: "12px" }}>
                    <span style={{ display: "block", marginBottom: "4px" }}>Cliente *</span>
                    <select value={cliId} onChange={(e) => { setCliId(e.target.value); setEquId(""); }} style={{ width: "100%", padding: "8px" }}>
                        <option value="">Selecciona un cliente</option>
                        {clientes.map((c) => (
                            <option key={c.id} value={c.id}>{c.nombre}</option>
                        ))}
                    </select>
                </label>

                <label style={{ display: "block", marginBottom: "12px" }}>
                    <span style={{ display: "block", marginBottom: "4px" }}>Equipo (opcional)</span>
                    <select value={equId} onChange={(e) => setEquId(e.target.value)} style={{ width: "100%", padding: "8px" }} disabled={!cliId}>
                        <option value="">Sin equipo registrado</option>
                        {equiposDelCliente.map((eq) => (
                            <option key={eq.id} value={eq.id}>{eq.tipo} — {eq.modelo}</option>
                        ))}
                    </select>
                </label>

                <label style={{ display: "block", marginBottom: "12px" }}>
                    <span style={{ display: "block", marginBottom: "4px" }}>Categoría de servicio *</span>
                    <select value={catId} onChange={(e) => setCatId(e.target.value)} style={{ width: "100%", padding: "8px" }}>
                        <option value="">Selecciona una categoría</option>
                        {categorias.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                        ))}
                    </select>
                </label>

                <label style={{ display: "block", marginBottom: "12px" }}>
                    <span style={{ display: "block", marginBottom: "4px" }}>Descripción de la falla *</span>
                    <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} style={{ width: "100%", padding: "8px" }} />
                </label>

                <label style={{ display: "block", marginBottom: "12px" }}>
                    <span style={{ display: "block", marginBottom: "4px" }}>Fecha programada *</span>
                    <input type="datetime-local" value={fechaProgramada} onChange={(e) => setFechaProgramada(e.target.value)} style={{ width: "100%", padding: "8px" }} />
                </label>

                <label style={{ display: "block", marginBottom: "12px" }}>
                    <span style={{ display: "block", marginBottom: "4px" }}>Técnico (opcional, asignar ahora)</span>
                    <select value={tecId} onChange={(e) => setTecId(e.target.value)} style={{ width: "100%", padding: "8px" }}>
                        <option value="">Sin asignar</option>
                        {tecnicos.map((tec) => (
                            <option key={tec.id} value={tec.id}>Técnico #{tec.usu_id}</option>
                        ))}
                    </select>
                </label>

                <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
                    <button type="submit" disabled={guardando}>
                        {guardando ? "Creando..." : "Crear orden"}
                    </button>
                    <button type="button" onClick={() => navigate("/ordenes")}>Cancelar</button>
                </div>
            </form>
        </div>
    );
};

export default CrearOrden;