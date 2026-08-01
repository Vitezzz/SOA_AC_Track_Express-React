import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import LoadingState from "../../components/LoadingState";
import EmptyState from "../../components/EmptyState";

const ESTILOS_ESTADO_PAGO = {
    pendiente: "badge-status-warning",
    pagado: "badge-status-success",
    cancelado: "badge-status-danger",
};

const formatoMoneda = (valor) =>
    new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(valor);

const Pagos = () => {

    const [pagos, setPagos] = useState([]);
    const [ordenes, setOrdenes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const { apiFetch } = useAuth();

    useEffect(() => {

        const cargarPagos = async () => {
            try {

                const [resPagos, resOrdenes] = await Promise.all([
                    apiFetch("/api/pagos"),
                    apiFetch("/api/ordenes_servicio")
                ]);

                if (resOrdenes.status === 404) {
                    setOrdenes([]);
                    return;
                }

                if (!resOrdenes.ok) throw new Error('No se pudieron cargar las ordenes');
                setOrdenes(await resOrdenes.json());


                if (resPagos.status === 404) {
                    setPagos([])
                    return;
                }
                if (!resPagos.ok) throw new Error("No se pudieron cargar los pagos");
                setPagos(await resPagos.json());

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false)
            }
        };
        cargarPagos();
    }, [])

    if (loading) return <LoadingState />

    return (
        <div className="page-container">
            <h2 className="page-title">Mis Pagos</h2>
            {error && <p className="form-error mb-4">{error}</p>}

            {pagos.length === 0 ? (
                <EmptyState
                    icon="card"
                    title="Todavía no tienes pagos"
                    description="Cuando se registre un pago sobre alguna de tus órdenes, aparecerá aquí."
                />
            ) : (
                <div className="space-y-4">
                    {pagos.map((pag) => {
                        const clase = ESTILOS_ESTADO_PAGO[pag.estado] || "badge-status-neutral";
                        const folioOrden = ordenes.find((o) => o.id === pag.ord_id)?.folio;

                        return (
                            <div key={pag.id} className="panel">
                                <div className="flex justify-between items-start mb-3">
                                    <span className="font-semibold text-gray-900">
                                        Orden: {folioOrden || "—"}
                                    </span>
                                    <span className={`badge-status ${clase}`}>
                                        {pag.estado}
                                    </span>
                                </div>

                                <p className="text-gray-900 text-lg font-semibold mb-1">
                                    {formatoMoneda(pag.monto)}
                                </p>

                                <p className="text-gray-600 text-sm mb-1">
                                    Método: <span className="capitalize">{pag.metodo}</span>
                                </p>

                                <p className="text-gray-400 text-xs">
                                    {new Date(pag.created_at).toLocaleDateString("es-MX", {
                                        day: "numeric", month: "short", year: "numeric",
                                        hour: "2-digit", minute: "2-digit"
                                    })}
                                </p>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default Pagos;