import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Icon from "../../components/Icon";

const ClientesEquipos = () => {
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [busqueda, setBusqueda] = useState("");

    const { apiFetch } = useAuth();

    useEffect(() => {
        const cargarClientes = async () => {
            try {
                const res = await apiFetch("/api/clientes/");
                if (res.status === 404) {
                    setClientes([]);
                } else if (!res.ok) {
                    throw new Error("No se pudieron cargar los clientes");
                } else {
                    setClientes(await res.json());
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        cargarClientes();
    }, []);

    if (loading) return <p className="page">Cargando...</p>;

    const clientesFiltrados = clientes.filter(
        (c) =>
            c.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
            c.email?.toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
        <div className="page">
            <h2>Clientes y Equipos</h2>

            {error && <p className="error-text">{error}</p>}

            <div className="toolbar">
                <div className="search-field">
                    <Icon name="search" className="icon-sm" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o correo..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                </div>
            </div>

            {clientesFiltrados.length === 0 ? (
                <div className="panel empty-state">
                    <p className="empty-state-title">No se encontraron clientes</p>
                    <p className="empty-state-description">Prueba con otro nombre o correo.</p>
                </div>
            ) : (
                <div className="table-wrap">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Correo</th>
                            <th>Teléfono</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {clientesFiltrados.map((cliente) => (
                            <tr key={cliente.id}>
                                <td>{cliente.nombre}</td>
                                <td>{cliente.email}</td>
                                <td>{cliente.telefono || "—"}</td>
                                <td>
                                    <span className={`badge ${cliente.activo ? "badge-success" : "badge-neutral"}`}>
                                        {cliente.activo ? "Activo" : "Inactivo"}
                                    </span>
                                </td>
                                <td>
                                    <Link to={`/clientes/${cliente.id}`}>
                                        <button className="btn-sm">Ver detalle</button>
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                </div>
            )}
        </div>
    );
};

export default ClientesEquipos;