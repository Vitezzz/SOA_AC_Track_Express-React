import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

const ESTILOS_ESTADO_PAGO = {
    pendiente: "bg-yellow-100 text-yellow-700",
    pagado: "bg-green-100 text-green-700",
    cancelado: "bg-red-100 text-red-700",
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

    if (loading) return <p className="text-center mt-10">Cargando...</p>

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Mis Pagos</h2>
            {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

            {pagos.length === 0 ? (
                <p className="text-gray-500 text-center">Todavía no tienes pagos.</p>
            ) : (
                <div className="space-y-4">
                    {pagos.map((pag) => {
                        const clase = ESTILOS_ESTADO_PAGO[pag.estado] || "bg-gray-100 text-gray-600";
                        const folioOrden = ordenes.find((o) => o.id === pag.ord_id)?.folio;

                        return (
                            <div key={pag.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                                <div className="flex justify-between items-start mb-3">
                                    <span className="font-semibold text-gray-900">
                                        Orden: {folioOrden || "—"}
                                    </span>
                                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${clase}`}>
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