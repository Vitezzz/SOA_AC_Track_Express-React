import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const formatoMoneda = (valor) =>
    new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(valor);

const NOMBRES_MES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

const HistorialPagosTecnicos = () => {
    const { apiFetch } = useAuth();

    const [pagos, setPagos] = useState([]);
    const [ordenes, setOrdenes] = useState([]);
    const [tecnicos, setTecnicos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const [resPagos, resOrdenes, resTecnicos] = await Promise.all([
                    apiFetch("/api/pagos"),
                    apiFetch("/api/ordenes_servicio"),
                    apiFetch("/api/tecnicos/todos"),
                ]);

                if (resPagos.status === 404) {
                    setPagos([]);
                } else if (resPagos.ok) {
                    setPagos(await resPagos.json());
                }

                if (resOrdenes.ok) setOrdenes(await resOrdenes.json());
                if (resTecnicos.status !== 404 && resTecnicos.ok) setTecnicos(await resTecnicos.json());
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        cargarDatos();
    }, []);

    if (loading) return <p className="page">Cargando...</p>;

    // Solo nos interesan los pagos ya CONFIRMADOS (cobrados de verdad),
    // cruzados con la orden (para saber qué técnico estaba asignado).
    const cobrosConDatos = pagos
        .filter((p) => p.estado === "pagado")
        .map((p) => {
            const orden = ordenes.find((o) => o.id === p.ord_id);
            const tecnico = tecnicos.find((t) => t.id === orden?.tec_id);
            const fecha = p.created_at ? new Date(p.created_at) : null;
            return {
                ...p,
                folioOrden: orden?.folio || `Orden #${p.ord_id}`,
                nombreTecnico: tecnico ? `Técnico #${tecnico.usu_id}` : "Sin técnico asignado",
                tecId: tecnico?.id ?? null,
                mesLabel: fecha ? `${NOMBRES_MES[fecha.getMonth()]} ${fecha.getFullYear()}` : "Sin fecha",
            };
        });

    // Resumen: cuánto ha cobrado cada técnico, agrupado por mes.
    const resumenPorTecnicoYMes = {};
    cobrosConDatos.forEach((c) => {
        const clave = `${c.nombreTecnico}__${c.mesLabel}`;
        if (!resumenPorTecnicoYMes[clave]) {
            resumenPorTecnicoYMes[clave] = {
                nombreTecnico: c.nombreTecnico,
                mesLabel: c.mesLabel,
                total: 0,
                cantidadCobros: 0,
            };
        }
        resumenPorTecnicoYMes[clave].total += Number(c.monto);
        resumenPorTecnicoYMes[clave].cantidadCobros += 1;
    });
    const resumen = Object.values(resumenPorTecnicoYMes);

    return (
        <div className="page">
            <Link to="/home">← Inicio</Link>
            <h2>Historial de Cobros de Técnicos</h2>

            {error && <p className="error-text">{error}</p>}

            <h3>Resumen por técnico / mes</h3>
            {resumen.length === 0 ? (
                <p>Todavía no hay cobros confirmados.</p>
            ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "24px" }}>
                    <thead>
                        <tr style={{ textAlign: "left", borderBottom: "2px solid #e5e7eb" }}>
                            <th style={{ padding: "8px" }}>Técnico</th>
                            <th style={{ padding: "8px" }}>Mes</th>
                            <th style={{ padding: "8px" }}># de cobros</th>
                            <th style={{ padding: "8px" }}>Total cobrado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {resumen.map((r, i) => (
                            <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                <td style={{ padding: "8px" }}>{r.nombreTecnico}</td>
                                <td style={{ padding: "8px" }}>{r.mesLabel}</td>
                                <td style={{ padding: "8px" }}>{r.cantidadCobros}</td>
                                <td style={{ padding: "8px", fontWeight: "600" }}>{formatoMoneda(r.total)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <h3>Detalle de cobros</h3>
            {cobrosConDatos.length === 0 ? (
                <p>Sin cobros confirmados todavía.</p>
            ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ textAlign: "left", borderBottom: "2px solid #e5e7eb" }}>
                            <th style={{ padding: "8px" }}>Técnico</th>
                            <th style={{ padding: "8px" }}>Orden</th>
                            <th style={{ padding: "8px" }}>Método</th>
                            <th style={{ padding: "8px" }}>Monto</th>
                            <th style={{ padding: "8px" }}>Fecha</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cobrosConDatos.map((c) => (
                            <tr key={c.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                <td style={{ padding: "8px" }}>{c.nombreTecnico}</td>
                                <td style={{ padding: "8px" }}>{c.folioOrden}</td>
                                <td style={{ padding: "8px", textTransform: "capitalize" }}>{c.metodo}</td>
                                <td style={{ padding: "8px" }}>{formatoMoneda(c.monto)}</td>
                                <td style={{ padding: "8px" }}>
                                    {c.created_at ? new Date(c.created_at).toLocaleDateString("es-MX") : "—"}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default HistorialPagosTecnicos;