import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, Legend,
} from "recharts";
import { useAuth } from "../../context/AuthContext";
import Icon from "../../components/Icon";

const formatoMoneda = (valor) =>
    new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(valor);

const COLORES = ["#111827", "#4b5563", "#9ca3af", "#d1d5db", "#6b7280"];

const DashboardKPIs = () => {
    const { apiFetch } = useAuth();

    const [reportes, setReportes] = useState({});
    const [tecnicos, setTecnicos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [recalculando, setRecalculando] = useState(false);
    const [error, setError] = useState("");
    const [ultimaActualizacion, setUltimaActualizacion] = useState(null);

    const cargarReportes = async () => {
        try {
            const res = await apiFetch("/api/reportes");
            if (!res.ok) throw new Error("No se pudieron cargar los reportes");
            const data = await res.json();

            // Convertimos el arreglo [{tipo_reporte, datos}, ...] a un
            // objeto { ordenes_por_estado: [...], ingresos_mes: [...], ... }
            // -- mucho más cómodo de usar en el JSX de abajo.
            const mapa = {};
            data.forEach((r) => { mapa[r.tipo_reporte] = r.datos; });
            setReportes(mapa);

            if (data.length > 0) {
                setUltimaActualizacion(data[0].generado_en);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarReportes();
        (async () => {
            const res = await apiFetch("/api/tecnicos/todos");
            if (res.status !== 404 && res.ok) setTecnicos(await res.json());
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // El reporte de "técnico más productivo" viene con usu_id (id de
    // usuario, no de técnico) -- así se cruza con /api/tecnicos/todos.
    const nombreDeUsuId = (usu_id) => tecnicos.find((t) => t.usu_id === usu_id)?.nombre || `Técnico #${usu_id}`;

    const handleRecalcular = async () => {
        setRecalculando(true);
        setError("");
        try {
            const res = await apiFetch("/api/reportes/recalcular", { method: "POST" });
            if (!res.ok) throw new Error("No se pudo recalcular los reportes");
            await cargarReportes();
        } catch (err) {
            setError(err.message);
        } finally {
            setRecalculando(false);
        }
    };

    if (loading) return <p className="page">Cargando...</p>;

    const ordenesPorEstado = reportes.ordenes_por_estado || [];
    const tecnicoMasProductivo = [...(reportes.tecnico_mas_productivo || [])]
        .sort((a, b) => Number(b.ordenes_completadas) - Number(a.ordenes_completadas));
    const ingresosMes = (reportes.ingresos_mes || []).map((r) => ({ ...r, total: Number(r.total) }));
    const stockCritico = reportes.stock_critico || [];

    // Resumen rápido arriba de las gráficas -- números sueltos que ya
    // veníamos calculando, nomás que no se mostraban en ningún lado.
    const totalOrdenesActivas = ordenesPorEstado.reduce((s, o) => s + Number(o.cantidad), 0);
    const ingresoMesActual = ingresosMes.length ? ingresosMes[ingresosMes.length - 1].total : 0;
    const lider = tecnicoMasProductivo[0];

    return (
        <div className="page">
            <Link to="/home" className="page-back">← Inicio</Link>

            <div className="page-header">
                <div>
                    <h2>Dashboard / KPIs</h2>
                    {ultimaActualizacion && (
                        <p className="muted-text" style={{ marginTop: "0.25rem" }}>
                            Última actualización: {new Date(ultimaActualizacion).toLocaleString("es-MX")}
                        </p>
                    )}
                </div>
                <button onClick={handleRecalcular} disabled={recalculando} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    {!recalculando && <Icon name="refresh" className="icon-sm" />}
                    {recalculando ? "Actualizando..." : "Actualizar datos"}
                </button>
            </div>

            {error && <p className="error-text">{error}</p>}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem", marginBottom: "1.25rem" }}>
                <div className="panel">
                    <p className="muted-text" style={{ fontSize: "0.8rem", marginBottom: "0.4rem" }}>Órdenes activas</p>
                    <p style={{ fontSize: "1.6rem", fontWeight: 700, margin: 0 }}>{totalOrdenesActivas}</p>
                </div>
                <div className="panel">
                    <p className="muted-text" style={{ fontSize: "0.8rem", marginBottom: "0.4rem" }}>Ingresos del último mes</p>
                    <p style={{ fontSize: "1.6rem", fontWeight: 700, margin: 0 }}>{formatoMoneda(ingresoMesActual)}</p>
                </div>
                <div className="panel">
                    <p className="muted-text" style={{ fontSize: "0.8rem", marginBottom: "0.4rem" }}>Técnico más productivo</p>
                    <p style={{ fontSize: "1.15rem", fontWeight: 700, margin: 0 }}>
                        {lider ? nombreDeUsuId(lider.usu_id) : "—"}
                    </p>
                </div>
                <div className="panel">
                    <p className="muted-text" style={{ fontSize: "0.8rem", marginBottom: "0.4rem" }}>Artículos en stock crítico</p>
                    <p style={{ fontSize: "1.6rem", fontWeight: 700, margin: 0, color: stockCritico.length > 0 ? "var(--color-danger-text)" : "inherit" }}>
                        {stockCritico.length}
                    </p>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>

                {/* Órdenes por estado */}
                <div className="panel">
                    <p style={{ fontWeight: "600", marginBottom: "12px" }}>Órdenes por estado</p>
                    {ordenesPorEstado.length === 0 ? (
                        <p className="muted-text">Sin datos todavía.</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={ordenesPorEstado}
                                    dataKey="cantidad"
                                    nameKey="estatus"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    label={({ estatus, cantidad }) => `${estatus}: ${cantidad}`}
                                >
                                    {ordenesPorEstado.map((_, i) => (
                                        <Cell key={i} fill={COLORES[i % COLORES.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Técnico más productivo */}
                <div className="panel">
                    <p style={{ fontWeight: "600", marginBottom: "12px" }}>Técnico más productivo</p>
                    {tecnicoMasProductivo.length === 0 ? (
                        <p style={{ color: "#9ca3af" }}>Sin datos todavía.</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={tecnicoMasProductivo}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                <XAxis dataKey="usu_id" tickFormatter={nombreDeUsuId} tick={{ fontSize: 12 }} />
                                <YAxis allowDecimals={false} />
                                <Tooltip labelFormatter={nombreDeUsuId} />
                                <Bar dataKey="ordenes_completadas" fill="#111827" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Ingresos del mes */}
                <div className="panel">
                    <p style={{ fontWeight: "600", marginBottom: "12px" }}>Ingresos por mes</p>
                    {ingresosMes.length === 0 ? (
                        <p style={{ color: "#9ca3af" }}>Sin datos todavía.</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={ingresosMes}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip formatter={(v) => formatoMoneda(v)} />
                                <Line type="monotone" dataKey="total" stroke="#111827" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Stock crítico */}
                <div className="panel">
                    <p style={{ fontWeight: "600", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                        <Icon name="warning" className="icon-sm" /> Stock crítico
                    </p>
                    {stockCritico.length === 0 ? (
                        <p style={{ color: "#15803d" }}>Ningún artículo está en nivel crítico ahorita.</p>
                    ) : (
                        <ul>
                            {stockCritico.map((item) => (
                                <li key={item.id} style={{ marginBottom: "6px" }}>
                                    {item.nombre} — <strong>{item.stock_actual}</strong> disponibles (mínimo: {item.stock_minimo})
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

            </div>
        </div>
    );
};

export default DashboardKPIs;