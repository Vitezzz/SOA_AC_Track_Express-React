import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import LoadingState from "../../components/LoadingState";
import EmptyState from "../../components/EmptyState";
import Icon from "../../components/Icon";

const ESTILOS_ESTADO_PAGO = {
    pendiente: "badge-status-warning",
    pagado: "badge-status-success",
    cancelado: "badge-status-danger",
};

const ICONO_METODO = {
    efectivo: "cash",
    tarjeta: "card",
    transferencia: "transfer",
};

const formatoMoneda = (valor) =>
    new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(valor);

// "YYYY-MM" en hora LOCAL -- nunca con toISOString(), que se corre de mes
// en cuanto la hora local pasa de las 6pm (somos UTC-6). Sirve para
// agrupar los pagos por mes de forma consistente con cómo se ven las horas.
const clavesMes = (fecha) => {
    const d = new Date(fecha);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const etiquetaMes = (clave) => {
    const [anio, mes] = clave.split("-").map(Number);
    const texto = new Date(anio, mes - 1, 1).toLocaleDateString("es-MX", { month: "long", year: "numeric" });
    return texto.charAt(0).toUpperCase() + texto.slice(1);
};

const formatoFechaHora = (fecha) =>
    new Date(fecha).toLocaleDateString("es-MX", {
        day: "numeric", month: "short",
        hour: "2-digit", minute: "2-digit",
    });

const RenglonPago = ({ pago, orden, categoria }) => {
    const claseIcono = pago.estado === "pendiente" ? "ledger-row-icon-pendiente"
        : pago.estado === "cancelado" ? "ledger-row-icon-cancelado" : "";
    const claseMonto = pago.estado === "pendiente" ? "ledger-row-amount-pendiente"
        : pago.estado === "cancelado" ? "ledger-row-amount-cancelado" : "";

    return (
        <div className="ledger-row">
            <span className={`ledger-row-icon ${claseIcono}`}>
                <Icon name={ICONO_METODO[pago.metodo] || "card"} />
            </span>
            <div className="ledger-row-main">
                <p className="ledger-row-title">{categoria?.nombre || "Pago de servicio"}</p>
                <p className="ledger-row-subtitle">
                    Orden: {orden?.folio || "—"} · {formatoFechaHora(pago.created_at)}
                </p>
            </div>
            <div className="text-right shrink-0">
                <p className={`ledger-row-amount ${claseMonto}`}>{formatoMoneda(pago.monto)}</p>
                <span className={`badge-status ${ESTILOS_ESTADO_PAGO[pago.estado] || "badge-status-neutral"}`} style={{ fontSize: "10px", padding: "1px 8px" }}>
                    {pago.estado}
                </span>
            </div>
        </div>
    );
};

const Pagos = () => {

    const [pagos, setPagos] = useState([]);
    const [ordenes, setOrdenes] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const { apiFetch } = useAuth();

    useEffect(() => {

        const cargarPagos = async () => {
            try {

                const [resPagos, resOrdenes, resCategorias] = await Promise.all([
                    apiFetch("/api/pagos"),
                    apiFetch("/api/ordenes_servicio"),
                    apiFetch("/api/categoriaServicio"),
                ]);

                if (resOrdenes.status === 404) {
                    setOrdenes([]);
                } else if (!resOrdenes.ok) {
                    throw new Error('No se pudieron cargar las ordenes');
                } else {
                    setOrdenes(await resOrdenes.json());
                }

                if (resCategorias.ok) setCategorias(await resCategorias.json());

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

    if (loading) return <LoadingState />

    // Del más reciente al más antiguo -- created_at ya viene corregido a
    // hora local desde el backend, así que ordenar por él ordena por
    // cuándo pasó de verdad, no por el orden en que llegaron de la API.
    const pagosOrdenados = [...pagos].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );

    const totalPagado = pagos
        .filter((p) => p.estado === "pagado")
        .reduce((suma, p) => suma + Number(p.monto), 0);
    const totalPendiente = pagos
        .filter((p) => p.estado === "pendiente")
        .reduce((suma, p) => suma + Number(p.monto), 0);

    // Agrupamos por mes (clave "YYYY-MM" en hora local), preservando el
    // orden ya cronológico -- Object no reordena claves de string insertadas
    // en orden, así que el primer mes que aparece es el más reciente.
    const gruposPorMes = {};
    for (const pago of pagosOrdenados) {
        const clave = clavesMes(pago.created_at);
        if (!gruposPorMes[clave]) gruposPorMes[clave] = [];
        gruposPorMes[clave].push(pago);
    }

    return (
        <div className="page-container">
            <div className="list-header">
                <span className="list-header-icon">
                    <Icon name="card" />
                </span>
                <div>
                    <p className="list-header-title">Mis Pagos</p>
                    <p className="list-header-subtitle">
                        {pagos.length === 0
                            ? "Aquí verás tu historial de pagos"
                            : `${pagos.length} ${pagos.length === 1 ? "movimiento" : "movimientos"} registrados`}
                    </p>
                </div>
            </div>

            {error && <p className="form-error mb-4">{error}</p>}

            {pagos.length === 0 ? (
                <EmptyState
                    icon="card"
                    title="Todavía no tienes pagos"
                    description="Cuando se registre un pago sobre alguna de tus órdenes, aparecerá aquí."
                />
            ) : (
                <>
                    <div className="stat-grid">
                        <div className="stat-card">
                            <p className="stat-card-label">Total pagado</p>
                            <p className="stat-card-value stat-card-value-accent">{formatoMoneda(totalPagado)}</p>
                        </div>
                        <div className="stat-card">
                            <p className="stat-card-label">Pendiente de pago</p>
                            <p className="stat-card-value">{formatoMoneda(totalPendiente)}</p>
                        </div>
                    </div>

                    {Object.entries(gruposPorMes).map(([clave, pagosDelMes]) => {
                        const subtotalMes = pagosDelMes
                            .filter((p) => p.estado === "pagado")
                            .reduce((suma, p) => suma + Number(p.monto), 0);

                        return (
                            <div key={clave} className="ledger-month">
                                <div className="ledger-month-header">
                                    <span className="ledger-month-title">{etiquetaMes(clave)}</span>
                                    {subtotalMes > 0 && (
                                        <span className="ledger-month-total">{formatoMoneda(subtotalMes)} pagados</span>
                                    )}
                                </div>
                                <div className="ledger-card">
                                    {pagosDelMes.map((pago) => {
                                        const orden = ordenes.find((o) => o.id === pago.ord_id);
                                        const categoria = categorias.find((c) => c.id === orden?.cat_id);
                                        return (
                                            <RenglonPago key={pago.id} pago={pago} orden={orden} categoria={categoria} />
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </>
            )}
        </div>
    );
}

export default Pagos;
