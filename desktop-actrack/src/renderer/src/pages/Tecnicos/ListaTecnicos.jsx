import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ListaTecnicos = () => {
    const [tecnicos, setTecnicos] = useState([]);
    const [especialidades, setEspecialidades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [busqueda, setBusqueda] = useState("");
    const [filtroDisponibilidad, setFiltroDisponibilidad] = useState("todos");

    const { apiFetch } = useAuth();

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const [resTecnicos, resEspecialidades] = await Promise.all([
                    apiFetch("/api/tecnicos/todos"),
                    apiFetch("/api/especialidad/"),
                ]);

                if (resTecnicos.status === 404) {
                    setTecnicos([]);
                } else if (!resTecnicos.ok) {
                    throw new Error("No se pudieron cargar los técnicos");
                } else {
                    setTecnicos(await resTecnicos.json());
                }

                if (resEspecialidades.ok) setEspecialidades(await resEspecialidades.json());
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        cargarDatos();
    }, []);

    if (loading) return <p style={{ padding: "24px" }}>Cargando...</p>;

    const tecnicosConEspecialidad = tecnicos.map((tec) => {
        const especialidad = especialidades.find((e) => e.id === tec.esp_id);
        return { ...tec, nombreMostrar: tec.nombre || `Técnico #${tec.usu_id}`, nombreEspecialidad: especialidad?.nombre || "—" };
    });

    const tecnicosFiltrados = tecnicosConEspecialidad.filter((tec) => {
        const coincideTexto =
            tec.nombreMostrar.toLowerCase().includes(busqueda.toLowerCase()) ||
            tec.nombreEspecialidad.toLowerCase().includes(busqueda.toLowerCase());

        const coincideDisponibilidad =
            filtroDisponibilidad === "todos" ||
            (filtroDisponibilidad === "disponibles" && tec.disponible) ||
            (filtroDisponibilidad === "no_disponibles" && !tec.disponible);

        return coincideTexto && coincideDisponibilidad;
    });

    return (
        <div style={{ padding: "24px" }}>
            <Link to="/home">← Inicio</Link>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2>Gestión de Técnicos</h2>
                <Link to="/tecnicos/nuevo">
                    <button>+ Nuevo Técnico</button>
                </Link>
            </div>

            {error && <p style={{ color: "red" }}>{error}</p>}

            <div style={{ display: "flex", gap: "12px", margin: "16px 0" }}>
                <input
                    type="text"
                    placeholder="Buscar por nombre o especialidad..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    style={{ flex: 1, padding: "8px" }}
                />
                <select
                    value={filtroDisponibilidad}
                    onChange={(e) => setFiltroDisponibilidad(e.target.value)}
                    style={{ padding: "8px" }}
                >
                    <option value="todos">Todos</option>
                    <option value="disponibles">Solo disponibles</option>
                    <option value="no_disponibles">Solo no disponibles</option>
                </select>
            </div>

            {tecnicosFiltrados.length === 0 ? (
                <p>No se encontraron técnicos con esos filtros.</p>
            ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ textAlign: "left", borderBottom: "2px solid #e5e7eb" }}>
                            <th style={{ padding: "8px" }}>Nombre</th>
                            <th style={{ padding: "8px" }}>Especialidad</th>
                            <th style={{ padding: "8px" }}>Disponibilidad</th>
                            <th style={{ padding: "8px" }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tecnicosFiltrados.map((tec) => (
                            <tr key={tec.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                <td style={{ padding: "8px" }}>{tec.nombreMostrar}</td>
                                <td style={{ padding: "8px" }}>{tec.nombreEspecialidad}</td>
                                <td style={{ padding: "8px" }}>
                                    <span
                                        style={{
                                            padding: "2px 8px",
                                            borderRadius: "999px",
                                            fontSize: "12px",
                                            background: tec.disponible ? "#dcfce7" : "#f3f4f6",
                                            color: tec.disponible ? "#15803d" : "#6b7280",
                                        }}
                                    >
                                        {tec.disponible ? "Disponible" : "No disponible"}
                                    </span>
                                </td>
                                <td style={{ padding: "8px" }}>
                                    <Link to={`/tecnicos/${tec.id}/editar`}>
                                        <button>Editar</button>
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

export default ListaTecnicos;