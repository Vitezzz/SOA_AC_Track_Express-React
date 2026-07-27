import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ESTILOS_ESTADO = {
    pendiente: { color: "#b45309", background: "#fef3c7" },
    en_proceso: { color: "#1d4ed8", background: "#dbeafe" },
    pagada: { color: "#7c3aed", background: "#ede9fe" },
    completada: { color: "#15803d", background: "#dcfce7" },
    cancelada: { color: "#b91c1c", background: "#fee2e2" },
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

    if (loading) return <p style={{ padding: "24px" }}>Cargando...</p>;

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
        <div style={{ padding: "24px" }}>
            <h2>Gestión de Órdenes</h2>

            {puedeCrear && (
                <Link to="/ordenes/nueva">
                    <button style={{ marginBottom: "12px" }}>+ Nueva Orden</button>
                </Link>
            )}

            {error && <p style={{ color: "red" }}>{error}</p>}

            <div style={{ display: "flex", gap: "12px", margin: "16px 0" }}>
                <input
                    type="text"
                    placeholder="Buscar por folio o cliente..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    style={{ flex: 1, padding: "8px" }}
                />
                <select
                    value={filtroEstatus}
                    onChange={(e) => setFiltroEstatus(e.target.value)}
                    style={{ padding: "8px" }}
                >
                    <option value="todos">Todos los estatus</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="en_proceso">En proceso</option>
                    <option value="completada">Completada</option>
                    <option value="cancelada">Cancelada</option>
                </select>
            </div>

            {ordenesOrdenadas.length === 0 ? (
                <p>No se encontraron órdenes con esos filtros.</p>
            ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ textAlign: "left", borderBottom: "2px solid #e5e7eb" }}>
                            <th style={{ padding: "8px" }}>Folio</th>
                            <th style={{ padding: "8px" }}>Cliente</th>
                            <th style={{ padding: "8px" }}>Técnico</th>
                            <th style={{ padding: "8px" }}>Estatus</th>
                            <th style={{ padding: "8px" }}>Fecha</th>
                            <th style={{ padding: "8px" }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ordenesOrdenadas.map((orden) => {
                            const estilo = ESTILOS_ESTADO[orden.estatus] || { color: "#374151", background: "#f3f4f6" };
                            return (
                                <tr key={orden.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                    <td style={{ padding: "8px" }}>{orden.folio || "—"}</td>
                                    <td style={{ padding: "8px" }}>{orden.nombreCliente}</td>
                                    <td style={{ padding: "8px" }}>{orden.tec_id || "Sin asignar"}</td>
                                    <td style={{ padding: "8px" }}>
                                        <span style={{ ...estilo, padding: "2px 8px", borderRadius: "999px", fontSize: "12px" }}>
                                            {orden.estatus}
                                        </span>
                                    </td>
                                    <td style={{ padding: "8px" }}>
                                        {orden.fecha_programada
                                            ? new Date(orden.fecha_programada).toLocaleDateString("es-MX")
                                            : "Sin fecha"}
                                    </td>
                                    <td style={{ padding: "8px" }}>
                                        <Link to={`/ordenes/${orden.id}/editar`}>
                                            <button>Editar</button>
                                        </Link>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default GestionOrdenes;