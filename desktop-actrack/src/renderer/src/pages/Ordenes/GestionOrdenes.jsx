import { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Icon from "../../components/Icon";

// No hay socket para "nueva orden" (solo existe para ubicación en vivo del
// técnico) -- se refresca solo cada 20s para que no haya que cambiar de
// pantalla y volver para verla, más el botón manual para no esperar.
const INTERVALO_REFRESCO_MS = 20000;

const ESTILOS_ESTADO = {
    pendiente: "badge-warning",
    en_proceso: "badge-info",
    pagada: "badge-purple",
    completada: "badge-success",
    cancelada: "badge-danger",
};

// Antes no había forma de saber, desde esta lista, si una orden ya tiene
// cotización y en qué estado -- había que ir a la pantalla de Cotizaciones
// aparte y cruzar por folio a mano.
const ESTILOS_COTIZACION = {
    borrador: "badge-neutral",
    enviada: "badge-info",
    aprobada: "badge-success",
    rechazada: "badge-danger",
};

const ETIQUETAS_COTIZACION = {
    borrador: "Cotización en borrador",
    enviada: "Cotización enviada",
    aprobada: "Cotización aprobada",
    rechazada: "Cotización rechazada",
};

// "Completadas" agrupa completada + pagada (para el admin, ambas ya
// significan que el trabajo en campo terminó). "Sin asignar" y "Atrasadas"
// son pestañas propias porque son justo lo que necesita atención inmediata
// -- no importa el estatus exacto, esas son las que alguien tiene que
// resolver YA.
const FILTROS = [
    { key: "todas", label: "Todas" },
    { key: "atrasadas", label: "Atrasadas" },
    { key: "solicitudes", label: "Solicitudes de cliente" },
    { key: "sin_asignar", label: "Sin asignar" },
    { key: "pendiente", label: "Pendientes" },
    { key: "en_proceso", label: "En curso" },
    { key: "completada", label: "Completadas" },
];

// Estatus que ya "terminaron" en campo -- una vez aquí, "atrasada" deja de
// tener sentido (ya no hay nada pendiente de hacer con esa orden).
const ESTATUS_CERRADOS = ["completada", "pagada", "cancelada"];

// "Pendiente" solo dice que nadie la ha empezado -- eso es normal para
// una orden agendada para la próxima semana Y para una que se quedó
// olvidada desde hace 10 días, y antes se veían exactamente igual. Esto
// separa las dos: si ya pasó su fecha programada y sigue sin cerrarse,
// es una orden que alguien tiene que revisar, no una más de la fila.
const esAtrasada = (orden) =>
    !ESTATUS_CERRADOS.includes(orden.estatus) &&
    !!orden.fecha_programada &&
    new Date(orden.fecha_programada) < new Date();

const coincideFiltro = (filtro, orden) => {
    if (filtro === "todas") return true;
    if (filtro === "atrasadas") return orden.atrasada;
    if (filtro === "solicitudes") return orden.solicitud_estado === "pendiente";
    if (filtro === "sin_asignar") return !orden.tec_id && orden.estatus !== "cancelada" && orden.estatus !== "completada" && orden.estatus !== "pagada";
    if (filtro === "completada") return orden.estatus === "completada" || orden.estatus === "pagada";
    return orden.estatus === filtro;
};

const GestionOrdenes = () => {
    // Home manda aquí con un filtro ya elegido (ej. "12 atrasadas" -> cae
    // directo en la pestaña Atrasadas) en vez de aterrizar en "Todas" y
    // que el admin tenga que volver a dar clic.
    const location = useLocation();

    const [ordenes, setOrdenes] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [tecnicos, setTecnicos] = useState([]);
    const [cotizaciones, setCotizaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refrescando, setRefrescando] = useState(false);
    const [error, setError] = useState("");

    const [busqueda, setBusqueda] = useState("");
    const [filtro, setFiltro] = useState(location.state?.filtro || "todas");

    const { apiFetch, user } = useAuth();

    const puedeCrear = user?.rol_id === 2 || user?.rol_id === 5;

    const cargarDatos = useCallback(async () => {
        try {
            const [resOrdenes, resClientes, resTecnicos, resCotizaciones] = await Promise.all([
                apiFetch("/api/ordenes_servicio"),
                apiFetch("/api/clientes/"),
                apiFetch("/api/tecnicos/todos"),
                apiFetch("/api/cotizaciones"),
            ]);

            if (!resOrdenes.ok) throw new Error("No se pudieron cargar las órdenes");
            setOrdenes(await resOrdenes.json());

            if (resClientes.status === 404) {
                setClientes([]);
            } else if (resClientes.ok) {
                setClientes(await resClientes.json());
            }

            if (resTecnicos.status !== 404 && resTecnicos.ok) setTecnicos(await resTecnicos.json());

            if (resCotizaciones.status === 404) {
                setCotizaciones([]);
            } else if (resCotizaciones.ok) {
                setCotizaciones(await resCotizaciones.json());
            }
        } catch (err) {
            setError(err.message);
        }
    }, [apiFetch]);

    useEffect(() => {
        let cancelado = false;
        (async () => {
            await cargarDatos();
            if (!cancelado) setLoading(false);
        })();
        const intervalo = setInterval(cargarDatos, INTERVALO_REFRESCO_MS);
        return () => {
            cancelado = true;
            clearInterval(intervalo);
        };
    }, [cargarDatos]);

    const handleRefrescar = async () => {
        setRefrescando(true);
        await cargarDatos();
        setRefrescando(false);
    };

    if (loading) return <p className="page">Cargando...</p>;

    const tecnicosPorId = new Map(tecnicos.map((t) => [t.id, t]));

    // Misma orden puede tener varias cotizaciones a lo largo del tiempo
    // (p.ej. una rechazada y luego otra nueva) -- "activa" es la más
    // reciente, y si esa está rechazada, es la más reciente de todas
    // (mismo criterio que CrearCotizacion.jsx: una rechazada no bloquea
    // volver a cotizar, así que sigue siendo la info relevante a mostrar).
    const cotizacionPorOrden = new Map();
    for (const cot of cotizaciones) {
        const actual = cotizacionPorOrden.get(cot.ord_id);
        if (!actual || cot.id > actual.id) cotizacionPorOrden.set(cot.ord_id, cot);
    }

    const ordenesConNombre = ordenes.map((orden) => {
        const cliente = clientes.find((c) => c.id === orden.cli_id);
        return {
            ...orden,
            nombreCliente: cliente?.nombre || `Cliente #${orden.cli_id}`,
            nombreTecnico: orden.tec_id
                ? tecnicosPorId.get(orden.tec_id)?.nombre || `Técnico #${orden.tec_id}`
                : null,
            cotizacion: cotizacionPorOrden.get(orden.id) || null,
            atrasada: esAtrasada(orden),
        };
    });

    const ordenesFiltradas = ordenesConNombre.filter((orden) => {
        const coincideTexto =
            orden.folio?.toLowerCase().includes(busqueda.toLowerCase()) ||
            orden.nombreCliente.toLowerCase().includes(busqueda.toLowerCase());

        return coincideTexto && coincideFiltro(filtro, orden);
    });

    // Atrasadas siempre arriba (son lo más urgente, sin importar qué
    // filtro se esté viendo). Dentro de lo que sigue abierto, la más
    // próxima primero -- es la fila de trabajo del día, no un historial.
    // Lo ya cerrado (completada/pagada/cancelada) sí tiene más sentido
    // reciente-primero, como cualquier historial.
    const ordenesOrdenadas = [...ordenesFiltradas].sort((a, b) => {
        if (a.atrasada !== b.atrasada) return a.atrasada ? -1 : 1;
        if (!a.fecha_programada) return 1;
        if (!b.fecha_programada) return -1;
        const diferencia = new Date(a.fecha_programada) - new Date(b.fecha_programada);
        return ESTATUS_CERRADOS.includes(a.estatus) ? -diferencia : diferencia;
    });

    const totalSolicitudes = ordenesConNombre.filter((o) => o.solicitud_estado === "pendiente").length;
    const totalAtrasadas = ordenesConNombre.filter((o) => o.atrasada).length;

    return (
        <div className="page">
            <div className="page-header">
                <h2>Gestión de Órdenes</h2>
                {puedeCrear && (
                    <Link to="/ordenes/nueva">
                        <button className="btn-primary">+ Nueva Orden</button>
                    </Link>
                )}
            </div>

            {error && <p className="error-text">{error}</p>}

            <div className="toolbar">
                <div className="search-field">
                    <Icon name="search" className="icon-sm" />
                    <input
                        type="text"
                        placeholder="Buscar por folio o cliente..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                </div>
                <button type="button" className="btn-sm" onClick={handleRefrescar} disabled={refrescando}>
                    {refrescando ? "Actualizando..." : "↻ Actualizar"}
                </button>
            </div>

            <div className="tabs">
                {FILTROS.map((f) => (
                    <button
                        key={f.key}
                        onClick={() => setFiltro(f.key)}
                        className={filtro === f.key ? "tab active" : "tab"}
                    >
                        {f.label}
                        {f.key === "solicitudes" && totalSolicitudes > 0 && ` (${totalSolicitudes})`}
                        {f.key === "atrasadas" && totalAtrasadas > 0 && ` (${totalAtrasadas})`}
                    </button>
                ))}
            </div>

            {ordenesOrdenadas.length === 0 ? (
                <div className="panel empty-state">
                    <p className="empty-state-title">No se encontraron órdenes</p>
                    <p className="empty-state-description">Prueba con otro folio, cliente o filtro de estatus.</p>
                </div>
            ) : (
                <div className="table-wrap">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Folio</th>
                            <th>Cliente</th>
                            <th>Técnico</th>
                            <th>Estatus</th>
                            <th>Fecha</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ordenesOrdenadas.map((orden) => {
                            const clase = ESTILOS_ESTADO[orden.estatus] || "badge-neutral";
                            return (
                                <tr key={orden.id} className={orden.atrasada ? "row-alert" : ""}>
                                    <td>{orden.folio || "—"}</td>
                                    <td>{orden.nombreCliente}</td>
                                    <td>
                                        {orden.nombreTecnico || (
                                            <span className="badge badge-warning">Sin asignar</span>
                                        )}
                                    </td>
                                    <td>
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                            {orden.atrasada && <span className="badge badge-danger">Atrasada</span>}
                                            <span className={`badge ${clase}`}>{orden.estatus}</span>
                                            {orden.solicitud_estado === "pendiente" && (
                                                <span className="badge badge-warning">
                                                    Pidió {orden.solicitud_tipo === "cancelar" ? "cancelar" : "reagendar"}
                                                </span>
                                            )}
                                            {orden.cotizacion && (
                                                <span className={`badge ${ESTILOS_COTIZACION[orden.cotizacion.estado] || "badge-neutral"}`}>
                                                    {ETIQUETAS_COTIZACION[orden.cotizacion.estado] || orden.cotizacion.estado}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        {orden.fecha_programada
                                            ? new Date(orden.fecha_programada).toLocaleDateString("es-MX")
                                            : "Sin fecha"}
                                        {orden.duracion_estimada_horas != null && (
                                            <span className="muted-text"> · {Number(orden.duracion_estimada_horas)}h</span>
                                        )}
                                    </td>
                                    <td>
                                        <Link to={`/ordenes/${orden.id}/editar`}>
                                            <button className="btn-sm">Editar</button>
                                        </Link>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                </div>
            )}
        </div>
    );
};

export default GestionOrdenes;