import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Icon from "../../components/Icon";

const ESTILOS_ESTADO = {
    pendiente: "badge-warning",
    en_proceso: "badge-info",
    pagada: "badge-purple",
    completada: "badge-success",
    cancelada: "badge-danger",
};

// "Completadas" agrupa completada + pagada (para el admin, ambas ya
// significan que el trabajo en campo terminó). "Sin asignar" es su propia
// pestaña porque es justo lo que necesita atención inmediata: no importa
// el estatus, si no tiene técnico todavía nadie va a ir a atenderla.
const FILTROS = [
    { key: "todas", label: "Todas" },
    { key: "sin_asignar", label: "Sin asignar" },
    { key: "pendiente", label: "Pendientes" },
    { key: "en_proceso", label: "En curso" },
    { key: "completada", label: "Completadas" },
];

const coincideFiltro = (filtro, orden) => {
    if (filtro === "todas") return true;
    if (filtro === "sin_asignar") return !orden.tec_id && orden.estatus !== "cancelada" && orden.estatus !== "completada" && orden.estatus !== "pagada";
    if (filtro === "completada") return orden.estatus === "completada" || orden.estatus === "pagada";
    return orden.estatus === filtro;
};

const GestionOrdenes = () => {
    const [ordenes, setOrdenes] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [tecnicos, setTecnicos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [busqueda, setBusqueda] = useState("");
    const [filtro, setFiltro] = useState("todas");

    const { apiFetch, user } = useAuth();

    const puedeCrear = user?.rol_id === 2 || user?.rol_id === 5;

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const [resOrdenes, resClientes, resTecnicos] = await Promise.all([
                    apiFetch("/api/ordenes_servicio"),
                    apiFetch("/api/clientes/"),
                    apiFetch("/api/tecnicos/todos"),
                ]);

                if (!resOrdenes.ok) throw new Error("No se pudieron cargar las órdenes");
                setOrdenes(await resOrdenes.json());

                if (resClientes.status === 404) {
                    setClientes([]);
                } else if (resClientes.ok) {
                    setClientes(await resClientes.json());
                }

                if (resTecnicos.status !== 404 && resTecnicos.ok) setTecnicos(await resTecnicos.json());
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        cargarDatos();
    }, []);

    if (loading) return <p className="page">Cargando...</p>;

    const tecnicosPorId = new Map(tecnicos.map((t) => [t.id, t]));

    const ordenesConNombre = ordenes.map((orden) => {
        const cliente = clientes.find((c) => c.id === orden.cli_id);
        return {
            ...orden,
            nombreCliente: cliente?.nombre || `Cliente #${orden.cli_id}`,
            nombreTecnico: orden.tec_id
                ? tecnicosPorId.get(orden.tec_id)?.nombre || `Técnico #${orden.tec_id}`
                : null,
        };
    });

    const ordenesFiltradas = ordenesConNombre.filter((orden) => {
        const coincideTexto =
            orden.folio?.toLowerCase().includes(busqueda.toLowerCase()) ||
            orden.nombreCliente.toLowerCase().includes(busqueda.toLowerCase());

        return coincideTexto && coincideFiltro(filtro, orden);
    });

    const ordenesOrdenadas = [...ordenesFiltradas].sort((a, b) => {
        if (!a.fecha_programada) return 1;
        if (!b.fecha_programada) return -1;
        return new Date(b.fecha_programada) - new Date(a.fecha_programada);
    });

    return (
        <div className="page">
            <div className="page-header">
                <h2>Gestión de Órdenes</h2>
                {puedeCrear && (
                    <Link to="/ordenes/nueva">
                        <button className="btn-primary">+ Nueva Orden</button>
                    </Link>
                )}
            </div>

            {error && <p className="error-text">{error}</p>}

            <div className="toolbar">
                <div className="search-field">
                    <Icon name="search" className="icon-sm" />
                    <input
                        type="text"
                        placeholder="Buscar por folio o cliente..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                </div>
            </div>

            <div className="tabs">
                {FILTROS.map((f) => (
                    <button
                        key={f.key}
                        onClick={() => setFiltro(f.key)}
                        className={filtro === f.key ? "tab active" : "tab"}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {ordenesOrdenadas.length === 0 ? (
                <div className="panel empty-state">
                    <p className="empty-state-title">No se encontraron órdenes</p>
                    <p className="empty-state-description">Prueba con otro folio, cliente o filtro de estatus.</p>
                </div>
            ) : (
                <div className="table-wrap">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Folio</th>
                            <th>Cliente</th>
                            <th>Técnico</th>
                            <th>Estatus</th>
                            <th>Fecha</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ordenesOrdenadas.map((orden) => {
                            const clase = ESTILOS_ESTADO[orden.estatus] || "badge-neutral";
                            return (
                                <tr key={orden.id}>
                                    <td>{orden.folio || "—"}</td>
                                    <td>{orden.nombreCliente}</td>
                                    <td>
                                        {orden.nombreTecnico || (
                                            <span className="badge badge-warning">Sin asignar</span>
                                        )}
                                    </td>
                                    <td>
                                        <span className={`badge ${clase}`}>{orden.estatus}</span>
                                    </td>
                                    <td>
                                        {orden.fecha_programada
                                            ? new Date(orden.fecha_programada).toLocaleDateString("es-MX")
                                            : "Sin fecha"}
                                    </td>
                                    <td>
                                        <Link to={`/ordenes/${orden.id}/editar`}>
                                            <button className="btn-sm">Editar</button>
                                        </Link>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                </div>
            )}
        </div>
    );
};

export default GestionOrdenes;