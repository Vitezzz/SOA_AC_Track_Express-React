import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, Legend,
} from "recharts";

const COLORES_PASTEL = ["#111827", "#4b5563", "#9ca3af", "#d1d5db", "#6b7280"];

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

    if (loading) return <p className="text-center mt-10">Cargando...</p>;

    // ---------- 1) Servicios por mes ----------
    const conteoServiciosPorMes = {};
    ordenes.forEach((orden) => {
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
        <div className="max-w-5xl mx-auto px-4 py-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-1">Mi Dashboard</h2>
            <p className="text-sm text-gray-500 mb-6">
                Resumen de tu actividad: {ordenes.length} solicitud(es) de servicio en total.
            </p>

            {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

            {ordenes.length === 0 ? (
                <p className="text-gray-500 text-center">
                    Todavía no tienes suficiente actividad para mostrar gráficas.
                </p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Servicios por mes */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <p className="text-sm font-medium text-gray-700 mb-4">Servicios por mes</p>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={datosServiciosPorMes}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                                <Tooltip />
                                <Bar dataKey="cantidad" fill="#111827" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Gasto acumulado */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
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
                                    <Line type="monotone" dataKey="acumulado" stroke="#111827" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    {/* Tipos de servicio más frecuentes */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:col-span-2">
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