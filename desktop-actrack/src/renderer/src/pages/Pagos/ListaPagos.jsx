import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ESTILOS_ESTADO = {
    pendiente: { color: "#b45309", background: "#fef3c7" },
    pagado: { color: "#15803d", background: "#dcfce7" },
    cancelado: { color: "#b91c1c", background: "#fee2e2" },
};

const formatoMoneda = (valor) =>
    new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(valor);

const ListaPagos = () => {
    const [pagos, setPagos] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [ordenes, setOrdenes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const { apiFetch } = useAuth();

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const [resPagos, resClientes, resOrdenes] = await Promise.all([
                    apiFetch("/api/pagos"),
                    apiFetch("/api/clientes/"),
                    apiFetch("/api/ordenes_servicio"),
                ]);

                if (resPagos.status === 404) {
                    setPagos([]);
                } else if (!resPagos.ok) {
                    throw new Error("No se pudieron cargar los pagos");
                } else {
                    setPagos(await resPagos.json());
                }

                if (resClientes.ok) setClientes(await resClientes.json());
                if (resOrdenes.ok) setOrdenes(await resOrdenes.json());
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        cargarDatos();
    }, []);

    if (loading) return <p style={{ padding: "24px" }}>Cargando...</p>;

    const pagosConDatos = pagos.map((pago) => {
        const cliente = clientes.find((c) => c.id === pago.cli_id);
        const orden = ordenes.find((o) => o.id === pago.ord_id);
        return {
            ...pago,
            nombreCliente: cliente?.nombre || `Cliente #${pago.cli_id}`,
            folioOrden: orden?.folio || `Orden #${pago.ord_id}`,
        };
    });

    return (
        <div style={{ padding: "24px" }}>
            <Link to="/home">← Inicio</Link>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2>Pagos</h2>
                <Link to="/pagos/nuevo">
                    <button>+ Registrar Pago</button>
                </Link>
            </div>

            {error && <p style={{ color: "red" }}>{error}</p>}

            {pagosConDatos.length === 0 ? (
                <p>Todavía no hay pagos registrados.</p>
            ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "16px" }}>
                    <thead>
                        <tr style={{ textAlign: "left", borderBottom: "2px solid #e5e7eb" }}>
                            <th style={{ padding: "8px" }}>Orden</th>
                            <th style={{ padding: "8px" }}>Cliente</th>
                            <th style={{ padding: "8px" }}>Monto</th>
                            <th style={{ padding: "8px" }}>Método</th>
                            <th style={{ padding: "8px" }}>Estado</th>
                            <th style={{ padding: "8px" }}>Fecha</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pagosConDatos.map((pago) => {
                            const estilo = ESTILOS_ESTADO[pago.estado] || { color: "#374151", background: "#f3f4f6" };
                            return (
                                <tr key={pago.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                    <td style={{ padding: "8px" }}>{pago.folioOrden}</td>
                                    <td style={{ padding: "8px" }}>{pago.nombreCliente}</td>
                                    <td style={{ padding: "8px" }}>{formatoMoneda(pago.monto)}</td>
                                    <td style={{ padding: "8px", textTransform: "capitalize" }}>{pago.metodo}</td>
                                    <td style={{ padding: "8px" }}>
                                        <span style={{ ...estilo, padding: "2px 8px", borderRadius: "999px", fontSize: "12px" }}>
                                            {pago.estado}
                                        </span>
                                    </td>
                                    <td style={{ padding: "8px" }}>
                                        {pago.created_at
                                            ? new Date(pago.created_at).toLocaleDateString("es-MX")
                                            : "—"}
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

export default ListaPagos;