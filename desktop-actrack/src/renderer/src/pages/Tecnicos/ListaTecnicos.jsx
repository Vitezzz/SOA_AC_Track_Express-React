import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Icon from "../../components/Icon";

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

    if (loading) return <p className="page">Cargando...</p>;

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
        <div className="page">
            <Link to="/home" className="page-back">← Inicio</Link>
            <div className="page-header">
                <h2>Gestión de Técnicos</h2>
                <Link to="/tecnicos/nuevo">
                    <button className="btn-primary">+ Nuevo Técnico</button>
                </Link>
            </div>

            {error && <p className="error-text">{error}</p>}

            <div className="toolbar">
                <div className="search-field">
                    <Icon name="search" className="icon-sm" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o especialidad..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                </div>
                <select
                    value={filtroDisponibilidad}
                    onChange={(e) => setFiltroDisponibilidad(e.target.value)}
                >
                    <option value="todos">Todos</option>
                    <option value="disponibles">Solo disponibles</option>
                    <option value="no_disponibles">Solo no disponibles</option>
                </select>
            </div>

            {tecnicosFiltrados.length === 0 ? (
                <div className="panel empty-state">
                    <p className="empty-state-title">No se encontraron técnicos</p>
                    <p className="empty-state-description">Prueba con otro nombre, especialidad o filtro.</p>
                </div>
            ) : (
                <div className="table-wrap">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Especialidad</th>
                            <th>Disponibilidad</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tecnicosFiltrados.map((tec) => (
                            <tr key={tec.id}>
                                <td>{tec.nombreMostrar}</td>
                                <td>{tec.nombreEspecialidad}</td>
                                <td>
                                    <span className={`badge ${tec.disponible ? "badge-success" : "badge-neutral"}`}>
                                        {tec.disponible ? "Disponible" : "No disponible"}
                                    </span>
                                </td>
                                <td>
                                    <Link to={`/tecnicos/${tec.id}/editar`}>
                                        <button className="btn-sm">Editar</button>
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

export default ListaTecnicos;