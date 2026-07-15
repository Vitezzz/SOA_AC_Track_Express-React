import { useState, useEffect } from "react";
import { Card } from "../../components/Card.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

const Ordenes = () => {
    const [ordenes, setOrdenes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const { apiFetch } = useAuth();

    useEffect(() => {
        const cargarOrdenes = async () => {
            try {
                const res = await apiFetch("/api/ordenes_servicio");
                if (!res.ok) throw new Error("No se pudieron cargar tus órdenes");
                setOrdenes(await res.json());
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        cargarOrdenes();
    }, []);

    const ESTILOS_ESTATUS = {
        pendiente: "bg-yellow-100 text-yellow-700",
        en_proceso: "bg-blue-100 text-blue-700",
        completada: "bg-green-100 text-green-700",
        cancelada: "bg-red-100 text-red-700",
    };

    if (loading) return <p className="text-center mt-10">Cargando...</p>;

    // ... seguimos abajo
    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Mis Órdenes</h2>

            {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

            {ordenes.length === 0 ? (
                <p className="text-gray-500 text-center">Todavía no tienes órdenes de servicio.</p>
            ) : (
                <div className="space-y-4">
                    {ordenes.map((orden) => {
                        const claseEstatus = ESTILOS_ESTATUS[orden.estatus] || "bg-gray-100 text-gray-700";
                        return (
                            <div key={orden.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-semibold text-gray-900">Folio: {orden.folio}</span>
                                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${claseEstatus}`}>
                                        {orden.estatus}
                                    </span>
                                </div>
                                <p className="text-gray-600 text-sm mb-2">{orden.descripcion}</p>
                                <p className="text-gray-400 text-xs">
                                    Programada: {new Date(orden.fecha_programada).toLocaleDateString("es-MX", {
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
};

export default Ordenes;
