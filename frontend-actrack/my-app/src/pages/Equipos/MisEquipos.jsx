import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { Link } from "react-router-dom";
import LoadingState from "../../components/LoadingState.jsx";
import EmptyState from "../../components/EmptyState.jsx";

const ESTILOS_ESTADO = {
    pendiente: "badge-status-warning",
    en_proceso: "badge-status-info",
    completada: "badge-status-success",
    cancelada: "badge-status-danger",
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

    if (loading) return <LoadingState />;

    return (
        <div className="page-container-wide">
            <h2 className="page-title">Mis Equipos</h2>

            {error && <p className="form-error mb-4">{error}</p>}

            {equipos.length === 0 ? (
                <EmptyState
                    icon="box"
                    title="Todavía no tienes equipos registrados"
                    description="Tus equipos aparecerán aquí junto con su historial de órdenes y mantenimiento."
                />
            ) : (
                <div className="space-y-6">
                    {equipos.map((eq) => {
                        // Historial: todas las órdenes que le pertenecen a este equipo
                        const historial = ordenes.filter((o) => o.equ_id === eq.id);

                        // Próximo mantenimiento: puede no existir, por eso el ?. y el fallback
                        const mantenimiento = mantenimientos.find((m) => m.equ_id === eq.id);

                        return (
                            <Link key={eq.id} to={`/equipos/${eq.id}`} className="panel block">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-semibold text-gray-900">
                                        {eq.tipo} — {eq.modelo}
                                    </span>
                                    <span
                                        className={`badge-status ${eq.activo ? "badge-status-success" : "badge-status-neutral"}`}
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
                                                        className={`badge-status ${ESTILOS_ESTADO[orden.estatus] || "badge-status-neutral"}`}
                                                    >
                                                        {orden.estatus}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                                {eq.imagen_url && (
                                    <img src={eq.imagen_url} alt={eq.modelo} className="w-full rounded-xl mb-2 object-cover" />
                                )}
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MisEquipos;