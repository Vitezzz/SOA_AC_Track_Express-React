import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Icon from "../../components/Icon";

// Mismo criterio que Gestión de Órdenes (esAtrasada / sin_asignar /
// solicitudes) -- si algún día cambia allá, hay que cambiarlo aquí también
// para que el número de Home y el de la pestaña coincidan.
const ESTATUS_CERRADOS = ["completada", "pagada", "cancelada"];
const esAtrasada = (orden) =>
    !ESTATUS_CERRADOS.includes(orden.estatus) &&
    !!orden.fecha_programada &&
    new Date(orden.fecha_programada) < new Date();

const aFechaLocal = (fecha) => {
    const d = new Date(fecha);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const Home = () => {
    const { user, apiFetch } = useAuth();

    const [ordenes, setOrdenes] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [cotizaciones, setCotizaciones] = useState([]);
    const [pagos, setPagos] = useState([]);
    const [inventario, setInventario] = useState([]);
    const [tecnicos, setTecnicos] = useState([]);
    const [especialidades, setEspecialidades] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const cargar = async () => {
            try {
                const [resOrd, resCli, resCot, resPag, resInv, resTec, resEsp] = await Promise.all([
                    apiFetch("/api/ordenes_servicio"),
                    apiFetch("/api/clientes/"),
                    apiFetch("/api/cotizaciones"),
                    apiFetch("/api/pagos"),
                    apiFetch("/api/inventario"),
                    apiFetch("/api/tecnicos/todos"),
                    apiFetch("/api/especialidad"),
                ]);
                if (resOrd.ok) setOrdenes(await resOrd.json());
                if (resCli.ok) setClientes(await resCli.json());
                if (resCot.status !== 404 && resCot.ok) setCotizaciones(await resCot.json());
                if (resPag.status !== 404 && resPag.ok) setPagos(await resPag.json());
                if (resInv.ok) setInventario(await resInv.json());
                if (resTec.status !== 404 && resTec.ok) setTecnicos(await resTec.json());
                if (resEsp.ok) setEspecialidades(await resEsp.json());
            } finally {
                setLoading(false);
            }
        };
        cargar();
    }, [apiFetch]);

    if (loading) return <p className="page">Cargando...</p>;

    const hoy = aFechaLocal(new Date());
    const clientesPorId = new Map(clientes.map((c) => [c.id, c]));

    const atrasadas = ordenes.filter(esAtrasada);
    const sinAsignar = ordenes.filter((o) => !o.tec_id && !ESTATUS_CERRADOS.includes(o.estatus));
    const solicitudes = ordenes.filter((o) => o.solicitud_estado === "pendiente");
    const pagosPorConfirmar = pagos.filter((p) => p.estado === "pendiente");
    const stockCritico = inventario.filter((i) => Number(i.stock_actual) <= Number(i.stock_minimo));

    const agendaHoy = ordenes
        .filter((o) => o.fecha_programada && aFechaLocal(o.fecha_programada) === hoy && !ESTATUS_CERRADOS.includes(o.estatus))
        .sort((a, b) => new Date(a.fecha_programada) - new Date(b.fecha_programada));

    const tecnicosDisponibles = tecnicos.filter((t) => t.disponible);
    const especialidadesPorId = new Map(especialidades.map((e) => [e.id, e]));

    const TILES = [
        {
            valor: atrasadas.length, label: "Órdenes atrasadas", icono: "warning",
            to: "/ordenes", state: { filtro: "atrasadas" }, alerta: atrasadas.length > 0,
        },
        {
            valor: sinAsignar.length, label: "Sin técnico asignado", icono: "wrench",
            to: "/ordenes", state: { filtro: "sin_asignar" }, alerta: sinAsignar.length > 0,
        },
        {
            valor: solicitudes.length, label: "Solicitudes de cliente", icono: "list",
            to: "/ordenes", state: { filtro: "solicitudes" }, alerta: solicitudes.length > 0,
        },
        {
            valor: pagosPorConfirmar.length, label: "Pagos por confirmar", icono: "card",
            to: "/pagos", alerta: pagosPorConfirmar.length > 0,
        },
        {
            valor: stockCritico.length, label: "Artículos en stock crítico", icono: "box",
            to: "/inventario", alerta: stockCritico.length > 0,
        },
    ];

    return (
        <div className="page page-wide">
            <h1 style={{ fontSize: "1.75rem", marginBottom: "0.35rem" }}>Bienvenido, {user?.nombre}</h1>
            <p className="muted-text" style={{ marginBottom: "2rem", fontSize: "0.95rem" }}>
                {new Date().toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })}
                {" · "}{agendaHoy.length} {agendaHoy.length === 1 ? "parada programada hoy" : "paradas programadas hoy"}
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem", marginBottom: "2rem" }}>
                {TILES.map((tile) => (
                    <Link
                        key={tile.label}
                        to={tile.to}
                        state={tile.state}
                        className="panel"
                        style={{
                            display: "block", textDecoration: "none", color: "inherit",
                            borderColor: tile.alerta ? "var(--color-danger-text)" : undefined,
                            padding: "1.5rem 1.75rem",
                        }}
                    >
                        <span style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--color-text-muted)", fontSize: "0.85rem", marginBottom: "0.75rem" }}>
                            <Icon name={tile.icono} className="icon-sm" /> {tile.label}
                        </span>
                        <span style={{ fontSize: "2.25rem", fontWeight: 700, color: tile.alerta ? "var(--color-danger-text)" : "inherit" }}>
                            {tile.valor}
                        </span>
                    </Link>
                ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "1.75rem", alignItems: "start", width: "100%" }}>
                <div className="panel">
                    <p style={{ fontWeight: 600, marginBottom: "0.9rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <Icon name="calendar" className="icon-sm" /> Agenda de hoy
                    </p>
                    {agendaHoy.length === 0 ? (
                        <p className="muted-text">No hay paradas programadas para hoy.</p>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            {agendaHoy.map((orden) => (
                                <Link
                                    key={orden.id}
                                    to={`/ordenes/${orden.id}/editar`}
                                    style={{
                                        display: "flex", justifyContent: "space-between", alignItems: "center",
                                        padding: "0.85rem 1rem", borderRadius: "var(--radius-sm)",
                                        border: "1px solid var(--color-border)", textDecoration: "none", color: "inherit",
                                        fontSize: "0.9rem",
                                    }}
                                >
                                    <span>
                                        <strong>{orden.fecha_programada.slice(11, 16)}</strong>
                                        {" · "}{orden.folio} — {clientesPorId.get(orden.cli_id)?.nombre || `Cliente #${orden.cli_id}`}
                                        {orden.duracion_estimada_horas != null && (
                                            <span className="muted-text"> · {Number(orden.duracion_estimada_horas)}h</span>
                                        )}
                                    </span>
                                    {!orden.tec_id && <span className="badge badge-warning">Sin asignar</span>}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                <div className="panel">
                    <p style={{ fontWeight: 600, marginBottom: "0.9rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <Icon name="wrench" className="icon-sm" /> Técnicos disponibles ({tecnicosDisponibles.length}/{tecnicos.length})
                    </p>
                    {tecnicos.length === 0 ? (
                        <p className="muted-text">Todavía no hay técnicos registrados.</p>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            {tecnicos.map((tec) => (
                                <div
                                    key={tec.id}
                                    style={{
                                        display: "flex", justifyContent: "space-between", alignItems: "center",
                                        padding: "0.85rem 1rem", borderRadius: "var(--radius-sm)",
                                        border: "1px solid var(--color-border)", fontSize: "0.9rem",
                                    }}
                                >
                                    <span>
                                        {tec.nombre || `Técnico #${tec.usu_id}`}
                                        {especialidadesPorId.get(tec.esp_id) && (
                                            <span className="muted-text"> · {especialidadesPorId.get(tec.esp_id).nombre}</span>
                                        )}
                                    </span>
                                    <span className={`badge ${tec.disponible ? "badge-success" : "badge-neutral"}`}>
                                        {tec.disponible ? "Disponible" : "No disponible"}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Home;
