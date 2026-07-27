import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

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

    if (loading) return <p style={{ padding: "24px" }}>Cargando...</p>;

    const clientesFiltrados = clientes.filter(
        (c) =>
            c.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
            c.email?.toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
        <div style={{ padding: "24px" }}>
            <h2>Clientes y Equipos</h2>

            {error && <p style={{ color: "red" }}>{error}</p>}

            <input
                type="text"
                placeholder="Buscar por nombre o correo..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                style={{ width: "100%", padding: "8px", margin: "16px 0" }}
            />

            {clientesFiltrados.length === 0 ? (
                <p>No se encontraron clientes.</p>
            ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ textAlign: "left", borderBottom: "2px solid #e5e7eb" }}>
                            <th style={{ padding: "8px" }}>Nombre</th>
                            <th style={{ padding: "8px" }}>Correo</th>
                            <th style={{ padding: "8px" }}>Teléfono</th>
                            <th style={{ padding: "8px" }}>Estado</th>
                            <th style={{ padding: "8px" }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {clientesFiltrados.map((cliente) => (
                            <tr key={cliente.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                <td style={{ padding: "8px" }}>{cliente.nombre}</td>
                                <td style={{ padding: "8px" }}>{cliente.email}</td>
                                <td style={{ padding: "8px" }}>{cliente.telefono || "—"}</td>
                                <td style={{ padding: "8px" }}>
                                    <span
                                        style={{
                                            padding: "2px 8px",
                                            borderRadius: "999px",
                                            fontSize: "12px",
                                            background: cliente.activo ? "#dcfce7" : "#f3f4f6",
                                            color: cliente.activo ? "#15803d" : "#6b7280",
                                        }}
                                    >
                                        {cliente.activo ? "Activo" : "Inactivo"}
                                    </span>
                                </td>
                                <td style={{ padding: "8px" }}>
                                    <Link to={`/clientes/${cliente.id}`}>
                                        <button>Ver detalle</button>
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default ClientesEquipos;