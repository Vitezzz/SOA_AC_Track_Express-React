import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const RegistrarMovimiento = () => {
    const navigate = useNavigate();
    const { apiFetch, user } = useAuth();

    const [inventario, setInventario] = useState([]);
    const [ordenes, setOrdenes] = useState([]);
    const [tipos, setTipos] = useState([]);
    const [movimientos, setMovimientos] = useState([]);

    const [invId, setInvId] = useState("");
    const [ordId, setOrdId] = useState("");
    const [tipId, setTipId] = useState("");
    const [cantidad, setCantidad] = useState("");

    const [loading, setLoading] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const cargarCatalogos = async () => {
            try {
                const [resInv, resOrd, resTipos, resMovimientos] = await Promise.all([
                    apiFetch("/api/inventario"),
                    apiFetch("/api/ordenes_servicio"),
                    apiFetch("/api/tipo_movimiento_inventario"),
                    apiFetch("/api/movimientos_inventario"),
                ]);

                if (resInv.ok) setInventario(await resInv.json());
                if (resOrd.ok) setOrdenes(await resOrd.json());
                if (resTipos.ok) setTipos(await resTipos.json());
                // No hay columna de fecha en movimientos_inventario -- el ID
                // (autoincremental) es lo único que nos dice cuál fue más
                // reciente.
                if (resMovimientos.status !== 404 && resMovimientos.ok) {
                    const datos = await resMovimientos.json();
                    setMovimientos(datos.sort((a, b) => b.id - a.id).slice(0, 15));
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        cargarCatalogos();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!invId || !tipId || !cantidad) {
            setError("Completa todos los campos obligatorios");
            return;
        }

        setGuardando(true);
        try {
            const res = await apiFetch("/api/movimientos_inventario", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    inv_id: Number(invId),
                    ord_id: ordId ? Number(ordId) : null,
                    usu_id: user.id,
                    tip_id: Number(tipId),
                    cantidad: Number(cantidad),
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "No se pudo registrar el movimiento");

            navigate("/inventario");
        } catch (err) {
            setError(err.message);
        } finally {
            setGuardando(false);
        }
    };

    if (loading) return <p className="page">Cargando...</p>;

    const articuloElegido = inventario.find((i) => String(i.id) === invId);

    const inventarioPorId = new Map(inventario.map((i) => [i.id, i]));
    const tiposPorId = new Map(tipos.map((t) => [t.id, t]));
    const ordenesPorId = new Map(ordenes.map((o) => [o.id, o]));

    return (
        <div className="page">
            <Link to="/inventario" className="page-back">← Volver a Inventario</Link>
            <div className="page-header">
                <div>
                    <h2>Registrar Movimiento</h2>
                    <p className="muted-text" style={{ marginTop: "0.25rem" }}>
                        Entradas, salidas y ajustes del inventario general -- para mover material a un técnico usa "Inventario en Vehículos".
                    </p>
                </div>
            </div>

            {error && <p className="error-text">{error}</p>}

            <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "1.5rem", alignItems: "start", width: "100%" }}>
                <div className="panel">
                    <form onSubmit={handleSubmit} className="form">
                        <label>
                            <span>Artículo *</span>
                            <select value={invId} onChange={(e) => setInvId(e.target.value)}>
                                <option value="">Selecciona un artículo</option>
                                {inventario.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.nombre} (stock: {item.stock_actual})
                                    </option>
                                ))}
                            </select>
                            {articuloElegido && (
                                <span className="hint-text">
                                    Stock actual en almacén: <strong>{articuloElegido.stock_actual}</strong>
                                </span>
                            )}
                        </label>

                        <label>
                            <span>Orden de servicio relacionada (opcional)</span>
                            <select value={ordId} onChange={(e) => setOrdId(e.target.value)}>
                                <option value="">Sin orden asociada</option>
                                {ordenes.map((orden) => (
                                    <option key={orden.id} value={orden.id}>{orden.folio}</option>
                                ))}
                            </select>
                        </label>

                        <label>
                            <span>Tipo de movimiento *</span>
                            <select value={tipId} onChange={(e) => setTipId(e.target.value)}>
                                <option value="">Selecciona un tipo</option>
                                {tipos.map((tipo) => (
                                    <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
                                ))}
                            </select>
                        </label>

                        <label>
                            <span>Cantidad *</span>
                            <input type="number" min="1" value={cantidad} onChange={(e) => setCantidad(e.target.value)} />
                        </label>

                        <div className="form-actions">
                            <button type="submit" disabled={guardando} className="btn-primary">
                                {guardando ? "Registrando..." : "Registrar"}
                            </button>
                            <button type="button" onClick={() => navigate("/inventario")}>Cancelar</button>
                        </div>
                    </form>
                </div>

                <div className="panel">
                    <p style={{ fontWeight: 600, marginBottom: "0.9rem" }}>Movimientos recientes</p>
                    {movimientos.length === 0 ? (
                        <p className="muted-text">Todavía no hay movimientos registrados.</p>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            {movimientos.map((mov) => {
                                const articulo = inventarioPorId.get(mov.inv_id);
                                const tipo = tiposPorId.get(mov.tip_id);
                                const orden = ordenesPorId.get(mov.ord_id);
                                return (
                                    <div
                                        key={mov.id}
                                        style={{
                                            display: "flex", justifyContent: "space-between", alignItems: "center",
                                            padding: "0.5rem 0.75rem", borderRadius: "var(--radius-sm)",
                                            border: "1px solid var(--color-border)", fontSize: "0.875rem",
                                        }}
                                    >
                                        <span>
                                            {articulo?.nombre || `Artículo #${mov.inv_id}`}
                                            {orden && <span className="muted-text"> · {orden.folio}</span>}
                                        </span>
                                        <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                            <span className="badge badge-neutral">{tipo?.nombre || "—"}</span>
                                            <strong>{mov.cantidad}</strong>
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RegistrarMovimiento;