import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

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

    if (loading) return <p style={{ padding: "24px" }}>Cargando...</p>;

    const stockConDatos = stockVehiculos.map((s) => {
        const articulo = inventarioGeneral.find((i) => i.id === s.inv_id);
        const tecnico = tecnicos.find((t) => t.id === s.tec_id);
        return {
            ...s,
            nombreArticulo: articulo?.nombre || `Artículo #${s.inv_id}`,
            nombreTecnico: tecnico ? `Técnico #${tecnico.usu_id}` : `Técnico #${s.tec_id}`,
        };
    });

    return (
        <div style={{ padding: "24px" }}>
            <Link to="/inventario">← Volver a Inventario</Link>
            <h2>Inventario en Vehículos</h2>

            {error && <p style={{ color: "red" }}>{error}</p>}
            {mensaje && <p style={{ color: "green" }}>{mensaje}</p>}

            <div className="panel" style={{ border: "1px solid #e5e7eb", borderRadius: "8px", padding: "16px", marginBottom: "24px", maxWidth: "480px" }}>
                <p style={{ fontWeight: "600", marginBottom: "12px" }}>Transferir / Devolver</p>

                <label style={{ display: "block", marginBottom: "12px" }}>
                    <span style={{ display: "block", marginBottom: "4px" }}>Artículo</span>
                    <select value={invId} onChange={(e) => setInvId(e.target.value)} style={{ width: "100%", padding: "8px" }}>
                        <option value="">Selecciona un artículo</option>
                        {inventarioGeneral.map((item) => (
                            <option key={item.id} value={item.id}>
                                {item.nombre} (almacén: {item.stock_actual})
                            </option>
                        ))}
                    </select>
                </label>

                <label style={{ display: "block", marginBottom: "12px" }}>
                    <span style={{ display: "block", marginBottom: "4px" }}>Técnico</span>
                    <select value={tecId} onChange={(e) => setTecId(e.target.value)} style={{ width: "100%", padding: "8px" }}>
                        <option value="">Selecciona un técnico</option>
                        {tecnicos.map((tec) => (
                            <option key={tec.id} value={tec.id}>Técnico #{tec.usu_id}</option>
                        ))}
                    </select>
                </label>

                <label style={{ display: "block", marginBottom: "12px" }}>
                    <span style={{ display: "block", marginBottom: "4px" }}>Cantidad</span>
                    <input
                        type="number"
                        min="0.001"
                        step="0.001"
                        value={cantidad}
                        onChange={(e) => setCantidad(e.target.value)}
                        style={{ width: "100%", padding: "8px" }}
                    />
                </label>

                <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={() => handleAccion("transferir")} disabled={procesando}>
                        {procesando ? "Procesando..." : "→ Transferir a vehículo"}
                    </button>
                    <button onClick={() => handleAccion("devolver")} disabled={procesando}>
                        {procesando ? "Procesando..." : "← Devolver al almacén"}
                    </button>
                </div>
            </div>

            <h3>Stock actual en vehículos</h3>
            {stockConDatos.length === 0 ? (
                <p>Ningún técnico tiene material asignado todavía.</p>
            ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ textAlign: "left", borderBottom: "2px solid #e5e7eb" }}>
                            <th style={{ padding: "8px" }}>Técnico</th>
                            <th style={{ padding: "8px" }}>Artículo</th>
                            <th style={{ padding: "8px" }}>Cantidad</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stockConDatos.map((s) => (
                            <tr key={s.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                <td style={{ padding: "8px" }}>{s.nombreTecnico}</td>
                                <td style={{ padding: "8px" }}>{s.nombreArticulo}</td>
                                <td style={{ padding: "8px" }}>{s.cantidad}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default InventarioVehiculo;