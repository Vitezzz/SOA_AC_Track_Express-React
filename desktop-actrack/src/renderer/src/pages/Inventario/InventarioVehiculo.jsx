import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Icon from "../../components/Icon";

const InventarioVehiculo = () => {
    const { apiFetch } = useAuth();

    const [inventarioGeneral, setInventarioGeneral] = useState([]);
    const [tecnicos, setTecnicos] = useState([]);
    const [stockVehiculos, setStockVehiculos] = useState([]);

    const [invId, setInvId] = useState("");
    const [tecId, setTecId] = useState("");
    const [cantidad, setCantidad] = useState("");

    const [loading, setLoading] = useState(true);
    const [procesando, setProcesando] = useState(false);
    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");

    const cargarDatos = async () => {
        try {
            const [resInventario, resTecnicos, resStock] = await Promise.all([
                apiFetch("/api/inventario"),
                apiFetch("/api/tecnicos/todos"),
                apiFetch("/api/inventario_vehiculo"),
            ]);

            if (resInventario.ok) setInventarioGeneral(await resInventario.json());
            if (resTecnicos.status !== 404 && resTecnicos.ok) setTecnicos(await resTecnicos.json());

            if (resStock.status === 404) {
                setStockVehiculos([]);
            } else if (resStock.ok) {
                setStockVehiculos(await resStock.json());
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarDatos();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleAccion = async (endpoint) => {
        setError("");
        setMensaje("");

        if (!invId || !tecId || !cantidad) {
            setError("Completa artículo, técnico y cantidad");
            return;
        }

        setProcesando(true);
        try {
            const res = await apiFetch(`/api/inventario_vehiculo/${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    inv_id: Number(invId),
                    tec_id: Number(tecId),
                    cantidad: Number(cantidad),
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "No se pudo completar la operación");

            setMensaje(data.message);
            setCantidad("");
            await cargarDatos(); // recarga la tabla para reflejar el cambio
        } catch (err) {
            setError(err.message);
        } finally {
            setProcesando(false);
        }
    };

    if (loading) return <p className="page">Cargando...</p>;

    const stockConDatos = stockVehiculos.map((s) => {
        const articulo = inventarioGeneral.find((i) => i.id === s.inv_id);
        const tecnico = tecnicos.find((t) => t.id === s.tec_id);
        return {
            ...s,
            nombreArticulo: articulo?.nombre || `Artículo #${s.inv_id}`,
            nombreTecnico: tecnico?.nombre || `Técnico #${s.tec_id}`,
        };
    });

    // Agrupado por técnico -- una tabla plana de 3 columnas no dejaba ver
    // de un vistazo "qué trae cada quién", que es la pregunta real de esta
    // pantalla (¿quién tiene qué material asignado ahorita?).
    const porTecnico = new Map();
    stockConDatos.forEach((s) => {
        if (!porTecnico.has(s.tec_id)) porTecnico.set(s.tec_id, { nombreTecnico: s.nombreTecnico, items: [] });
        porTecnico.get(s.tec_id).items.push(s);
    });
    const gruposTecnico = Array.from(porTecnico.values());

    return (
        <div className="page">
            <Link to="/inventario" className="page-back">← Volver a Inventario</Link>
            <div className="page-header">
                <div>
                    <h2>Inventario en Vehículos</h2>
                    <p className="muted-text" style={{ marginTop: "0.25rem" }}>
                        Mueve material del almacén a un técnico, o de vuelta -- así queda registrado quién trae qué en su vehículo.
                    </p>
                </div>
            </div>

            {error && <p className="error-text">{error}</p>}
            {mensaje && <p className="success-text">{mensaje}</p>}

            <div className="panel" style={{ marginBottom: "1.5rem", maxWidth: "34rem" }}>
                <p style={{ fontWeight: 600, marginBottom: "0.9rem" }}>Transferir / Devolver</p>

                <div className="form">
                    <label>
                        <span>Artículo</span>
                        <select value={invId} onChange={(e) => setInvId(e.target.value)}>
                            <option value="">Selecciona un artículo</option>
                            {inventarioGeneral.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.nombre} (almacén: {item.stock_actual})
                                </option>
                            ))}
                        </select>
                    </label>

                    <label>
                        <span>Técnico</span>
                        <select value={tecId} onChange={(e) => setTecId(e.target.value)}>
                            <option value="">Selecciona un técnico</option>
                            {tecnicos.map((tec) => (
                                <option key={tec.id} value={tec.id}>{tec.nombre || `Técnico #${tec.usu_id}`}</option>
                            ))}
                        </select>
                    </label>

                    <label>
                        <span>Cantidad</span>
                        <input
                            type="number"
                            min="0.001"
                            step="0.001"
                            value={cantidad}
                            onChange={(e) => setCantidad(e.target.value)}
                        />
                    </label>

                    <div className="form-actions">
                        <button onClick={() => handleAccion("transferir")} disabled={procesando} className="btn-primary">
                            {procesando ? "Procesando..." : "→ Transferir a vehículo"}
                        </button>
                        <button onClick={() => handleAccion("devolver")} disabled={procesando}>
                            {procesando ? "Procesando..." : "← Devolver al almacén"}
                        </button>
                    </div>
                </div>
            </div>

            <p style={{ fontWeight: 600, marginBottom: "0.9rem" }}>Stock actual en vehículos</p>
            {gruposTecnico.length === 0 ? (
                <div className="panel empty-state">
                    <div className="empty-state-icon"><Icon name="box" /></div>
                    <p className="empty-state-title">Ningún técnico tiene material asignado todavía</p>
                    <p className="empty-state-description">Usa el formulario de arriba para transferirle algo del almacén.</p>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1rem" }}>
                    {gruposTecnico.map((grupo) => (
                        <div key={grupo.nombreTecnico} className="panel">
                            <p style={{ fontWeight: 600, marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <Icon name="wrench" className="icon-sm" /> {grupo.nombreTecnico}
                            </p>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                {grupo.items.map((item) => (
                                    <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.875rem" }}>
                                        <span>{item.nombreArticulo}</span>
                                        <span className="badge badge-neutral">{item.cantidad}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default InventarioVehiculo;