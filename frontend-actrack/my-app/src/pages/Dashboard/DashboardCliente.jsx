import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import LoadingState from "../../components/LoadingState";
import EmptyState from "../../components/EmptyState";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, Legend,
} from "recharts";

const COLORES_PASTEL = ["#0e8a82", "#2563eb", "#f59e0b", "#6d28d9", "#9aa3b2"];

const formatoMoneda = (valor) =>
    new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(valor);

const NOMBRES_MES = [
    "Ene", "Feb", "Mar", "Abr", "May", "Jun",
    "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

const DashboardCliente = () => {
    const [ordenes, setOrdenes] = useState([]);
    const [pagos, setPagos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const { apiFetch } = useAuth();

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const [resOrdenes, resPagos, resCategorias] = await Promise.all([
                    apiFetch("/api/ordenes_servicio"),
                    apiFetch("/api/pagos"),
                    apiFetch("/api/categoriaServicio"),
                ]);

                // ordenes_servicio nunca da 404 (ya lo confirmamos en Ordenes.jsx)
                if (!resOrdenes.ok) throw new Error("No se pudieron cargar tus órdenes");
                setOrdenes(await resOrdenes.json());

                // pagos SÍ da 404 cuando no tienes ninguno -- lo tratamos como vacío
                if (resPagos.status === 404) {
                    setPagos([]);
                } else if (!resPagos.ok) {
                    throw new Error("No se pudieron cargar tus pagos");
                } else {
                    setPagos(await resPagos.json());
                }

                if (!resCategorias.ok) throw new Error("No se pudieron cargar las categorías");
                setCategorias(await resCategorias.json());
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        cargarDatos();
    }, []);

    if (loading) return <LoadingState />;

    // ---------- 1) Servicios completados por mes ----------
    // Solo contamos órdenes con estatus "completada" -- así esta gráfica
    // representa trabajo realmente realizado, no solo agendado, y queda
    // coherente con "Gasto acumulado" (que también filtra solo lo confirmado).
    const conteoServiciosPorMes = {};
    ordenes
        .filter((orden) => orden.estatus === "completada")
        .forEach((orden) => {
            if (!orden.fecha_programada) return;
            const fecha = new Date(orden.fecha_programada);
            const clave = `${NOMBRES_MES[fecha.getMonth()]} ${fecha.getFullYear()}`;
            conteoServiciosPorMes[clave] = (conteoServiciosPorMes[clave] || 0) + 1;
        });
    const datosServiciosPorMes = Object.entries(conteoServiciosPorMes).map(([mes, cantidad]) => ({
        mes,
        cantidad,
    }));

    // ---------- 2) Gasto acumulado (solo pagos ya "pagado") ----------
    const pagosOrdenados = [...pagos]
        .filter((p) => p.estado === "pagado")
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    let acumulado = 0;
    const datosGastoAcumulado = pagosOrdenados.map((pago) => {
        acumulado += Number(pago.monto);
        return {
            fecha: new Date(pago.created_at).toLocaleDateString("es-MX", { day: "numeric", month: "short" }),
            acumulado,
        };
    });

    // ---------- 3) Tipos de servicio más frecuentes ----------
    const conteoPorCategoria = {};
    ordenes.forEach((orden) => {
        conteoPorCategoria[orden.cat_id] = (conteoPorCategoria[orden.cat_id] || 0) + 1;
    });
    const datosCategorias = Object.entries(conteoPorCategoria)
        .map(([cat_id, cantidad]) => {
            const categoria = categorias.find((c) => c.id === Number(cat_id));
            return { nombre: categoria?.nombre || "Sin categoría", cantidad };
        })
        .sort((a, b) => b.cantidad - a.cantidad);

    const totalGastado = pagosOrdenados.reduce((suma, p) => suma + Number(p.monto), 0);

    return (
        <div className="page-container-wide">
            <h2 className="page-title mb-1">Mi Dashboard</h2>
            <p className="page-subtitle">
                Resumen de tu actividad: {ordenes.length} solicitud(es) de servicio en total.
            </p>

            {error && <p className="form-error mb-4">{error}</p>}

            {ordenes.length === 0 ? (
                <EmptyState
                    icon="spark"
                    title="Todavía no hay suficiente actividad"
                    description="Cuando tengas órdenes y pagos registrados, aquí verás tus estadísticas."
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Servicios completados por mes */}
                    <div className="panel">
                        <p className="text-sm font-medium text-gray-700 mb-4">Servicios completados por mes</p>
                        {datosServiciosPorMes.length === 0 ? (
                            <p className="text-gray-400 text-sm">Todavía no tienes servicios completados.</p>
                        ) : (
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={datosServiciosPorMes}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                    <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                                    <Tooltip />
                                    <Bar dataKey="cantidad" fill="#0e8a82" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    {/* Gasto acumulado */}
                    <div className="panel">
                        <p className="text-sm font-medium text-gray-700 mb-1">Gasto acumulado</p>
                        <p className="text-lg font-semibold text-gray-900 mb-4">
                            {formatoMoneda(totalGastado)}
                        </p>
                        {datosGastoAcumulado.length === 0 ? (
                            <p className="text-gray-400 text-sm">Todavía no tienes pagos registrados.</p>
                        ) : (
                            <ResponsiveContainer width="100%" height={200}>
                                <LineChart data={datosGastoAcumulado}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                    <XAxis dataKey="fecha" tick={{ fontSize: 12 }} />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip formatter={(valor) => formatoMoneda(valor)} />
                                    <Line type="monotone" dataKey="acumulado" stroke="#0e8a82" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    {/* Tipos de servicio más frecuentes */}
                    <div className="panel md:col-span-2">
                        <p className="text-sm font-medium text-gray-700 mb-4">Tipos de servicio más frecuentes</p>
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie
                                    data={datosCategorias}
                                    dataKey="cantidad"
                                    nameKey="nombre"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={90}
                                    label={({ nombre, cantidad }) => `${nombre}: ${cantidad}`}
                                >
                                    {datosCategorias.map((_, index) => (
                                        <Cell key={index} fill={COLORES_PASTEL[index % COLORES_PASTEL.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardCliente;