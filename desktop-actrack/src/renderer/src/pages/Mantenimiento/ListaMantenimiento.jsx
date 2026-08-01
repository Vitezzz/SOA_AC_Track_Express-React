import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ListaMantenimiento = () => {
    const [mantenimientos, setMantenimientos] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [equipos, setEquipos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const { apiFetch } = useAuth();

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const [resMant, resClientes, resEquipos] = await Promise.all([
                    apiFetch("/api/mantenimiento_preventivo"),
                    apiFetch("/api/clientes/"),
                    apiFetch("/api/equipos/"),
                ]);

                if (resMant.status === 404) {
                    setMantenimientos([]);
                } else if (!resMant.ok) {
                    throw new Error("No se pudieron cargar los mantenimientos");
                } else {
                    setMantenimientos(await resMant.json());
                }

                if (resClientes.ok) setClientes(await resClientes.json());
                if (resEquipos.ok) setEquipos(await resEquipos.json());
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        cargarDatos();
    }, []);

    if (loading) return <p className="page">Cargando...</p>;

    const mantenimientosConDatos = mantenimientos.map((m) => {
        const cliente = clientes.find((c) => c.id === m.cli_id);
        const equipo = equipos.find((eq) => eq.id === m.equ_id);
        return {
            ...m,
            nombreCliente: cliente?.nombre || `Cliente #${m.cli_id}`,
            descripcionEquipo: equipo ? `${equipo.tipo} — ${equipo.modelo}` : `Equipo #${m.equ_id}`,
        };
    });

    return (
        <div className="page">
            <Link to="/home" className="page-back">← Inicio</Link>
            <div className="page-header">
                <h2>Mantenimientos Preventivos</h2>
                <Link to="/mantenimiento/nuevo">
                    <button className="btn-primary">+ Programar Mantenimiento</button>
                </Link>
            </div>

            {error && <p className="error-text">{error}</p>}

            {mantenimientosConDatos.length === 0 ? (
                <div className="panel empty-state">
                    <p className="empty-state-title">Todavía no hay mantenimientos programados</p>
                    <p className="empty-state-description">Programa una visita preventiva desde aquí.</p>
                </div>
            ) : (
                <div className="table-wrap">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Cliente</th>
                            <th>Equipo</th>
                            <th>Frecuencia</th>
                            <th>Próxima fecha</th>
                            <th>Activo</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mantenimientosConDatos.map((m) => (
                            <tr key={m.id}>
                                <td>{m.nombreCliente}</td>
                                <td>{m.descripcionEquipo}</td>
                                <td>Cada {m.frecuencia_dias} días</td>
                                <td>
                                    {new Date(m.proxima_fecha).toLocaleDateString("es-MX")}
                                </td>
                                <td>
                                    <span className={`badge ${m.activo ? "badge-success" : "badge-neutral"}`}>
                                        {m.activo ? "Sí" : "No"}
                                    </span>
                                </td>
                                <td>
                                    <Link to={`/mantenimiento/${m.id}/editar`}>
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

export default ListaMantenimiento;