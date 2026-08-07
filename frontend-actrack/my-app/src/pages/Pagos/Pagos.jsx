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
    const [categorias, setCategorias] = useState([]);
    const [equipos, setEquipos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const { apiFetch } = useAuth();

    useEffect(() => {

        const cargarPagos = async () => {
            try {

                const [resPagos, resOrdenes, resCategorias, resEquipos] = await Promise.all([
                    apiFetch("/api/pagos"),
                    apiFetch("/api/ordenes_servicio"),
                    apiFetch("/api/categoriaServicio"),
                    apiFetch("/api/equipos/"),
                ]);

                if (resOrdenes.status === 404) {
                    setOrdenes([]);
                } else if (!resOrdenes.ok) {
                    throw new Error('No se pudieron cargar las ordenes');
                } else {
                    setOrdenes(await resOrdenes.json());
                }

                if (resCategorias.ok) setCategorias(await resCategorias.json());
                if (resEquipos.ok) setEquipos(await resEquipos.json());

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
                        const orden = ordenes.find((o) => o.id === pag.ord_id);
                        const categoria = categorias.find((c) => c.id === orden?.cat_id);
                        const equipo = equipos.find((e) => e.id === orden?.equ_id);

                        return (
                            <div key={pag.id} className="panel">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-semibold text-gray-900">
                                        {categoria?.nombre || "Pago de servicio"}
                                    </span>
                                    <span className={`badge-status ${clase}`}>
                                        {pag.estado}
                                    </span>
                                </div>

                                <p className="text-gray-500 text-sm mb-3">
                                    Orden: {orden?.folio || "—"}
                                    {equipo && ` · Equipo: ${equipo.tipo}${equipo.modelo ? ` (${equipo.modelo})` : ""}`}
                                </p>

                                {orden?.descripcion && (
                                    <p className="text-gray-600 text-sm mb-3">{orden.descripcion}</p>
                                )}

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