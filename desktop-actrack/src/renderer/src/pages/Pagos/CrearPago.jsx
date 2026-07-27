import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const CrearPago = () => {
    const navigate = useNavigate();
    const { apiFetch } = useAuth();

    const [ordenes, setOrdenes] = useState([]);
    const [clientes, setClientes] = useState([]);

    const [ordId, setOrdId] = useState("");
    const [metodo, setMetodo] = useState("efectivo");
    const [monto, setMonto] = useState("");

    const [loading, setLoading] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const cargarCatalogos = async () => {
            try {
                const [resOrdenes, resClientes] = await Promise.all([
                    apiFetch("/api/ordenes_servicio"),
                    apiFetch("/api/clientes/"),
                ]);

                if (resOrdenes.ok) {
                    const todas = await resOrdenes.json();
                    // No tiene sentido registrar pago de órdenes ya pagadas
                    // o canceladas -- el backend también lo bloquearía.
                    setOrdenes(todas.filter((o) => o.estatus !== "pagada" && o.estatus !== "cancelada"));
                }
                if (resClientes.ok) setClientes(await resClientes.json());
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        cargarCatalogos();
    }, []);

    const ordenSeleccionada = ordenes.find((o) => String(o.id) === ordId);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!ordId || !metodo || !monto) {
            setError("Completa todos los campos obligatorios");
            return;
        }

        setGuardando(true);
        try {
            const res = await apiFetch("/api/pagos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ord_id: Number(ordId),
                    cli_id: ordenSeleccionada.cli_id,
                    metodo,
                    monto: Number(monto),
                    estado: "pendiente",
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "No se pudo registrar el pago");

            navigate("/pagos");
        } catch (err) {
            setError(err.message);
        } finally {
            setGuardando(false);
        }
    };

    if (loading) return <p style={{ padding: "24px" }}>Cargando...</p>;

    return (
        <div style={{ padding: "24px", maxWidth: "480px" }}>
            <h2>Registrar Pago</h2>

            {error && <p style={{ color: "red" }}>{error}</p>}

            <form onSubmit={handleSubmit}>
                <label style={{ display: "block", marginBottom: "12px" }}>
                    <span style={{ display: "block", marginBottom: "4px" }}>Orden de servicio *</span>
                    <select value={ordId} onChange={(e) => setOrdId(e.target.value)} style={{ width: "100%", padding: "8px" }}>
                        <option value="">Selecciona una orden</option>
                        {ordenes.map((orden) => {
                            const cliente = clientes.find((c) => c.id === orden.cli_id);
                            return (
                                <option key={orden.id} value={orden.id}>
                                    {orden.folio} — {cliente?.nombre || `Cliente #${orden.cli_id}`}
                                </option>
                            );
                        })}
                    </select>
                </label>

                <label style={{ display: "block", marginBottom: "12px" }}>
                    <span style={{ display: "block", marginBottom: "4px" }}>Método de pago *</span>
                    <select value={metodo} onChange={(e) => setMetodo(e.target.value)} style={{ width: "100%", padding: "8px" }}>
                        <option value="efectivo">Efectivo</option>
                        <option value="transferencia">Transferencia</option>
                        <option value="tarjeta">Tarjeta</option>
                        <option value="otro">Otro</option>
                    </select>
                </label>

                <label style={{ display: "block", marginBottom: "12px" }}>
                    <span style={{ display: "block", marginBottom: "4px" }}>Monto *</span>
                    <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={monto}
                        onChange={(e) => setMonto(e.target.value)}
                        style={{ width: "100%", padding: "8px" }}
                    />
                </label>

                <p style={{ color: "#6b7280", fontSize: "13px" }}>
                    Nota: al registrar este pago, la orden se marcará automáticamente como <strong>"pagada"</strong>.
                </p>

                <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                    <button type="submit" disabled={guardando}>
                        {guardando ? "Registrando..." : "Registrar pago"}
                    </button>
                    <button type="button" onClick={() => navigate("/pagos")}>Cancelar</button>
                </div>
            </form>
        </div>
    );
};

export default CrearPago;