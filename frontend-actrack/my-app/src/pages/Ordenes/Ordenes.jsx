import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import LineaTiempoEstado from '../../components/LineaTiempoEstado.jsx';
import { Link } from "react-router-dom";
import LoadingState from "../../components/LoadingState.jsx";
import EmptyState from "../../components/EmptyState.jsx";

const Ordenes = () => {
    const [ordenes, setOrdenes] = useState([]);
    const [historiales, setHistoriales] = useState({}); // { [ord_id]: ["pendiente", "en_proceso", ...] }
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const { apiFetch } = useAuth();

    useEffect(() => {
        const cargarOrdenes = async () => {
            try {
                const res = await apiFetch("/api/ordenes_servicio");
                if (!res.ok) throw new Error("No se pudieron cargar tus órdenes");
                const dataOrdenes = await res.json();
                setOrdenes(dataOrdenes);

                // Por cada orden, pedimos su historial real de bitácora
                const resultados = await Promise.all(
                    dataOrdenes.map((orden) => apiFetch(`/api/bitacora_estados/orden/${orden.id}`))
                );

                const historialesPorOrden = {};
                for (let i = 0; i < dataOrdenes.length; i++) {
                    if (resultados[i].ok) {
                        const filas = await resultados[i].json();
                        historialesPorOrden[dataOrdenes[i].id] = filas.map((f) => f.estado_nuevo);
                    }
                }
                setHistoriales(historialesPorOrden);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        cargarOrdenes();
    }, []);

    if (loading) return <LoadingState />;

    return (
        <div className="page-container">
            <h2 className="page-title">Mis Órdenes</h2>

            {error && <p className="form-error mb-4">{error}</p>}

            {ordenes.length === 0 ? (
                <EmptyState
                    icon="wrench"
                    title="Todavía no tienes órdenes de servicio"
                    description="Cuando solicites un servicio, aparecerá aquí con su estatus en tiempo real."
                />
            ) : (
                <div className="space-y-4">
                    {ordenes.map((orden) => (
                        <Link key={orden.id} to={`/ordenes/${orden.id}`} className="panel block hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <span className="font-semibold text-gray-900">Folio: {orden.folio}</span>
                                <span className="text-gray-400 text-xs">
                                    {new Date(orden.fecha_programada).toLocaleDateString("es-MX", {
                                        day: "numeric", month: "short", year: "numeric",
                                        hour: "2-digit", minute: "2-digit",
                                    })}
                                </span>
                            </div>

                            <LineaTiempoEstado
                                estatus={orden.estatus}
                                historial={historiales[orden.id] || [orden.estatus]}
                            />

                            <p className="text-gray-600 text-sm mt-4">{orden.descripcion}</p>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Ordenes;