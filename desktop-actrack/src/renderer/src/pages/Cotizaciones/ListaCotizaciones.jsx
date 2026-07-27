import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ESTILOS_ESTADO = {
    borrador: { color: "#6b7280", background: "#f3f4f6" },
    enviada: { color: "#1d4ed8", background: "#dbeafe" },
    aprobada: { color: "#15803d", background: "#dcfce7" },
    rechazada: { color: "#b91c1c", background: "#fee2e2" },
};

const formatoMoneda = (valor) =>
    new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(valor);

const ListaCotizaciones = () => {
    const [cotizaciones, setCotizaciones] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actualizandoId, setActualizandoId] = useState(null);

    const { apiFetch } = useAuth();

    const cargarDatos = async () => {
        try {
            const [resCotizaciones, resClientes] = await Promise.all([
                apiFetch("/api/cotizaciones"),
                apiFetch("/api/clientes/"),
            ]);

            if (resCotizaciones.status === 404) {
                setCotizaciones([]);
            } else if (!resCotizaciones.ok) {
                throw new Error("No se pudieron cargar las cotizaciones");
            } else {
                setCotizaciones(await resCotizaciones.json());
            }

            if (resClientes.ok) setClientes(await resClientes.json());
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

    const marcarComoEnviada = async (cotizacion) => {
        setActualizandoId(cotizacion.id);
        try {
            const res = await apiFetch(`/api/cotizaciones/${cotizacion.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...cotizacion, estado: "enviada" }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "No se pudo enviar la cotización");

            setCotizaciones((prev) =>
                prev.map((c) => (c.id === cotizacion.id ? { ...c, estado: "enviada" } : c))
            );
        } catch (err) {
            setError(err.message);
        } finally {
            setActualizandoId(null);
        }
    };

    if (loading) return <p style={{ padding: "24px" }}>Cargando...</p>;

    const cotizacionesConNombre = cotizaciones.map((cot) => {
        const cliente = clientes.find((c) => c.id === cot.cli_id);
        return { ...cot, nombreCliente: cliente?.nombre || `Cliente #${cot.cli_id}` };
    });

    return (
        <div style={{ padding: "24px" }}>
            <Link to="/home">← Inicio</Link>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2>Cotizaciones</h2>
                <Link to="/cotizaciones/nueva">
                    <button>+ Nueva Cotización</button>
                </Link>
            </div>

            {error && <p style={{ color: "red" }}>{error}</p>}

            {cotizacionesConNombre.length === 0 ? (
                <p>Todavía no hay cotizaciones.</p>
            ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "16px" }}>
                    <thead>
                        <tr style={{ textAlign: "left", borderBottom: "2px solid #e5e7eb" }}>
                            <th style={{ padding: "8px" }}>Folio</th>
                            <th style={{ padding: "8px" }}>Cliente</th>
                            <th style={{ padding: "8px" }}>Total</th>
                            <th style={{ padding: "8px" }}>Estado</th>
                            <th style={{ padding: "8px" }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cotizacionesConNombre.map((cot) => {
                            const estilo = ESTILOS_ESTADO[cot.estado] || { color: "#374151", background: "#f3f4f6" };
                            return (
                                <tr key={cot.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                    <td style={{ padding: "8px" }}>{cot.folio}</td>
                                    <td style={{ padding: "8px" }}>{cot.nombreCliente}</td>
                                    <td style={{ padding: "8px" }}>{formatoMoneda(cot.total)}</td>
                                    <td style={{ padding: "8px" }}>
                                        <span style={{ ...estilo, padding: "2px 8px", borderRadius: "999px", fontSize: "12px" }}>
                                            {cot.estado}
                                        </span>
                                    </td>
                                    <td style={{ padding: "8px", display: "flex", gap: "6px" }}>
                                        <Link to={`/cotizaciones/${cot.id}/editar`}><button>Editar</button></Link>
                                        {cot.estado === "borrador" && (
                                            <button onClick={() => marcarComoEnviada(cot)} disabled={actualizandoId === cot.id}>
                                                {actualizandoId === cot.id ? "Enviando..." : "Enviar al cliente"}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default ListaCotizaciones;