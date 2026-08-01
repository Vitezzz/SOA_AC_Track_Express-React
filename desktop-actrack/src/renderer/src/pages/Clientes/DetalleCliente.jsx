import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const DetalleCliente = () => {
    const { id } = useParams();
    const { apiFetch, user } = useAuth();

    const [cliente, setCliente] = useState(null);
    const [equipos, setEquipos] = useState([]);
    const [ordenes, setOrdenes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [editando, setEditando] = useState(false);
    const [telefono, setTelefono] = useState("");
    const [direccion, setDireccion] = useState("");
    const [activo, setActivo] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [guardado, setGuardado] = useState(false);

    const handleDesactivar = async (equipoId) => {
        if (!window.confirm("¿Desactivar este equipo? Ya no aparecerá como activo, pero conserva su historial.")) return;
        try {
            const res = await apiFetch(`/api/equipos/${equipoId}`, { method: "DELETE" });
            if (!res.ok) throw new Error("No se pudo desactivar el equipo");
            setEquipos((prev) => prev.map((e) => (e.id === equipoId ? { ...e, activo: false } : e)));
        } catch (err) {
            setError(err.message);
        }
    };

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const [resCliente, resEquipos, resOrdenes] = await Promise.all([
                    apiFetch(`/api/clientes/${id}`),
                    apiFetch("/api/equipos/"),
                    apiFetch("/api/ordenes_servicio"),
                ]);

                if (!resCliente.ok) throw new Error("No se pudo cargar el cliente");
                const dataCliente = await resCliente.json();
                setCliente(dataCliente);
                setTelefono(dataCliente.telefono || "");
                setDireccion(dataCliente.direccion || "");
                setActivo(dataCliente.activo);

                if (resEquipos.ok) {
                    const todosLosEquipos = await resEquipos.json();
                    setEquipos(todosLosEquipos.filter((eq) => String(eq.cli_id) === id));
                }

                if (resOrdenes.ok) {
                    const todasLasOrdenes = await resOrdenes.json();
                    setOrdenes(todasLasOrdenes.filter((o) => String(o.cli_id) === id));
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        cargarDatos();
    }, [id]);

    const handleGuardar = async (e) => {
        e.preventDefault();
        setError("");
        setGuardado(false);
        setGuardando(true);

        try {
            const res = await apiFetch(`/api/clientes/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    usu_id: cliente.usu_id,
                    nombre: cliente.nombre,
                    email: cliente.email,
                    telefono,
                    direccion,
                    activo,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "No se pudo actualizar el cliente");

            setCliente((prev) => ({ ...prev, telefono, direccion, activo }));
            setGuardado(true);
            setEditando(false);
        } catch (err) {
            setError(err.message);
        } finally {
            setGuardando(false);
        }
    };

    if (loading) return <p className="page">Cargando...</p>;

    return (
        <div className="page page-medium">
            <Link to="/clientes" className="page-back">← Volver a Clientes</Link>

            {error && <p className="error-text">{error}</p>}
            {guardado && <p className="success-text">¡Cliente actualizado correctamente!</p>}

            {cliente && (
                <>
                    <div className="page-header">
                        <h2>{cliente.nombre}</h2>
                        {!editando && <button onClick={() => setEditando(true)} className="btn-sm">Editar</button>}
                    </div>

                    {!editando ? (
                        <p className="muted-text">
                            {cliente.email} · {cliente.telefono || "Sin teléfono"} · {cliente.direccion || "Sin dirección"} ·{" "}
                            <span className={`badge ${cliente.activo ? "badge-success" : "badge-neutral"}`}>
                                {cliente.activo ? "Activo" : "Inactivo"}
                            </span>
                        </p>
                    ) : (
                        <form onSubmit={handleGuardar} className="form page-narrow" style={{ marginTop: "0.75rem" }}>
                            <label>
                                <span>Teléfono</span>
                                <input
                                    type="tel"
                                    value={telefono}
                                    onChange={(e) => setTelefono(e.target.value)}
                                />
                            </label>
                            <label>
                                <span>Dirección</span>
                                <input
                                    type="text"
                                    value={direccion}
                                    onChange={(e) => setDireccion(e.target.value)}
                                />
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={activo}
                                    onChange={(e) => setActivo(e.target.checked)}
                                />
                                Cliente activo
                            </label>
                            <div className="form-actions">
                                <button type="submit" disabled={guardando} className="btn-primary">
                                    {guardando ? "Guardando..." : "Guardar cambios"}
                                </button>
                                <button type="button" onClick={() => setEditando(false)}>Cancelar</button>
                            </div>
                        </form>
                    )}

                    <div className="page-header" style={{ marginTop: "1.75rem" }}>
                        <h3>Equipos registrados ({equipos.length})</h3>
                        <Link to={`/clientes/${id}/equipos/nuevo`}><button className="btn-sm">+ Registrar Equipo</button></Link>
                    </div>

                    {equipos.length === 0 ? (
                        <p className="muted-text">Este cliente no tiene equipos registrados.</p>
                    ) : (
                        <ul className="panel" style={{ padding: "0.5rem 1rem" }}>
                            {equipos.map((eq) => (
                                <li
                                    key={eq.id}
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        padding: "0.65rem 0",
                                        borderBottom: "1px solid var(--color-border)",
                                    }}
                                >
                                    <span style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                                        {eq.imagen_url ? (
                                            <img
                                                src={eq.imagen_url}
                                                alt={eq.modelo}
                                                style={{
                                                    width: "48px",
                                                    height: "48px",
                                                    objectFit: "cover",
                                                    borderRadius: "6px",
                                                    flexShrink: 0,
                                                }}
                                            />
                                        ) : (
                                            <span
                                                className="muted-text"
                                                style={{
                                                    width: "48px",
                                                    height: "48px",
                                                    background: "var(--color-bg)",
                                                    borderRadius: "6px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    fontSize: "10px",
                                                    flexShrink: 0,
                                                }}
                                            >
                                                Sin foto
                                            </span>
                                        )}
                                        <span>{eq.tipo} — {eq.modelo} ({eq.numero_serie})</span>
                                    </span>
                                    <span className="table-actions" style={{ flexShrink: 0 }}>
                                        <Link to={`/equipos/${eq.id}/editar`}><button className="btn-sm">Editar</button></Link>
                                        {user?.rol_id === 2 && (
                                            <button onClick={() => handleDesactivar(eq.id)} className="btn-sm btn-danger">Desactivar</button>
                                        )}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}

                    <h3 style={{ marginTop: "1.75rem", marginBottom: "0.5rem" }}>Historial de órdenes ({ordenes.length})</h3>
                    {ordenes.length === 0 ? (
                        <p className="muted-text">Este cliente no tiene órdenes registradas.</p>
                    ) : (
                        <ul className="panel" style={{ padding: "0.5rem 1rem" }}>
                            {ordenes.map((orden) => (
                                <li key={orden.id} style={{ padding: "0.35rem 0" }}>
                                    <Link to={`/ordenes/${orden.id}/editar`}>
                                        {orden.folio} — {orden.estatus}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </>
            )}
        </div>
    );
};

export default DetalleCliente;