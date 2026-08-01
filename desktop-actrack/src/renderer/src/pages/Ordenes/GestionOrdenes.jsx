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

const GestionOrdenes = () => {
    const [ordenes, setOrdenes] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [busqueda, setBusqueda] = useState("");
    const [filtroEstatus, setFiltroEstatus] = useState("todos");

    const { apiFetch, user } = useAuth();

    const puedeCrear = user?.rol_id === 2 || user?.rol_id === 5;

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const [resOrdenes, resClientes] = await Promise.all([
                    apiFetch("/api/ordenes_servicio"),
                    apiFetch("/api/clientes/"),
                ]);

                if (!resOrdenes.ok) throw new Error("No se pudieron cargar las órdenes");
                setOrdenes(await resOrdenes.json());

                if (resClientes.status === 404) {
                    setClientes([]);
                } else if (resClientes.ok) {
                    setClientes(await resClientes.json());
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        cargarDatos();
    }, []);

    if (loading) return <p className="page">Cargando...</p>;

    const ordenesConNombre = ordenes.map((orden) => {
        const cliente = clientes.find((c) => c.id === orden.cli_id);
        return { ...orden, nombreCliente: cliente?.nombre || `Cliente #${orden.cli_id}` };
    });

    const ordenesFiltradas = ordenesConNombre.filter((orden) => {
        const coincideTexto =
            orden.folio?.toLowerCase().includes(busqueda.toLowerCase()) ||
            orden.nombreCliente.toLowerCase().includes(busqueda.toLowerCase());

        const coincideEstatus = filtroEstatus === "todos" || orden.estatus === filtroEstatus;

        return coincideTexto && coincideEstatus;
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
                <select
                    value={filtroEstatus}
                    onChange={(e) => setFiltroEstatus(e.target.value)}
                >
                    <option value="todos">Todos los estatus</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="en_proceso">En proceso</option>
                    <option value="completada">Completada</option>
                    <option value="cancelada">Cancelada</option>
                </select>
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
                                    <td>{orden.tec_id || "Sin asignar"}</td>
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