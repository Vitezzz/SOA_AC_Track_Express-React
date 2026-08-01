import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ESTILOS_ESTADO = {
    borrador: "badge-neutral",
    enviada: "badge-info",
    aprobada: "badge-success",
    rechazada: "badge-danger",
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

    if (loading) return <p className="page">Cargando...</p>;

    const cotizacionesConNombre = cotizaciones.map((cot) => {
        const cliente = clientes.find((c) => c.id === cot.cli_id);
        return { ...cot, nombreCliente: cliente?.nombre || `Cliente #${cot.cli_id}` };
    });

    return (
        <div className="page">
            <Link to="/home" className="page-back">← Inicio</Link>
            <div className="page-header">
                <h2>Cotizaciones</h2>
                <Link to="/cotizaciones/nueva">
                    <button className="btn-primary">+ Nueva Cotización</button>
                </Link>
            </div>

            {error && <p className="error-text">{error}</p>}

            {cotizacionesConNombre.length === 0 ? (
                <div className="panel empty-state">
                    <p className="empty-state-title">Todavía no hay cotizaciones</p>
                    <p className="empty-state-description">Créalas desde una orden de servicio ya registrada.</p>
                </div>
            ) : (
                <div className="table-wrap">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Folio</th>
                            <th>Cliente</th>
                            <th>Total</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cotizacionesConNombre.map((cot) => {
                            const clase = ESTILOS_ESTADO[cot.estado] || "badge-neutral";
                            return (
                                <tr key={cot.id}>
                                    <td>{cot.folio}</td>
                                    <td>{cot.nombreCliente}</td>
                                    <td>{formatoMoneda(cot.total)}</td>
                                    <td>
                                        <span className={`badge ${clase}`}>{cot.estado}</span>
                                    </td>
                                    <td>
                                        <div className="table-actions">
                                            <Link to={`/cotizaciones/${cot.id}/editar`}><button className="btn-sm">Editar</button></Link>
                                            {cot.estado === "borrador" && (
                                                <button onClick={() => marcarComoEnviada(cot)} disabled={actualizandoId === cot.id} className="btn-sm">
                                                    {actualizandoId === cot.id ? "Enviando..." : "Enviar al cliente"}
                                                </button>
                                            )}
                                        </div>
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

export default ListaCotizaciones;