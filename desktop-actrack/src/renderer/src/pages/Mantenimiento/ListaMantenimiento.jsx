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

    if (loading) return <p style={{ padding: "24px" }}>Cargando...</p>;

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
        <div style={{ padding: "24px" }}>
            <Link to="/home">← Inicio</Link>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2>Mantenimientos Preventivos</h2>
                <Link to="/mantenimiento/nuevo">
                    <button>+ Programar Mantenimiento</button>
                </Link>
            </div>

            {error && <p style={{ color: "red" }}>{error}</p>}

            {mantenimientosConDatos.length === 0 ? (
                <p>Todavía no hay mantenimientos programados.</p>
            ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "16px" }}>
                    <thead>
                        <tr style={{ textAlign: "left", borderBottom: "2px solid #e5e7eb" }}>
                            <th style={{ padding: "8px" }}>Cliente</th>
                            <th style={{ padding: "8px" }}>Equipo</th>
                            <th style={{ padding: "8px" }}>Frecuencia</th>
                            <th style={{ padding: "8px" }}>Próxima fecha</th>
                            <th style={{ padding: "8px" }}>Activo</th>
                            <th style={{ padding: "8px" }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mantenimientosConDatos.map((m) => (
                            <tr key={m.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                <td style={{ padding: "8px" }}>{m.nombreCliente}</td>
                                <td style={{ padding: "8px" }}>{m.descripcionEquipo}</td>
                                <td style={{ padding: "8px" }}>Cada {m.frecuencia_dias} días</td>
                                <td style={{ padding: "8px" }}>
                                    {new Date(m.proxima_fecha).toLocaleDateString("es-MX")}
                                </td>
                                <td style={{ padding: "8px" }}>{m.activo ? "Sí" : "No"}</td>
                                <td style={{ padding: "8px" }}>
                                    <Link to={`/mantenimiento/${m.id}/editar`}>
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

export default ListaMantenimiento;