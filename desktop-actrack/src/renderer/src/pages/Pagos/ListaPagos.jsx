import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ESTILOS_ESTADO = {
    pendiente: "badge-warning",
    pagado: "badge-success",
    cancelado: "badge-danger",
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

    if (loading) return <p className="page">Cargando...</p>;

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
        <div className="page">
            <Link to="/home" className="page-back">← Inicio</Link>
            <div className="page-header">
                <h2>Pagos</h2>
                <Link to="/pagos/nuevo">
                    <button className="btn-primary">+ Registrar Pago</button>
                </Link>
            </div>

            {error && <p className="error-text">{error}</p>}

            {pagosConDatos.length === 0 ? (
                <div className="panel empty-state">
                    <p className="empty-state-title">Todavía no hay pagos registrados</p>
                    <p className="empty-state-description">Los pagos que registres aparecerán aquí.</p>
                </div>
            ) : (
                <div className="table-wrap">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Orden</th>
                            <th>Cliente</th>
                            <th>Monto</th>
                            <th>Método</th>
                            <th>Estado</th>
                            <th>Fecha</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pagosConDatos.map((pago) => {
                            const clase = ESTILOS_ESTADO[pago.estado] || "badge-neutral";
                            return (
                                <tr key={pago.id}>
                                    <td>{pago.folioOrden}</td>
                                    <td>{pago.nombreCliente}</td>
                                    <td>{formatoMoneda(pago.monto)}</td>
                                    <td style={{ textTransform: "capitalize" }}>{pago.metodo}</td>
                                    <td>
                                        <span className={`badge ${clase}`}>{pago.estado}</span>
                                    </td>
                                    <td>
                                        {pago.created_at
                                            ? new Date(pago.created_at).toLocaleDateString("es-MX")
                                            : "—"}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                </div>
            )}
        </div>
    );
};

export default ListaPagos;