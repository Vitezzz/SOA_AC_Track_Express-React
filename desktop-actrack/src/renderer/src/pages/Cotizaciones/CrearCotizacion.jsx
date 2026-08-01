import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const CrearCotizacion = () => {
    const navigate = useNavigate();
    const { apiFetch } = useAuth();

    const [ordenes, setOrdenes] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [tecnicos, setTecnicos] = useState([]);

    const [ordId, setOrdId] = useState("");
    const [tecId, setTecId] = useState("");
    const [total, setTotal] = useState("");
    const [notas, setNotas] = useState("");

    const [loading, setLoading] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const cargarCatalogos = async () => {
            try {
                const [resOrdenes, resClientes, resTecnicos] = await Promise.all([
                    apiFetch("/api/ordenes_servicio"),
                    apiFetch("/api/clientes/"),
                    apiFetch("/api/tecnicos/"),
                ]);

                if (resOrdenes.ok) setOrdenes(await resOrdenes.json());
                if (resClientes.ok) setClientes(await resClientes.json());
                if (resTecnicos.status !== 404 && resTecnicos.ok) setTecnicos(await resTecnicos.json());
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

        if (!ordId || !tecId || !total) {
            setError("Completa todos los campos obligatorios");
            return;
        }

        setGuardando(true);
        try {
            const res = await apiFetch("/api/cotizaciones", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ord_id: Number(ordId),
                    tec_id: Number(tecId),
                    cli_id: ordenSeleccionada.cli_id,
                    estado: "borrador",
                    total: Number(total),
                    notas,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "No se pudo crear la cotización");

            navigate("/cotizaciones");
        } catch (err) {
            setError(err.message);
        } finally {
            setGuardando(false);
        }
    };

    if (loading) return <p className="page">Cargando...</p>;

    return (
        <div className="page page-narrow">
            <h2>Nueva Cotización</h2>

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
                </label>

                <label>
                    <span>Técnico responsable *</span>
                    <select value={tecId} onChange={(e) => setTecId(e.target.value)}>
                        <option value="">Selecciona un técnico</option>
                        {tecnicos.map((tec) => (
                            <option key={tec.id} value={tec.id}>Técnico #{tec.usu_id}</option>
                        ))}
                    </select>
                </label>

                <label>
                    <span>Total *</span>
                    <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={total}
                        onChange={(e) => setTotal(e.target.value)}
                    />
                </label>

                <label>
                    <span>Notas</span>
                    <textarea value={notas} onChange={(e) => setNotas(e.target.value)} />
                </label>

                <div className="form-actions">
                    <button type="submit" disabled={guardando} className="btn-primary">
                        {guardando ? "Creando..." : "Crear cotización (borrador)"}
                    </button>
                    <button type="button" onClick={() => navigate("/cotizaciones")}>Cancelar</button>
                </div>
            </form>
        </div>
    );
};

export default CrearCotizacion;