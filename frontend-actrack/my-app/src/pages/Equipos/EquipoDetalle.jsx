import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const ESTILOS_ESTADO = {
    pendiente: "bg-yellow-100 text-yellow-700",
    en_proceso: "bg-blue-100 text-blue-700",
    completada: "bg-green-100 text-green-700",
    pagada: "bg-purple-100 text-purple-700",
    cancelada: "bg-red-100 text-red-700",
};

const formatearFecha = (fecha) =>
    new Date(fecha).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });

const EquipoDetalle = () => {
    const { id } = useParams();
    const { apiFetch } = useAuth();

    const [equipo, setEquipo] = useState(null);
    const [marcas, setMarcas] = useState([]);
    const [ordenes, setOrdenes] = useState([]);
    const [mantenimiento, setMantenimiento] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const [resEquipo, resMarcas, resOrdenes, resMant] = await Promise.all([
                    apiFetch(`/api/equipos/${id}`),
                    apiFetch("/api/marcas/"),
                    apiFetch("/api/ordenes_servicio"),
                    apiFetch("/api/mantenimiento_preventivo"),
                ]);

                if (!resEquipo.ok) throw new Error("No se pudo cargar el equipo");
                setEquipo(await resEquipo.json());

                if (resMarcas.ok) setMarcas(await resMarcas.json());
                if (resOrdenes.ok) setOrdenes(await resOrdenes.json());

                if (resMant.status !== 404 && resMant.ok) {
                    const todos = await resMant.json();
                    setMantenimiento(todos.find((m) => m.equ_id === Number(id)) || null);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        cargarDatos();
    }, [id]);

    if (loading) return <p className="text-center mt-10">Cargando...</p>;
    if (error) return <p className="form-error text-center mt-10">{error}</p>;
    if (!equipo) return null;

    const marca = marcas.find((m) => m.id === equipo.mar_id);
    const historial = ordenes.filter((o) => o.equ_id === equipo.id);

    return (
        <div className="page-container" style={{ maxWidth: "600px" }}>
            <Link to="/misequipos">← Volver a mis equipos</Link>

            <div className="panel" style={{ marginTop: "16px" }}>
                {equipo.imagen_url && (
                    <img src={equipo.imagen_url} alt={equipo.modelo} className="w-full h-48 object-cover rounded-xl mb-4" />
                )}

                <div className="flex justify-between items-start mb-1">
                    <h2 className="page-title" style={{ margin: 0 }}>{equipo.tipo} — {equipo.modelo}</h2>
                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${equipo.activo ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {equipo.activo ? "Activo" : "Inactivo"}
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                    <p><span className="text-gray-400">Marca:</span> <span className="text-gray-700">{marca?.nombre || "—"}</span></p>
                    <p><span className="text-gray-400">N.º de serie:</span> <span className="text-gray-700">{equipo.numero_serie}</span></p>
                </div>

                <div className="border-t border-gray-100 pt-4 mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Mantenimiento preventivo</p>
                    {mantenimiento ? (
                        <p className="text-sm text-gray-600">
                            Cada {mantenimiento.frecuencia_dias} días — próxima visita: {formatearFecha(mantenimiento.proxima_fecha)}
                        </p>
                    ) : (
                        <p className="text-sm text-gray-400">No hay mantenimiento programado.</p>
                    )}
                </div>

                <div className="border-t border-gray-100 pt-4 mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Historial de órdenes ({historial.length})</p>
                    {historial.length === 0 ? (
                        <p className="text-sm text-gray-400">Sin órdenes registradas.</p>
                    ) : (
                        <ul className="space-y-2">
                            {historial.map((orden) => (
                                <li key={orden.id}>
                                    <Link to={`/ordenes/${orden.id}`} className="flex justify-between items-center text-sm hover:underline">
                                        <span className="text-gray-600">{orden.folio} — {formatearFecha(orden.fecha_programada)}</span>
                                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${ESTILOS_ESTADO[orden.estatus] || "bg-gray-100 text-gray-600"}`}>
                                            {orden.estatus}
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EquipoDetalle;