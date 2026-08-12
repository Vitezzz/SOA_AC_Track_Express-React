import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Icon from "../../components/Icon";

const formatoMoneda = (valor) =>
    new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(valor);

const CrearPago = () => {
    const navigate = useNavigate();
    const { apiFetch, user } = useAuth();

    const [ordenes, setOrdenes] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [cotizaciones, setCotizaciones] = useState([]);
    const [pagos, setPagos] = useState([]);

    const [ordId, setOrdId] = useState("");
    const [metodo, setMetodo] = useState("efectivo");
    const [monto, setMonto] = useState("");
    const [estadoManual, setEstadoManual] = useState("pagado");

    const [loading, setLoading] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState("");

    const esTecnico = user?.rol_id === 4;

    useEffect(() => {
        const cargarCatalogos = async () => {
            try {
                const [resOrdenes, resClientes, resCotizaciones, resPagos] = await Promise.all([
                    apiFetch("/api/ordenes_servicio"),
                    apiFetch("/api/clientes/"),
                    apiFetch("/api/cotizaciones"),
                    apiFetch("/api/pagos"),
                ]);

                if (resClientes.ok) setClientes(await resClientes.json());

                let cotizacionesData = [];
                if (resCotizaciones.status !== 404 && resCotizaciones.ok) {
                    cotizacionesData = await resCotizaciones.json();
                    setCotizaciones(cotizacionesData);
                }

                if (resOrdenes.ok) {
                    const todas = await resOrdenes.json();
                    // Solo mostramos órdenes que: (1) todavía deben algo
                    // (ni canceladas, ni ya pagadas) Y (2) YA tienen una
                    // cotización aprobada -- si nadie la ha cotizado
                    // todavía, ni siquiera tiene sentido que aparezca aquí.
                    const ordenesConCotizacionAprobada = todas.filter((orden) => {
                        const noDebeNada = orden.estatus === "cancelada" || orden.estatus === "pagada";
                        if (noDebeNada) return false;
                        return cotizacionesData.some((c) => c.ord_id === orden.id && c.estado === "aprobada");
                    });
                    setOrdenes(ordenesConCotizacionAprobada);
                }

                if (resPagos.status !== 404 && resPagos.ok) setPagos(await resPagos.json());
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        cargarCatalogos();
    }, []);

    const ordenSeleccionada = ordenes.find((o) => String(o.id) === ordId);

    const cotizacionAprobada = cotizaciones.find((c) => c.ord_id === Number(ordId) && c.estado === "aprobada");
    const sumaYaPagada = pagos
        .filter((p) => p.ord_id === Number(ordId) && p.estado === "pagado")
        .reduce((suma, p) => suma + Number(p.monto), 0);
    const saldoPendiente = cotizacionAprobada ? Number(cotizacionAprobada.total) - sumaYaPagada : null;

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
                    estado: esTecnico ? "pagado" : estadoManual,
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

    if (loading) return <p className="page">Cargando...</p>;

    return (
        <div className="page page-narrow">
            <h2>{esTecnico ? "Confirmar Pago Recibido" : "Registrar Pago"}</h2>

            {error && <p className="error-text">{error}</p>}

            <form onSubmit={handleSubmit} className="form">
                <label>
                    <span>Orden de servicio *</span>
                    <select value={ordId} onChange={(e) => setOrdId(e.target.value)}>
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
                    {ordenes.length === 0 && (
                        <p className="hint-text">No hay órdenes con saldo pendiente de cobro.</p>
                    )}
                </label>

                {ordId && (
                    <div style={{ background: "#f9fafb", borderRadius: "8px", padding: "12px", fontSize: "14px" }}>
                        {!cotizacionAprobada ? (
                            <p style={{ color: "#b45309", display: "flex", alignItems: "flex-start", gap: "6px" }}>
                                <Icon name="warning" className="icon-sm" style={{ marginTop: "2px", flexShrink: 0 }} />
                                <span>Esta orden no tiene una cotización aprobada — no se puede registrar un pago todavía.</span>
                            </p>
                        ) : (
                            <>
                                <p>Total cotizado: <strong>{formatoMoneda(cotizacionAprobada.total)}</strong></p>
                                <p>Ya cobrado: <strong>{formatoMoneda(sumaYaPagada)}</strong></p>
                                <p>Saldo pendiente: <strong style={{ color: saldoPendiente > 0 ? "#b91c1c" : "#15803d" }}>
                                    {formatoMoneda(saldoPendiente)}
                                </strong></p>
                            </>
                        )}
                    </div>
                )}

                <label>
                    <span>Método de pago *</span>
                    <select value={metodo} onChange={(e) => setMetodo(e.target.value)}>
                        <option value="efectivo">Efectivo</option>
                        <option value="transferencia">Transferencia</option>
                        <option value="tarjeta">Tarjeta</option>
                        <option value="otro">Otro</option>
                    </select>
                </label>

                <label>
                    <span>Monto *</span>
                    <input
                        type="number"
                        step="0.01"
                        min="0"
                        max={saldoPendiente || undefined}
                        value={monto}
                        onChange={(e) => setMonto(e.target.value)}
                    />
                </label>

                {!esTecnico && (
                    <label>
                        <span>¿Ya se recibió este pago? *</span>
                        <select value={estadoManual} onChange={(e) => setEstadoManual(e.target.value)}>
                            <option value="pagado">Sí, ya se cobró</option>
                            <option value="pendiente">No, sigue pendiente (solo registro de expectativa)</option>
                        </select>
                    </label>
                )}

                <p className="hint-text" style={{ marginBottom: "0.75rem" }}>
                    {esTecnico
                        ? "Estás confirmando que el cliente ya te pagó, en el momento del servicio."
                        : "Si el monto no cubre el total de la cotización, la orden NO se marcará como pagada -- podrás registrar más abonos después."}
                </p>

                <div className="form-actions" style={{ marginTop: 0 }}>
                    <button type="submit" disabled={guardando || !cotizacionAprobada} className="btn-primary">
                        {guardando ? "Registrando..." : esTecnico ? "Confirmar cobro" : "Registrar pago"}
                    </button>
                    <button type="button" onClick={() => navigate("/pagos")}>Cancelar</button>
                </div>
            </form>
        </div>
    );
};

export default CrearPago;