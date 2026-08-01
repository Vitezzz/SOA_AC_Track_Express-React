import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const RegistrarMovimiento = () => {
    const navigate = useNavigate();
    const { apiFetch, user } = useAuth();

    const [inventario, setInventario] = useState([]);
    const [ordenes, setOrdenes] = useState([]);
    const [tipos, setTipos] = useState([]);

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
                const [resInv, resOrd, resTipos] = await Promise.all([
                    apiFetch("/api/inventario"),
                    apiFetch("/api/ordenes_servicio"),
                    apiFetch("/api/tipo_movimiento_inventario"),
                ]);

                if (resInv.ok) setInventario(await resInv.json());
                if (resOrd.ok) setOrdenes(await resOrd.json());
                if (resTipos.ok) setTipos(await resTipos.json());
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

        if (!invId || !ordId || !tipId || !cantidad) {
            setError("Completa todos los campos");
            return;
        }

        setGuardando(true);
        try {
            const res = await apiFetch("/api/movimientos_inventario", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    inv_id: Number(invId),
                    ord_id: Number(ordId),
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

    return (
        <div className="page page-narrow">
            <h2>Registrar Movimiento de Inventario</h2>

            {error && <p className="error-text">{error}</p>}

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
                </label>

                <label>
                    <span>Orden de servicio relacionada *</span>
                    <select value={ordId} onChange={(e) => setOrdId(e.target.value)}>
                        <option value="">Selecciona una orden</option>
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
                    <button type="submit" disabled={guardando} className="btn-primary">{guardando ? "Registrando..." : "Registrar"}</button>
                    <button type="button" onClick={() => navigate("/inventario")}>Cancelar</button>
                </div>
            </form>
        </div>
    );
};

export default RegistrarMovimiento;