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

    if (loading) return <p style={{ padding: "24px" }}>Cargando...</p>;

    return (
        <div style={{ padding: "24px", maxWidth: "700px" }}>
            <Link to="/clientes">← Volver a Clientes</Link>

            {error && <p style={{ color: "red" }}>{error}</p>}
            {guardado && <p style={{ color: "green" }}>¡Cliente actualizado correctamente!</p>}

            {cliente && (
                <>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
                        <h2>{cliente.nombre}</h2>
                        {!editando && <button onClick={() => setEditando(true)}>Editar</button>}
                    </div>

                    {!editando ? (
                        <p style={{ color: "#6b7280" }}>
                            {cliente.email} · {cliente.telefono || "Sin teléfono"} · {cliente.direccion || "Sin dirección"} ·{" "}
                            {cliente.activo ? "Activo" : "Inactivo"}
                        </p>
                    ) : (
                        <form onSubmit={handleGuardar} style={{ marginTop: "12px", maxWidth: "360px" }}>
                            <label style={{ display: "block", marginBottom: "12px" }}>
                                <span style={{ display: "block", marginBottom: "4px" }}>Teléfono</span>
                                <input
                                    type="tel"
                                    value={telefono}
                                    onChange={(e) => setTelefono(e.target.value)}
                                    style={{ width: "100%", padding: "8px" }}
                                />
                            </label>
                            <label style={{ display: "block", marginBottom: "12px" }}>
                                <span style={{ display: "block", marginBottom: "4px" }}>Dirección</span>
                                <input
                                    type="text"
                                    value={direccion}
                                    onChange={(e) => setDireccion(e.target.value)}
                                    style={{ width: "100%", padding: "8px" }}
                                />
                            </label>
                            <label style={{ display: "block", marginBottom: "12px" }}>
                                <input
                                    type="checkbox"
                                    checked={activo}
                                    onChange={(e) => setActivo(e.target.checked)}
                                    style={{ marginRight: "8px" }}
                                />
                                Cliente activo
                            </label>
                            <div style={{ display: "flex", gap: "8px" }}>
                                <button type="submit" disabled={guardando}>
                                    {guardando ? "Guardando..." : "Guardar cambios"}
                                </button>
                                <button type="button" onClick={() => setEditando(false)}>Cancelar</button>
                            </div>
                        </form>
                    )}

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "24px" }}>
                        <h3>Equipos registrados ({equipos.length})</h3>
                        <Link to={`/clientes/${id}/equipos/nuevo`}><button>+ Registrar Equipo</button></Link>
                    </div>

                    {equipos.length === 0 ? (
                        <p style={{ color: "#9ca3af" }}>Este cliente no tiene equipos registrados.</p>
                    ) : (
                        <ul style={{ listStyle: "none", padding: 0 }}>
                            {equipos.map((eq) => (
                                <li
                                    key={eq.id}
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        padding: "8px 0",
                                        borderBottom: "1px solid #f3f4f6",
                                    }}
                                >
                                    <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
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
                                                style={{
                                                    width: "48px",
                                                    height: "48px",
                                                    background: "#f3f4f6",
                                                    borderRadius: "6px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    fontSize: "10px",
                                                    color: "#9ca3af",
                                                    flexShrink: 0,
                                                }}
                                            >
                                                Sin foto
                                            </span>
                                        )}
                                        <span>{eq.tipo} — {eq.modelo} ({eq.numero_serie})</span>
                                    </span>
                                    <span style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                                        <Link to={`/equipos/${eq.id}/editar`}><button>Editar</button></Link>
                                        {user?.rol_id === 2 && (
                                            <button onClick={() => handleDesactivar(eq.id)} style={{ color: "red" }}>Desactivar</button>
                                        )}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}

                    <h3 style={{ marginTop: "24px" }}>Historial de órdenes ({ordenes.length})</h3>
                    {ordenes.length === 0 ? (
                        <p style={{ color: "#9ca3af" }}>Este cliente no tiene órdenes registradas.</p>
                    ) : (
                        <ul>
                            {ordenes.map((orden) => (
                                <li key={orden.id} style={{ padding: "4px 0" }}>
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