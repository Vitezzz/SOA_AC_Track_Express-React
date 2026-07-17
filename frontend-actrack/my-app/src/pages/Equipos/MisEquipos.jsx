import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext.jsx";

const ESTILOS_ESTADO = {
    pendiente: "bg-yellow-100 text-yellow-700",
    en_proceso: "bg-blue-100 text-blue-700",
    completada: "bg-green-100 text-green-700",
    cancelada: "bg-red-100 text-red-700",
};

const formatearFecha = (fecha) =>
    new Date(fecha).toLocaleDateString("es-MX", {
        day: "numeric", month: "short", year: "numeric",
    });

const MisEquipos = () => {
    const [equipos, setEquipos] = useState([]);
    const [ordenes, setOrdenes] = useState([]);
    const [mantenimientos, setMantenimientos] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const { apiFetch } = useAuth();

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const [resEquipos, resOrdenes, resMant] = await Promise.all([
                    apiFetch("/api/equipos/"),
                    apiFetch("/api/ordenes_servicio"),
                    apiFetch("/api/mantenimiento_preventivo"),
                ]);

                if (!resEquipos.ok) throw new Error("No se pudieron cargar los equipos");
                setEquipos(await resEquipos.json());

                // ordenes_servicio nunca da 404 (ya lo comprobamos en Ordenes.jsx),
                // así que aquí no hace falta el caso especial.
                if (!resOrdenes.ok) throw new Error("No se pudieron cargar las órdenes");
                setOrdenes(await resOrdenes.json());

                // mantenimiento_preventivo sí puede dar 404 si no tienes ninguno
                // configurado todavía — mismo comportamiento que cotizaciones/pagos.
                if (resMant.status === 404) {
                    setMantenimientos([]);
                } else if (!resMant.ok) {
                    throw new Error("No se pudo cargar el mantenimiento preventivo");
                } else {
                    setMantenimientos(await resMant.json());
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        cargarDatos();
    }, []);

    if (loading) return <p className="text-center mt-10">Cargando...</p>;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Mis Equipos</h2>

            {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

            {equipos.length === 0 ? (
                <p className="text-gray-500 text-center">Todavía no tienes equipos registrados.</p>
            ) : (
                <div className="space-y-6">
                    {equipos.map((eq) => {
                        // Historial: todas las órdenes que le pertenecen a este equipo
                        const historial = ordenes.filter((o) => o.equ_id === eq.id);

                        // Próximo mantenimiento: puede no existir, por eso el ?. y el fallback
                        const mantenimiento = mantenimientos.find((m) => m.equ_id === eq.id);

                        return (
                            <div key={eq.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-semibold text-gray-900">
                                        {eq.tipo} — {eq.modelo}
                                    </span>
                                    <span
                                        className={`text-xs font-medium px-3 py-1 rounded-full ${
                                            eq.activo ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                                        }`}
                                    >
                                        {eq.activo ? "Activo" : "Inactivo"}
                                    </span>
                                </div>
                                <p className="text-gray-400 text-xs mb-4">N.º de serie: {eq.numero_serie}</p>

                                <p className="text-sm text-gray-700 mb-4">
                                    <span className="font-medium">Próximo mantenimiento: </span>
                                    {mantenimiento
                                        ? formatearFecha(mantenimiento.proxima_fecha)
                                        : "No programado"}
                                </p>

                                <div className="border-t border-gray-100 pt-3">
                                    <p className="text-sm font-medium text-gray-700 mb-2">Historial de órdenes</p>
                                    {historial.length === 0 ? (
                                        <p className="text-gray-400 text-sm">Sin órdenes registradas.</p>
                                    ) : (
                                        <ul className="space-y-2">
                                            {historial.map((orden) => (
                                                <li key={orden.id} className="flex justify-between items-center text-sm">
                                                    <span className="text-gray-600">
                                                        {orden.folio} — {formatearFecha(orden.fecha_programada)}
                                                    </span>
                                                    <span
                                                        className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                                                            ESTILOS_ESTADO[orden.estatus] || "bg-gray-100 text-gray-600"
                                                        }`}
                                                    >
                                                        {orden.estatus}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MisEquipos;