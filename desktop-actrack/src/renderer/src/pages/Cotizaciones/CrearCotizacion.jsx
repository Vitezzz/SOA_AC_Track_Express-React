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

    if (loading) return <p style={{ padding: "24px" }}>Cargando...</p>;

    return (
        <div style={{ padding: "24px", maxWidth: "480px" }}>
            <h2>Nueva Cotización</h2>

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
                    <span style={{ display: "block", marginBottom: "4px" }}>Técnico responsable *</span>
                    <select value={tecId} onChange={(e) => setTecId(e.target.value)} style={{ width: "100%", padding: "8px" }}>
                        <option value="">Selecciona un técnico</option>
                        {tecnicos.map((tec) => (
                            <option key={tec.id} value={tec.id}>Técnico #{tec.usu_id}</option>
                        ))}
                    </select>
                </label>

                <label style={{ display: "block", marginBottom: "12px" }}>
                    <span style={{ display: "block", marginBottom: "4px" }}>Total *</span>
                    <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={total}
                        onChange={(e) => setTotal(e.target.value)}
                        style={{ width: "100%", padding: "8px" }}
                    />
                </label>

                <label style={{ display: "block", marginBottom: "12px" }}>
                    <span style={{ display: "block", marginBottom: "4px" }}>Notas</span>
                    <textarea value={notas} onChange={(e) => setNotas(e.target.value)} style={{ width: "100%", padding: "8px" }} />
                </label>

                <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
                    <button type="submit" disabled={guardando}>
                        {guardando ? "Creando..." : "Crear cotización (borrador)"}
                    </button>
                    <button type="button" onClick={() => navigate("/cotizaciones")}>Cancelar</button>
                </div>
            </form>
        </div>
    );
};

export default CrearCotizacion;