import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ReporteImprimible from "./ReporteImprimible";
import Icon from "../../components/Icon";

const PESTAÑAS = ["Productividad", "Cobros", "Inventario", "Órdenes finalizadas"];

const formatoMoneda = (valor) =>
    new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(Number(valor));

const Reportes = () => {
    const { apiFetch } = useAuth();

    const [reportes, setReportes] = useState({});
    const [pestañaActiva, setPestañaActiva] = useState(PESTAÑAS[0]);
    const [loading, setLoading] = useState(true);
    const [recalculando, setRecalculando] = useState(false);
    const [error, setError] = useState("");

    // Órdenes finalizadas -- catálogos de apoyo (pagos, ítems de checklist)
    // se traen UNA vez y se filtran por orden al vuelo, en vez de volver a
    // pedirlos cada vez que se expande una tarjeta.
    const [ordenesFinalizadas, setOrdenesFinalizadas] = useState([]);
    const [pagosTodos, setPagosTodos] = useState([]);
    const [itemsPlantillaTodos, setItemsPlantillaTodos] = useState([]);
    const [tecnicosDisponibles, setTecnicosDisponibles] = useState([]);
    const [filtroTecnico, setFiltroTecnico] = useState("todos");
    const [expandidoId, setExpandidoId] = useState(null);
    const [checklistPorOrden, setChecklistPorOrden] = useState({});
    const [equipoPorOrden, setEquipoPorOrden] = useState({});
    const [cargandoDetalleId, setCargandoDetalleId] = useState(null);
    const [errorFinalizadas, setErrorFinalizadas] = useState("");

    // Catálogos para los reportes PDF: piezas usadas (movimientos_inventario),
    // el nombre del artículo (inventario), si el tipo de movimiento es una
    // salida/uso real (es_entrada = false) y la especialidad del técnico.
    const [movimientosTodos, setMovimientosTodos] = useState([]);
    const [inventarioTodos, setInventarioTodos] = useState([]);
    const [tiposMovimientoTodos, setTiposMovimientoTodos] = useState([]);
    const [especialidadesTodas, setEspecialidadesTodas] = useState([]);

    // Para "cuánto tardó el servicio" (bitácora_estados.created_at, desde
    // que el técnico llegó), categoría/prioridad de la orden, y cuánto se
    // cotizó vs. cuánto se cobró de verdad.
    const [bitacoraTodos, setBitacoraTodos] = useState([]);
    const [categoriasTodas, setCategoriasTodas] = useState([]);
    const [cotizacionesTodas, setCotizacionesTodas] = useState([]);
    const [categoriasInventarioTodas, setCategoriasInventarioTodas] = useState([]);
    const [clientesTodos, setClientesTodos] = useState([]);

    const [reporteOrden, setReporteOrden] = useState(null);
    const [reporteTecnico, setReporteTecnico] = useState(null);
    const [reporteInventario, setReporteInventario] = useState(false);
    const [cargandoReporteOrdenId, setCargandoReporteOrdenId] = useState(null);

    const cargarReportes = async () => {
        try {
            const res = await apiFetch("/api/reportes");
            if (!res.ok) throw new Error("No se pudieron cargar los reportes");
            const data = await res.json();
            const mapa = {};
            data.forEach((r) => { mapa[r.tipo_reporte] = r.datos; });
            setReportes(mapa);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarReportes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const cargarOrdenesFinalizadas = async () => {
            try {
                const [
                    resOrdenes, resClientes, resTecnicos, resPagos, resItems,
                    resMovimientos, resInventario, resTiposMovimiento, resEspecialidades,
                    resBitacora, resCategorias, resCotizaciones, resCategoriasInv,
                ] = await Promise.all([
                    apiFetch("/api/ordenes_servicio"),
                    apiFetch("/api/clientes/"),
                    apiFetch("/api/tecnicos/todos"),
                    apiFetch("/api/pagos"),
                    apiFetch("/api/checklist_items_plantilla"),
                    apiFetch("/api/movimientos_inventario"),
                    apiFetch("/api/inventario"),
                    apiFetch("/api/tipo_movimiento_inventario"),
                    apiFetch("/api/especialidad"),
                    apiFetch("/api/bitacora_estados"),
                    apiFetch("/api/categoriaServicio"),
                    apiFetch("/api/cotizaciones"),
                    apiFetch("/api/categoriaInventario"),
                ]);

                const ordenes = resOrdenes.ok ? await resOrdenes.json() : [];
                const clientes = resClientes.ok ? await resClientes.json() : [];
                const tecnicos = resTecnicos.status !== 404 && resTecnicos.ok ? await resTecnicos.json() : [];
                const pagos = resPagos.status === 404 ? [] : resPagos.ok ? await resPagos.json() : [];
                const items = resItems.ok ? await resItems.json() : [];
                const movimientos = resMovimientos.status === 404 ? [] : resMovimientos.ok ? await resMovimientos.json() : [];
                const inventario = resInventario.ok ? await resInventario.json() : [];
                const tiposMovimiento = resTiposMovimiento.ok ? await resTiposMovimiento.json() : [];
                const especialidades = resEspecialidades.ok ? await resEspecialidades.json() : [];
                const bitacora = resBitacora.status === 404 ? [] : resBitacora.ok ? await resBitacora.json() : [];
                const categorias = resCategorias.ok ? await resCategorias.json() : [];
                const cotizaciones = resCotizaciones.status === 404 ? [] : resCotizaciones.ok ? await resCotizaciones.json() : [];
                const categoriasInv = resCategoriasInv.ok ? await resCategoriasInv.json() : [];

                const clientesPorId = new Map(clientes.map((c) => [c.id, c]));
                const tecnicosPorId = new Map(tecnicos.map((t) => [t.id, t]));

                const finalizadas = ordenes
                    .filter((o) => o.estatus === "completada" || o.estatus === "pagada")
                    .map((o) => ({
                        ...o,
                        clienteNombre: clientesPorId.get(o.cli_id)?.nombre || "—",
                        tecnicoNombre: o.tec_id
                            ? tecnicosPorId.get(o.tec_id)?.nombre || `Técnico #${o.tec_id}`
                            : "Sin asignar",
                    }))
                    .sort((a, b) => new Date(b.fecha_cierre || b.fecha_programada) - new Date(a.fecha_cierre || a.fecha_programada));

                setOrdenesFinalizadas(finalizadas);
                setPagosTodos(pagos);
                setItemsPlantillaTodos(items);
                setTecnicosDisponibles(tecnicos);
                setMovimientosTodos(movimientos);
                setInventarioTodos(inventario);
                setTiposMovimientoTodos(tiposMovimiento);
                setEspecialidadesTodas(especialidades);
                setBitacoraTodos(bitacora);
                setCategoriasTodas(categorias);
                setCotizacionesTodas(cotizaciones);
                setCategoriasInventarioTodas(categoriasInv);
                setClientesTodos(clientes);
            } catch (err) {
                setErrorFinalizadas(err.message);
            }
        };
        cargarOrdenesFinalizadas();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // El checklist_ejecucion de cada orden (y su equipo) sí se piden uno por
    // uno, pero solo la primera vez que se necesitan -- se guardan en caché
    // (checklistPorOrden/equipoPorOrden) para no repetir la llamada, ya sea
    // que se pidan al expandir la tarjeta o al abrir el reporte PDF.
    const cargarDetalleOrden = async (orden) => {
        if (checklistPorOrden[orden.id]) return;

        const [resChecklist, resEquipo] = await Promise.all([
            apiFetch(`/api/checklist_ejecucion/orden/${orden.id}`),
            orden.equ_id ? apiFetch(`/api/equipos/${orden.equ_id}`) : Promise.resolve(null),
        ]);

        const ejecucion = resChecklist.status === 404 ? [] : resChecklist.ok ? await resChecklist.json() : [];
        const itemsPorId = new Map(itemsPlantillaTodos.map((i) => [i.id, i]));
        const checklist = ejecucion
            .map((e) => ({
                ...e,
                descripcion: e.item_id ? itemsPorId.get(e.item_id)?.descripcion : e.item_desc,
                ordenItem: e.item_id ? itemsPorId.get(e.item_id)?.orden ?? 999 : 999,
            }))
            .sort((a, b) => a.ordenItem - b.ordenItem);

        setChecklistPorOrden((prev) => ({ ...prev, [orden.id]: checklist }));
        if (resEquipo && resEquipo.ok) {
            const equipo = await resEquipo.json();
            setEquipoPorOrden((prev) => ({ ...prev, [orden.id]: equipo }));
        }
    };

    const toggleExpandir = async (orden) => {
        if (expandidoId === orden.id) {
            setExpandidoId(null);
            return;
        }
        setExpandidoId(orden.id);

        setCargandoDetalleId(orden.id);
        try {
            await cargarDetalleOrden(orden);
        } catch (err) {
            setErrorFinalizadas(err.message);
        } finally {
            setCargandoDetalleId(null);
        }
    };

    const abrirReporteOrden = async (orden) => {
        setCargandoReporteOrdenId(orden.id);
        try {
            await cargarDetalleOrden(orden);
            setReporteOrden(orden);
        } catch (err) {
            setErrorFinalizadas(err.message);
        } finally {
            setCargandoReporteOrdenId(null);
        }
    };

    // Solo cuentan como "piezas" los movimientos que de verdad salen del
    // almacén/vehículo hacia una orden (es_entrada = false) -- una entrada
    // de compra o un ajuste de conteo no es una pieza que se haya usado.
    const tiposUsoPorId = new Map(tiposMovimientoTodos.filter((t) => !t.es_entrada).map((t) => [t.id, t]));
    const inventarioPorId = new Map(inventarioTodos.map((i) => [i.id, i]));

    const piezasDeOrden = (ordId) =>
        movimientosTodos
            .filter((m) => m.ord_id === ordId && tiposUsoPorId.has(m.tip_id))
            .map((m) => ({ ...m, articulo: inventarioPorId.get(m.inv_id)?.nombre || `Artículo #${m.inv_id}` }));

    const piezasDeTecnico = (usuId) => {
        const movimientos = movimientosTodos.filter((m) => m.usu_id === usuId && tiposUsoPorId.has(m.tip_id));
        const porArticulo = new Map();
        movimientos.forEach((m) => {
            const nombre = inventarioPorId.get(m.inv_id)?.nombre || `Artículo #${m.inv_id}`;
            porArticulo.set(nombre, (porArticulo.get(nombre) || 0) + Number(m.cantidad));
        });
        return Array.from(porArticulo.entries()).map(([articulo, cantidad]) => ({ articulo, cantidad }));
    };

    const categoriasPorId = new Map(categoriasTodas.map((c) => [c.id, c]));

    // "Duración real" (desde que el técnico llegó, no desde que se
    // agendó) solo existe para servicios cerrados DESPUÉS de que se
    // agregó bitacora_estados.created_at (ver migración 002) -- las
    // órdenes viejas no tienen esa marca de tiempo y no hay forma de
    // reconstruirla. Para esas, se cae a fecha_programada -> fecha_cierre
    // como aproximación, dejando claro que es aproximada.
    const duracionDeOrden = (orden) => {
        if (!orden.fecha_cierre) return null;
        const llegada = bitacoraTodos.find(
            (b) => b.ord_id === orden.id && b.estado_nuevo === "tecnico_llego" && b.created_at
        );
        const inicio = llegada?.created_at || orden.fecha_programada;
        if (!inicio) return null;
        const horas = (new Date(orden.fecha_cierre) - new Date(inicio)) / (1000 * 60 * 60);
        if (!Number.isFinite(horas) || horas < 0) return null;
        return { horas, exacta: !!llegada };
    };

    const formatoDuracion = (dur) => {
        if (!dur) return "—";
        const texto = dur.horas < 1
            ? `${Math.round(dur.horas * 60)} min`
            : `${dur.horas.toFixed(1)} h`;
        return dur.exacta ? texto : `${texto} (aprox.)`;
    };

    // Promedio de horas por servicio de un técnico -- solo cuenta las
    // órdenes con duración calculable (ver duracionDeOrden); si ninguna
    // tiene datos suficientes (todas de antes de la migración 002, sin
    // técnico llegó registrado y sin fecha_programada), no se muestra.
    const duracionPromedioDeTecnico = (tecId) => {
        const duraciones = ordenesFinalizadas
            .filter((o) => o.tec_id === tecId)
            .map((o) => duracionDeOrden(o))
            .filter(Boolean);
        if (duraciones.length === 0) return null;
        const promedio = duraciones.reduce((s, d) => s + d.horas, 0) / duraciones.length;
        return { horas: promedio, exacta: duraciones.every((d) => d.exacta) };
    };

    // La cotización "vigente" de la orden: la aprobada si existe, si no la
    // más reciente que no esté rechazada -- mismo criterio que se usa en
    // Gestión de Órdenes para el badge de estado de cotización.
    const cotizacionDeOrden = (ordId) => {
        const deEstaOrden = cotizacionesTodas.filter((c) => c.ord_id === ordId && c.estado !== "rechazada");
        if (deEstaOrden.length === 0) return null;
        return deEstaOrden.find((c) => c.estado === "aprobada") || deEstaOrden[deEstaOrden.length - 1];
    };

    const handleRecalcular = async () => {
        setRecalculando(true);
        setError("");
        try {
            const res = await apiFetch("/api/reportes/recalcular", { method: "POST" });
            if (!res.ok) throw new Error("No se pudo recalcular");
            await cargarReportes();
        } catch (err) {
            setError(err.message);
        } finally {
            setRecalculando(false);
        }
    };

    // Convierte cualquier arreglo de objetos a un archivo CSV descargable
    // -- así cumplimos con "exportación de reportes" sin depender de una
    // librería pesada de Excel/PDF.
    const exportarCSV = (datos, nombreArchivo) => {
        if (!datos || datos.length === 0) return;
        const columnas = Object.keys(datos[0]);
        const filas = datos.map((fila) => columnas.map((col) => fila[col]).join(","));
        const csv = [columnas.join(","), ...filas].join("\n");

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const enlace = document.createElement("a");
        enlace.href = url;
        enlace.download = `${nombreArchivo}.csv`;
        enlace.click();
        URL.revokeObjectURL(url);
    };

    if (loading) return <p style={{ padding: "24px" }}>Cargando...</p>;

    const productividad = reportes.productividad_tecnicos || [];
    const cobros = reportes.cobros || [];
    const tecnicosPorTecId = new Map(tecnicosDisponibles.map((t) => [t.id, t]));
    const tecnicosPorUsuId = new Map(tecnicosDisponibles.map((t) => [t.usu_id, t]));
    const clientesPorId = new Map(clientesTodos.map((c) => [c.id, c]));

    // Órdenes que sí atendió un técnico (para el reporte individual con
    // horas por servicio, no solo el promedio) -- mismo criterio de
    // duración que el resto del archivo (duracionDeOrden).
    const ordenesDeTecnico = (tecId) =>
        ordenesFinalizadas
            .filter((o) => o.tec_id === tecId)
            .map((o) => ({ ...o, duracion: duracionDeOrden(o) }))
            .sort((a, b) => new Date(b.fecha_cierre) - new Date(a.fecha_cierre));

    const horasTotalesDeTecnico = (tecId) => {
        const conHoras = ordenesDeTecnico(tecId).filter((o) => o.duracion);
        if (conHoras.length === 0) return null;
        const horas = conHoras.reduce((s, o) => s + o.duracion.horas, 0);
        return { horas, exacta: conHoras.every((o) => o.duracion.exacta), cuenta: conHoras.length, total: ordenesDeTecnico(tecId).length };
    };

    // Productividad -- resumen general arriba de la tabla.
    const totalCompletadas = productividad.reduce((s, p) => s + Number(p.completadas), 0);
    const totalCanceladas = productividad.reduce((s, p) => s + Number(p.canceladas), 0);
    const totalAsignadas = productividad.reduce((s, p) => s + Number(p.total_asignadas), 0);

    // Cobros -- resumen general y desglose por método (para no solo ver
    // filas sueltas de método+estado sin ningún total que las agrupe).
    const totalCobrado = cobros.filter((c) => c.estado === "pagado").reduce((s, c) => s + Number(c.total), 0);
    const totalPendienteCobro = cobros.filter((c) => c.estado === "pendiente").reduce((s, c) => s + Number(c.total), 0);
    const porMetodo = new Map();
    cobros.forEach((c) => {
        const actual = porMetodo.get(c.metodo) || 0;
        porMetodo.set(c.metodo, actual + Number(c.total));
    });
    const totalGeneralCobros = cobros.reduce((s, c) => s + Number(c.total), 0);

    // Inventario -- el reporte precomputado (/api/reportes) solo trae
    // stock_critico; el resto (valor total, por categoría, más usados,
    // movimientos recientes) se calcula aquí mismo con datos ya cargados
    // en vivo (inventarioTodos/movimientosTodos), así siempre refleja el
    // estado actual sin depender de "Actualizar datos".
    const categoriasInvPorId = new Map(categoriasInventarioTodas.map((c) => [c.id, c]));
    const tiposMovimientoPorId = new Map(tiposMovimientoTodos.map((t) => [t.id, t]));

    const valorLinea = (item) => Number(item.stock_actual) * Number(item.precio_venta || 0);
    const valorTotalInventario = inventarioTodos.reduce((s, i) => s + valorLinea(i), 0);
    const stockCritico = inventarioTodos.filter((i) => Number(i.stock_actual) <= Number(i.stock_minimo));

    const porCategoriaMap = new Map();
    inventarioTodos.forEach((item) => {
        const nombreCat = categoriasInvPorId.get(item.cat_id)?.nombre || "Sin categoría";
        const actual = porCategoriaMap.get(nombreCat) || { categoria: nombreCat, articulos: 0, valor: 0, criticos: 0 };
        actual.articulos += 1;
        actual.valor += valorLinea(item);
        if (Number(item.stock_actual) <= Number(item.stock_minimo)) actual.criticos += 1;
        porCategoriaMap.set(nombreCat, actual);
    });
    const porCategoriaInventario = Array.from(porCategoriaMap.values()).sort((a, b) => b.valor - a.valor);

    const usoPorArticulo = new Map();
    movimientosTodos
        .filter((m) => tiposUsoPorId.has(m.tip_id))
        .forEach((m) => {
            const item = inventarioPorId.get(m.inv_id);
            const nombre = item?.nombre || `Artículo #${m.inv_id}`;
            usoPorArticulo.set(nombre, (usoPorArticulo.get(nombre) || 0) + Number(m.cantidad));
        });
    const articulosMasUsados = Array.from(usoPorArticulo.entries())
        .map(([articulo, cantidad]) => ({ articulo, cantidad }))
        .sort((a, b) => b.cantidad - a.cantidad)
        .slice(0, 6);

    // movimientos_inventario no tiene columna de fecha -- el id ascendente
    // es el único proxy disponible para "más reciente primero" (mismo
    // criterio usado en RegistrarMovimiento.jsx / FormularioInventario.jsx).
    const movimientosRecientes = [...movimientosTodos]
        .sort((a, b) => b.id - a.id)
        .slice(0, 10)
        .map((m) => ({
            ...m,
            articulo: inventarioPorId.get(m.inv_id)?.nombre || `Artículo #${m.inv_id}`,
            tipoNombre: tiposMovimientoPorId.get(m.tip_id)?.nombre || "—",
            esEntrada: !!tiposMovimientoPorId.get(m.tip_id)?.es_entrada,
            tecnicoNombre: tecnicosPorUsuId.get(m.usu_id)?.nombre || (m.usu_id ? `Usuario #${m.usu_id}` : "—"),
        }));

    return (
        <div className="page page-wide">
            <Link to="/home" className="page-back">← Inicio</Link>

            <div className="page-header">
                <h1 style={{ fontSize: "1.5rem", margin: 0 }}>Reportes</h1>
                <button className="btn-primary" onClick={handleRecalcular} disabled={recalculando} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    {!recalculando && <Icon name="refresh" className="icon-sm" />}
                    {recalculando ? "Actualizando..." : "Actualizar datos"}
                </button>
            </div>

            {error && <p className="error-text">{error}</p>}

            <div className="tabs">
                {PESTAÑAS.map((p) => (
                    <button
                        key={p}
                        onClick={() => setPestañaActiva(p)}
                        className={pestañaActiva === p ? "tab active" : "tab"}
                    >
                        {p}
                    </button>
                ))}
            </div>

            {pestañaActiva === "Productividad" && (
                <div>
                    {productividad.length > 0 && (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
                            <div className="panel" style={{ padding: "1.1rem 1.25rem" }}>
                                <p className="muted-text" style={{ fontSize: "0.8rem", marginBottom: "0.35rem" }}>Técnicos activos</p>
                                <p style={{ fontSize: "1.5rem", fontWeight: 700 }}>{productividad.length}</p>
                            </div>
                            <div className="panel" style={{ padding: "1.1rem 1.25rem" }}>
                                <p className="muted-text" style={{ fontSize: "0.8rem", marginBottom: "0.35rem" }}>Órdenes completadas</p>
                                <p style={{ fontSize: "1.5rem", fontWeight: 700 }}>{totalCompletadas}</p>
                            </div>
                            <div className="panel" style={{ padding: "1.1rem 1.25rem" }}>
                                <p className="muted-text" style={{ fontSize: "0.8rem", marginBottom: "0.35rem" }}>Órdenes canceladas</p>
                                <p style={{ fontSize: "1.5rem", fontWeight: 700, color: totalCanceladas > 0 ? "var(--color-danger-text)" : undefined }}>{totalCanceladas}</p>
                            </div>
                            <div className="panel" style={{ padding: "1.1rem 1.25rem" }}>
                                <p className="muted-text" style={{ fontSize: "0.8rem", marginBottom: "0.35rem" }}>Tasa de cumplimiento</p>
                                <p style={{ fontSize: "1.5rem", fontWeight: 700 }}>
                                    {totalAsignadas > 0 ? `${Math.round((totalCompletadas / totalAsignadas) * 100)}%` : "—"}
                                </p>
                            </div>
                        </div>
                    )}

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                        <p style={{ fontWeight: "600" }}>Productividad por técnico</p>
                        <button
                            className="btn-sm"
                            onClick={() => {
                                const conDuracion = productividad.map((p) => ({
                                    ...p,
                                    nombre_tecnico: tecnicosPorTecId.get(p.tec_id)?.nombre || `Técnico #${p.usu_id}`,
                                    duracion_promedio_horas: duracionPromedioDeTecnico(p.tec_id)?.horas?.toFixed(2) || "",
                                }));
                                exportarCSV(conDuracion, "productividad_tecnicos");
                            }}
                        >
                            ⬇ Exportar CSV
                        </button>
                    </div>
                    {productividad.length === 0 ? (
                        <div className="empty-state panel">
                            <div className="empty-state-icon"><Icon name="chart" className="icon-md" /></div>
                            <p className="empty-state-title">Sin datos todavía</p>
                            <p className="empty-state-description">Cuando haya órdenes completadas, aquí aparecerá la productividad por técnico.</p>
                        </div>
                    ) : (
                        <div className="table-wrap">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Técnico</th>
                                        <th>Completadas</th>
                                        <th>Canceladas</th>
                                        <th>Total asignadas</th>
                                        <th>Duración promedio</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {productividad.map((p) => (
                                        <tr key={p.tec_id}>
                                            <td>{tecnicosPorTecId.get(p.tec_id)?.nombre || `Técnico #${p.usu_id}`}</td>
                                            <td>{p.completadas}</td>
                                            <td>{p.canceladas}</td>
                                            <td>{p.total_asignadas}</td>
                                            <td>{formatoDuracion(duracionPromedioDeTecnico(p.tec_id))}</td>
                                            <td>
                                                <button className="btn-sm" onClick={() => setReporteTecnico(p)} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                                    <Icon name="file" className="icon-sm" /> Reporte
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {pestañaActiva === "Cobros" && (
                <div>
                    {cobros.length > 0 && (
                        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "1.25rem", marginBottom: "1.5rem", alignItems: "start" }}>
                            <div className="panel" style={{ padding: "1.25rem 1.5rem" }}>
                                <p className="muted-text" style={{ fontSize: "0.8rem", marginBottom: "0.35rem" }}>Total cobrado</p>
                                <p style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "1rem" }}>{formatoMoneda(totalCobrado)}</p>
                                <div style={{ display: "flex", gap: "1.5rem" }}>
                                    <div>
                                        <p className="muted-text" style={{ fontSize: "0.8rem" }}>Pendiente por cobrar</p>
                                        <p style={{ fontWeight: 600, color: totalPendienteCobro > 0 ? "var(--color-warning-text)" : undefined }}>
                                            {formatoMoneda(totalPendienteCobro)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="muted-text" style={{ fontSize: "0.8rem" }}>Total general</p>
                                        <p style={{ fontWeight: 600 }}>{formatoMoneda(totalGeneralCobros)}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="panel" style={{ padding: "1.25rem 1.5rem" }}>
                                <p style={{ fontWeight: 600, marginBottom: "0.75rem", fontSize: "0.9rem" }}>Por método de pago</p>
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                    {Array.from(porMetodo.entries()).sort((a, b) => b[1] - a[1]).map(([metodo, total]) => (
                                        <div key={metodo} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                                            <span style={{ textTransform: "capitalize" }}>{metodo}</span>
                                            <span style={{ fontWeight: 600 }}>{formatoMoneda(total)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                        <p style={{ fontWeight: "600" }}>Desglose de cobros</p>
                        <button className="btn-sm" onClick={() => exportarCSV(cobros, "cobros")}>
                            ⬇ Exportar CSV
                        </button>
                    </div>
                    {cobros.length === 0 ? (
                        <div className="empty-state panel">
                            <div className="empty-state-icon"><Icon name="card" className="icon-md" /></div>
                            <p className="empty-state-title">Sin datos todavía</p>
                            <p className="empty-state-description">Cuando se registren pagos, aquí aparecerá el desglose por método y estado.</p>
                        </div>
                    ) : (
                        <div className="table-wrap">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Método</th>
                                        <th>Estado</th>
                                        <th>Cantidad</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cobros.map((c, i) => (
                                        <tr key={i}>
                                            <td style={{ textTransform: "capitalize" }}>{c.metodo}</td>
                                            <td>
                                                <span className={`badge ${c.estado === "pagado" ? "badge-success" : c.estado === "pendiente" ? "badge-warning" : "badge-neutral"}`}>
                                                    {c.estado}
                                                </span>
                                            </td>
                                            <td>{c.cantidad}</td>
                                            <td>{formatoMoneda(c.total)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {pestañaActiva === "Inventario" && (
                <div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
                        <div className="panel" style={{ padding: "1.1rem 1.25rem" }}>
                            <p className="muted-text" style={{ fontSize: "0.8rem", marginBottom: "0.35rem" }}>Artículos registrados</p>
                            <p style={{ fontSize: "1.5rem", fontWeight: 700 }}>{inventarioTodos.length}</p>
                        </div>
                        <div className="panel" style={{ padding: "1.1rem 1.25rem" }}>
                            <p className="muted-text" style={{ fontSize: "0.8rem", marginBottom: "0.35rem" }}>Valor total en almacén</p>
                            <p style={{ fontSize: "1.5rem", fontWeight: 700 }}>{formatoMoneda(valorTotalInventario)}</p>
                        </div>
                        <div className="panel" style={{ padding: "1.1rem 1.25rem" }}>
                            <p className="muted-text" style={{ fontSize: "0.8rem", marginBottom: "0.35rem" }}>Categorías</p>
                            <p style={{ fontSize: "1.5rem", fontWeight: 700 }}>{categoriasInventarioTodas.length}</p>
                        </div>
                        <div className="panel" style={{ padding: "1.1rem 1.25rem", borderColor: stockCritico.length > 0 ? "var(--color-danger-text)" : undefined }}>
                            <p className="muted-text" style={{ fontSize: "0.8rem", marginBottom: "0.35rem" }}>En stock crítico</p>
                            <p style={{ fontSize: "1.5rem", fontWeight: 700, color: stockCritico.length > 0 ? "var(--color-danger-text)" : undefined }}>
                                {stockCritico.length}
                            </p>
                        </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                        <p style={{ fontWeight: "600" }}>Inventario completo</p>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                            <button className="btn-sm" onClick={() => setReporteInventario(true)} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                <Icon name="file" className="icon-sm" /> Reporte / PDF
                            </button>
                            <button
                                className="btn-sm"
                                onClick={() => {
                                    const conCategoria = inventarioTodos.map((i) => ({
                                        ...i,
                                        categoria: categoriasInvPorId.get(i.cat_id)?.nombre || "Sin categoría",
                                        valor_total: valorLinea(i).toFixed(2),
                                    }));
                                    exportarCSV(conCategoria, "inventario_completo");
                                }}
                            >
                                ⬇ Exportar CSV
                            </button>
                        </div>
                    </div>
                    {inventarioTodos.length === 0 ? (
                        <div className="empty-state panel">
                            <div className="empty-state-icon"><Icon name="box" className="icon-md" /></div>
                            <p className="empty-state-title">Sin artículos registrados</p>
                            <p className="empty-state-description">Cuando se den de alta artículos de inventario, aquí aparecerá el detalle completo.</p>
                        </div>
                    ) : (
                        <div className="table-wrap" style={{ marginBottom: "1.5rem" }}>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Código</th>
                                        <th>Artículo</th>
                                        <th>Categoría</th>
                                        <th>Stock actual</th>
                                        <th>Stock mínimo</th>
                                        <th>Precio</th>
                                        <th>Valor total</th>
                                        <th>Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[...inventarioTodos]
                                        .sort((a, b) => (a.nombre || "").localeCompare(b.nombre || ""))
                                        .map((item) => {
                                            const esCritico = Number(item.stock_actual) <= Number(item.stock_minimo);
                                            return (
                                                <tr key={item.id} className={esCritico ? "row-alert" : ""}>
                                                    <td>{item.codigo || "—"}</td>
                                                    <td>{item.nombre}</td>
                                                    <td>{categoriasInvPorId.get(item.cat_id)?.nombre || "Sin categoría"}</td>
                                                    <td style={{ fontWeight: esCritico ? 600 : 400, color: esCritico ? "var(--color-danger-text)" : undefined }}>
                                                        {item.stock_actual} {item.unidad_medida}
                                                    </td>
                                                    <td>{item.stock_minimo}</td>
                                                    <td>{formatoMoneda(item.precio_venta)}</td>
                                                    <td>{formatoMoneda(valorLinea(item))}</td>
                                                    <td>
                                                        <span className={`badge ${esCritico ? "badge-danger" : "badge-success"}`}>
                                                            {esCritico ? "Crítico" : "Normal"}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <p style={{ fontWeight: "600", marginBottom: "0.75rem" }}>Movimientos recientes</p>
                    {movimientosRecientes.length === 0 ? (
                        <div className="empty-state panel">
                            <div className="empty-state-icon"><Icon name="route" className="icon-md" /></div>
                            <p className="empty-state-title">Sin movimientos registrados</p>
                            <p className="empty-state-description">Las entradas, salidas y ajustes de inventario aparecerán aquí.</p>
                        </div>
                    ) : (
                        <div className="table-wrap">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Artículo</th>
                                        <th>Tipo</th>
                                        <th>Cantidad</th>
                                        <th>Orden</th>
                                        <th>Técnico</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {movimientosRecientes.map((m) => (
                                        <tr key={m.id}>
                                            <td>{m.articulo}</td>
                                            <td>
                                                <span className={`badge ${m.esEntrada ? "badge-info" : "badge-neutral"}`}>{m.tipoNombre}</span>
                                            </td>
                                            <td>{m.cantidad}</td>
                                            <td>{m.ord_id ? `Orden #${m.ord_id}` : "—"}</td>
                                            <td>{m.tecnicoNombre}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {pestañaActiva === "Órdenes finalizadas" && (
                <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                        <p style={{ fontWeight: "600", margin: 0 }}>Resumen de órdenes completadas/pagadas</p>
                        <select value={filtroTecnico} onChange={(e) => setFiltroTecnico(e.target.value)}>
                            <option value="todos">Todos los técnicos</option>
                            {tecnicosDisponibles.map((tec) => (
                                <option key={tec.id} value={tec.id}>
                                    {tec.nombre || `Técnico #${tec.usu_id}`}
                                </option>
                            ))}
                        </select>
                    </div>
                    {errorFinalizadas && <p style={{ color: "red" }}>{errorFinalizadas}</p>}

                    {(() => {
                        const ordenesAMostrar =
                            filtroTecnico === "todos"
                                ? ordenesFinalizadas
                                : ordenesFinalizadas.filter((o) => String(o.tec_id) === filtroTecnico);

                        if (ordenesFinalizadas.length === 0) {
                            return <p>Todavía no hay órdenes finalizadas.</p>;
                        }
                        if (ordenesAMostrar.length === 0) {
                            return <p>Este técnico no tiene órdenes finalizadas.</p>;
                        }

                        return (
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            {ordenesAMostrar.map((orden) => {
                                const expandido = expandidoId === orden.id;
                                const pagosOrden = pagosTodos.filter((p) => p.ord_id === orden.id);
                                const checklist = checklistPorOrden[orden.id];
                                const equipo = equipoPorOrden[orden.id];

                                return (
                                    <div
                                        key={orden.id}
                                        style={{ border: "1px solid #e5e7eb", borderRadius: "8px", overflow: "hidden" }}
                                    >
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                background: expandido ? "#f9fafb" : "#fff",
                                            }}
                                        >
                                            <button
                                                onClick={() => toggleExpandir(orden)}
                                                style={{
                                                    flex: 1,
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    alignItems: "center",
                                                    padding: "12px 16px",
                                                    background: "transparent",
                                                    border: "none",
                                                    cursor: "pointer",
                                                    textAlign: "left",
                                                }}
                                            >
                                                <div>
                                                    <p style={{ margin: 0, fontWeight: "600" }}>
                                                        {orden.folio} — {orden.clienteNombre}
                                                    </p>
                                                    <p style={{ margin: 0, fontSize: "12px", color: "#6b7280" }}>
                                                        Técnico: {orden.tecnicoNombre} · Estatus: {orden.estatus}
                                                        {orden.fecha_cierre &&
                                                            ` · Cerrada: ${new Date(orden.fecha_cierre).toLocaleDateString("es-MX")}`}
                                                        {` · Duración: ${formatoDuracion(duracionDeOrden(orden))}`}
                                                    </p>
                                                </div>
                                                <span>{expandido ? "▲" : "▼"}</span>
                                            </button>
                                            <button
                                                onClick={() => abrirReporteOrden(orden)}
                                                disabled={cargandoReporteOrdenId === orden.id}
                                                style={{ margin: "0 16px", display: "flex", alignItems: "center", gap: "5px" }}
                                            >
                                                {cargandoReporteOrdenId !== orden.id && <Icon name="file" className="icon-sm" />}
                                                {cargandoReporteOrdenId === orden.id ? "Cargando..." : "Reporte"}
                                            </button>
                                        </div>

                                        {expandido && (
                                            <div style={{ padding: "16px", borderTop: "1px solid #e5e7eb" }}>
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        gap: "24px",
                                                        flexWrap: "wrap",
                                                        marginBottom: "16px",
                                                        fontSize: "13px",
                                                    }}
                                                >
                                                    <div>
                                                        <p style={{ margin: 0, color: "#9ca3af" }}>Equipo</p>
                                                        <p style={{ margin: 0 }}>
                                                            {equipo ? `${equipo.tipo} — ${equipo.modelo}` : "Sin equipo asociado"}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p style={{ margin: 0, color: "#9ca3af" }}>Categoría</p>
                                                        <p style={{ margin: 0 }}>{categoriasPorId.get(orden.cat_id)?.nombre || "—"}</p>
                                                    </div>
                                                    <div>
                                                        <p style={{ margin: 0, color: "#9ca3af" }}>Prioridad</p>
                                                        <p style={{ margin: 0, textTransform: "capitalize" }}>{orden.prioridad || "—"}</p>
                                                    </div>
                                                    <div>
                                                        <p style={{ margin: 0, color: "#9ca3af" }}>Descripción</p>
                                                        <p style={{ margin: 0 }}>{orden.descripcion || "—"}</p>
                                                    </div>
                                                </div>

                                                <p style={{ fontWeight: "600", fontSize: "13px", marginBottom: "6px" }}>
                                                    Checklist
                                                </p>
                                                {cargandoDetalleId === orden.id ? (
                                                    <p style={{ fontSize: "13px", color: "#9ca3af" }}>Cargando...</p>
                                                ) : checklist && checklist.length > 0 ? (
                                                    <div style={{ marginBottom: "16px" }}>
                                                        {checklist.map((item) => (
                                                            <div
                                                                key={item.id}
                                                                style={{ display: "flex", gap: "8px", fontSize: "13px", padding: "4px 0" }}
                                                            >
                                                                <Icon name={item.completado ? "check-square" : "square"} className="icon-sm" style={{ color: item.completado ? "#15803d" : "#9ca3af" }} />
                                                                <span>
                                                                    {item.descripcion || "(sin descripción)"}
                                                                    {item.notas && <span style={{ color: "#9ca3af" }}> — {item.notas}</span>}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p style={{ fontSize: "13px", color: "#9ca3af", marginBottom: "16px" }}>
                                                        No se marcó ningún checklist para esta orden.
                                                    </p>
                                                )}

                                                <p style={{ fontWeight: "600", fontSize: "13px", marginBottom: "6px" }}>Pagos</p>
                                                {(() => {
                                                    const cot = cotizacionDeOrden(orden.id);
                                                    if (!cot) return null;
                                                    const cobrado = pagosOrden.filter((p) => p.estado === "pagado").reduce((s, p) => s + Number(p.monto), 0);
                                                    return (
                                                        <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "6px" }}>
                                                            Cotizado: {formatoMoneda(cot.total)} · Cobrado: {formatoMoneda(cobrado)}
                                                        </p>
                                                    );
                                                })()}
                                                {pagosOrden.length === 0 ? (
                                                    <p style={{ fontSize: "13px", color: "#9ca3af" }}>Sin pagos registrados.</p>
                                                ) : (
                                                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                                                        <thead>
                                                            <tr style={{ textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>
                                                                <th style={{ padding: "6px" }}>Método</th>
                                                                <th style={{ padding: "6px" }}>Estado</th>
                                                                <th style={{ padding: "6px" }}>Monto</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {pagosOrden.map((pago) => (
                                                                <tr key={pago.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                                                    <td style={{ padding: "6px", textTransform: "capitalize" }}>{pago.metodo}</td>
                                                                    <td style={{ padding: "6px", textTransform: "capitalize" }}>{pago.estado}</td>
                                                                    <td style={{ padding: "6px" }}>{formatoMoneda(pago.monto)}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        );
                    })()}
                </div>
            )}

            {reporteOrden && (
                <ReporteImprimible
                    titulo={`Reporte de servicio — ${reporteOrden.folio}`}
                    subtitulo={`Cliente: ${reporteOrden.clienteNombre}`}
                    onCerrar={() => setReporteOrden(null)}
                    firmas={["Firma del técnico", "Firma del cliente"]}
                >
                    {(() => {
                        const cliente = clientesPorId.get(reporteOrden.cli_id);
                        if (!cliente) return null;
                        return (
                            <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", marginBottom: "16px", fontSize: "13px", color: "#6b7280", background: "#f9fafb", borderRadius: "6px", padding: "10px 14px" }}>
                                {cliente.telefono && <span>📞 {cliente.telefono}</span>}
                                {cliente.email && <span>✉ {cliente.email}</span>}
                                {cliente.direccion && <span>📍 {cliente.direccion}</span>}
                            </div>
                        );
                    })()}

                    <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", marginBottom: "20px", fontSize: "14px" }}>
                        <div>
                            <p style={{ margin: 0, color: "#9ca3af" }}>Técnico</p>
                            <p style={{ margin: 0 }}>{reporteOrden.tecnicoNombre}</p>
                        </div>
                        <div>
                            <p style={{ margin: 0, color: "#9ca3af" }}>Estatus</p>
                            <p style={{ margin: 0, textTransform: "capitalize" }}>{reporteOrden.estatus}</p>
                        </div>
                        <div>
                            <p style={{ margin: 0, color: "#9ca3af" }}>Fecha programada</p>
                            <p style={{ margin: 0 }}>
                                {reporteOrden.fecha_programada
                                    ? new Date(reporteOrden.fecha_programada).toLocaleString("es-MX", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
                                    : "—"}
                            </p>
                        </div>
                        <div>
                            <p style={{ margin: 0, color: "#9ca3af" }}>Fecha de cierre</p>
                            <p style={{ margin: 0 }}>
                                {reporteOrden.fecha_cierre
                                    ? new Date(reporteOrden.fecha_cierre).toLocaleString("es-MX", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
                                    : "—"}
                            </p>
                        </div>
                        <div>
                            <p style={{ margin: 0, color: "#9ca3af" }}>Horas invertidas</p>
                            <p style={{ margin: 0, fontWeight: 600 }}>{formatoDuracion(duracionDeOrden(reporteOrden))}</p>
                        </div>
                        <div>
                            <p style={{ margin: 0, color: "#9ca3af" }}>Categoría</p>
                            <p style={{ margin: 0 }}>{categoriasPorId.get(reporteOrden.cat_id)?.nombre || "—"}</p>
                        </div>
                        <div>
                            <p style={{ margin: 0, color: "#9ca3af" }}>Prioridad</p>
                            <p style={{ margin: 0, textTransform: "capitalize" }}>{reporteOrden.prioridad || "—"}</p>
                        </div>
                        <div>
                            <p style={{ margin: 0, color: "#9ca3af" }}>Equipo</p>
                            <p style={{ margin: 0 }}>
                                {equipoPorOrden[reporteOrden.id]
                                    ? `${equipoPorOrden[reporteOrden.id].tipo} — ${equipoPorOrden[reporteOrden.id].modelo}`
                                    : "Sin equipo asociado"}
                            </p>
                        </div>
                    </div>

                    <p style={{ fontWeight: "600", marginBottom: "6px" }}>Descripción del servicio</p>
                    <p style={{ marginTop: 0, marginBottom: "20px" }}>{reporteOrden.descripcion || "—"}</p>

                    <p style={{ fontWeight: "600", marginBottom: "6px" }}>Checklist realizado</p>
                    {(checklistPorOrden[reporteOrden.id] || []).length === 0 ? (
                        <p style={{ color: "#9ca3af", marginBottom: "20px" }}>No se marcó ningún checklist para esta orden.</p>
                    ) : (
                        <div style={{ marginBottom: "20px" }}>
                            {checklistPorOrden[reporteOrden.id].map((item) => (
                                <div key={item.id} style={{ display: "flex", gap: "8px", fontSize: "14px", padding: "3px 0" }}>
                                    <Icon name={item.completado ? "check-square" : "square"} className="icon-sm" style={{ color: item.completado ? "#15803d" : "#9ca3af" }} />
                                    <span>
                                        {item.descripcion || "(sin descripción)"}
                                        {item.notas && <span style={{ color: "#9ca3af" }}> — {item.notas}</span>}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    <p style={{ fontWeight: "600", marginBottom: "6px" }}>Piezas / artículos usados</p>
                    {piezasDeOrden(reporteOrden.id).length === 0 ? (
                        <p style={{ color: "#9ca3af", marginBottom: "20px" }}>No se registraron piezas usadas en esta orden.</p>
                    ) : (
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", marginBottom: "20px" }}>
                            <thead>
                                <tr style={{ textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>
                                    <th style={{ padding: "6px" }}>Artículo</th>
                                    <th style={{ padding: "6px" }}>Cantidad</th>
                                </tr>
                            </thead>
                            <tbody>
                                {piezasDeOrden(reporteOrden.id).map((m) => (
                                    <tr key={m.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                        <td style={{ padding: "6px" }}>{m.articulo}</td>
                                        <td style={{ padding: "6px" }}>{m.cantidad}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    <p style={{ fontWeight: "600", marginBottom: "6px" }}>Pagos</p>
                    {(() => {
                        const cot = cotizacionDeOrden(reporteOrden.id);
                        if (!cot) return null;
                        const cobrado = pagosTodos
                            .filter((p) => p.ord_id === reporteOrden.id && p.estado === "pagado")
                            .reduce((s, p) => s + Number(p.monto), 0);
                        return (
                            <p style={{ fontSize: "14px", color: "#6b7280", marginTop: 0, marginBottom: "10px" }}>
                                Cotizado: {formatoMoneda(cot.total)} · Cobrado: {formatoMoneda(cobrado)}
                            </p>
                        );
                    })()}
                    {pagosTodos.filter((p) => p.ord_id === reporteOrden.id).length === 0 ? (
                        <p style={{ color: "#9ca3af" }}>Sin pagos registrados.</p>
                    ) : (
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                            <thead>
                                <tr style={{ textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>
                                    <th style={{ padding: "6px" }}>Método</th>
                                    <th style={{ padding: "6px" }}>Estado</th>
                                    <th style={{ padding: "6px" }}>Monto</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pagosTodos
                                    .filter((p) => p.ord_id === reporteOrden.id)
                                    .map((pago) => (
                                        <tr key={pago.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                            <td style={{ padding: "6px", textTransform: "capitalize" }}>{pago.metodo}</td>
                                            <td style={{ padding: "6px", textTransform: "capitalize" }}>{pago.estado}</td>
                                            <td style={{ padding: "6px" }}>{formatoMoneda(pago.monto)}</td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    )}
                </ReporteImprimible>
            )}

            {reporteTecnico && (
                <ReporteImprimible
                    titulo={`Reporte de técnico — ${tecnicosPorTecId.get(reporteTecnico.tec_id)?.nombre || `Técnico #${reporteTecnico.usu_id}`}`}
                    subtitulo={
                        especialidadesTodas.find((e) => e.id === tecnicosPorTecId.get(reporteTecnico.tec_id)?.esp_id)?.nombre || ""
                    }
                    onCerrar={() => setReporteTecnico(null)}
                >
                    <div style={{ display: "flex", gap: "32px", marginBottom: "10px", flexWrap: "wrap" }}>
                        <div>
                            <p style={{ margin: 0, color: "#9ca3af", fontSize: "13px" }}>Órdenes completadas</p>
                            <p style={{ margin: 0, fontSize: "22px", fontWeight: "700" }}>{reporteTecnico.completadas}</p>
                        </div>
                        <div>
                            <p style={{ margin: 0, color: "#9ca3af", fontSize: "13px" }}>Órdenes canceladas</p>
                            <p style={{ margin: 0, fontSize: "22px", fontWeight: "700" }}>{reporteTecnico.canceladas}</p>
                        </div>
                        <div>
                            <p style={{ margin: 0, color: "#9ca3af", fontSize: "13px" }}>Total asignadas</p>
                            <p style={{ margin: 0, fontSize: "22px", fontWeight: "700" }}>{reporteTecnico.total_asignadas}</p>
                        </div>
                        <div>
                            <p style={{ margin: 0, color: "#9ca3af", fontSize: "13px" }}>Duración promedio</p>
                            <p style={{ margin: 0, fontSize: "22px", fontWeight: "700" }}>
                                {formatoDuracion(duracionPromedioDeTecnico(reporteTecnico.tec_id))}
                            </p>
                        </div>
                        <div>
                            <p style={{ margin: 0, color: "#9ca3af", fontSize: "13px" }}>Horas totales trabajadas</p>
                            <p style={{ margin: 0, fontSize: "22px", fontWeight: "700" }}>
                                {(() => {
                                    const h = horasTotalesDeTecnico(reporteTecnico.tec_id);
                                    if (!h) return "—";
                                    return `${h.horas < 1 ? `${Math.round(h.horas * 60)} min` : `${h.horas.toFixed(1)} h`}${h.exacta ? "" : " (aprox.)"}`;
                                })()}
                            </p>
                        </div>
                    </div>
                    <p style={{ margin: "0 0 20px", fontSize: "11px", color: "#9ca3af" }}>
                        Las horas se calculan desde el registro de "técnico llegó" hasta el cierre de la orden; cuando esa marca no existe (órdenes anteriores a la bitácora de estados), se aproxima desde la fecha programada.
                    </p>

                    <p style={{ fontWeight: "600", marginBottom: "6px" }}>Órdenes atendidas</p>
                    {(() => {
                        const tecnico = tecnicosPorTecId.get(reporteTecnico.tec_id);
                        const ordenes = tecnico ? ordenesDeTecnico(tecnico.id) : [];
                        if (ordenes.length === 0) {
                            return <p style={{ color: "#9ca3af", marginBottom: "20px" }}>Este técnico no tiene órdenes finalizadas.</p>;
                        }
                        return (
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", marginBottom: "20px" }}>
                                <thead>
                                    <tr style={{ textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>
                                        <th style={{ padding: "6px" }}>Folio</th>
                                        <th style={{ padding: "6px" }}>Cliente</th>
                                        <th style={{ padding: "6px" }}>Cierre</th>
                                        <th style={{ padding: "6px" }}>Estatus</th>
                                        <th style={{ padding: "6px" }}>Horas</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ordenes.map((o) => (
                                        <tr key={o.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                            <td style={{ padding: "6px" }}>{o.folio}</td>
                                            <td style={{ padding: "6px" }}>{o.clienteNombre}</td>
                                            <td style={{ padding: "6px" }}>
                                                {o.fecha_cierre ? new Date(o.fecha_cierre).toLocaleDateString("es-MX") : "—"}
                                            </td>
                                            <td style={{ padding: "6px", textTransform: "capitalize" }}>{o.estatus}</td>
                                            <td style={{ padding: "6px" }}>{formatoDuracion(o.duracion)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        );
                    })()}

                    <p style={{ fontWeight: "600", marginBottom: "6px" }}>Piezas / artículos usados (histórico)</p>
                    {(() => {
                        const tecnico = tecnicosPorTecId.get(reporteTecnico.tec_id);
                        const piezas = tecnico ? piezasDeTecnico(tecnico.usu_id) : [];
                        if (piezas.length === 0) {
                            return <p style={{ color: "#9ca3af" }}>No se registraron piezas usadas por este técnico.</p>;
                        }
                        return (
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                                <thead>
                                    <tr style={{ textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>
                                        <th style={{ padding: "6px" }}>Artículo</th>
                                        <th style={{ padding: "6px" }}>Cantidad total usada</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {piezas.map((p) => (
                                        <tr key={p.articulo} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                            <td style={{ padding: "6px" }}>{p.articulo}</td>
                                            <td style={{ padding: "6px" }}>{p.cantidad}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        );
                    })()}
                </ReporteImprimible>
            )}

            {reporteInventario && (
                <ReporteImprimible
                    titulo="Reporte general de inventario"
                    subtitulo={`Corte al ${new Date().toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })}`}
                    onCerrar={() => setReporteInventario(false)}
                >
                    <div style={{ display: "flex", gap: "32px", marginBottom: "20px", flexWrap: "wrap" }}>
                        <div>
                            <p style={{ margin: 0, color: "#9ca3af", fontSize: "13px" }}>Artículos registrados</p>
                            <p style={{ margin: 0, fontSize: "22px", fontWeight: "700" }}>{inventarioTodos.length}</p>
                        </div>
                        <div>
                            <p style={{ margin: 0, color: "#9ca3af", fontSize: "13px" }}>Valor total en almacén</p>
                            <p style={{ margin: 0, fontSize: "22px", fontWeight: "700" }}>{formatoMoneda(valorTotalInventario)}</p>
                        </div>
                        <div>
                            <p style={{ margin: 0, color: "#9ca3af", fontSize: "13px" }}>Categorías</p>
                            <p style={{ margin: 0, fontSize: "22px", fontWeight: "700" }}>{categoriasInventarioTodas.length}</p>
                        </div>
                        <div>
                            <p style={{ margin: 0, color: "#9ca3af", fontSize: "13px" }}>En stock crítico</p>
                            <p style={{ margin: 0, fontSize: "22px", fontWeight: "700", color: stockCritico.length > 0 ? "#b91c1c" : undefined }}>
                                {stockCritico.length}
                            </p>
                        </div>
                    </div>

                    <p style={{ fontWeight: "600", marginBottom: "6px" }}>Valor por categoría</p>
                    {porCategoriaInventario.length === 0 ? (
                        <p style={{ color: "#9ca3af", marginBottom: "20px" }}>Sin artículos registrados.</p>
                    ) : (
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", marginBottom: "20px" }}>
                            <thead>
                                <tr style={{ textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>
                                    <th style={{ padding: "6px" }}>Categoría</th>
                                    <th style={{ padding: "6px" }}>Artículos</th>
                                    <th style={{ padding: "6px" }}>Críticos</th>
                                    <th style={{ padding: "6px" }}>Valor</th>
                                </tr>
                            </thead>
                            <tbody>
                                {porCategoriaInventario.map((cat) => (
                                    <tr key={cat.categoria} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                        <td style={{ padding: "6px" }}>{cat.categoria}</td>
                                        <td style={{ padding: "6px" }}>{cat.articulos}</td>
                                        <td style={{ padding: "6px", color: cat.criticos > 0 ? "#b91c1c" : undefined }}>{cat.criticos || "—"}</td>
                                        <td style={{ padding: "6px" }}>{formatoMoneda(cat.valor)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    <p style={{ fontWeight: "600", marginBottom: "6px" }}>Artículos más usados</p>
                    {articulosMasUsados.length === 0 ? (
                        <p style={{ color: "#9ca3af", marginBottom: "20px" }}>Todavía no hay movimientos de salida registrados.</p>
                    ) : (
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", marginBottom: "20px" }}>
                            <thead>
                                <tr style={{ textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>
                                    <th style={{ padding: "6px" }}>Artículo</th>
                                    <th style={{ padding: "6px" }}>Cantidad usada</th>
                                </tr>
                            </thead>
                            <tbody>
                                {articulosMasUsados.map((a) => (
                                    <tr key={a.articulo} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                        <td style={{ padding: "6px" }}>{a.articulo}</td>
                                        <td style={{ padding: "6px" }}>{a.cantidad}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    <p style={{ fontWeight: "600", marginBottom: "6px" }}>Inventario completo</p>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", marginBottom: "20px" }}>
                        <thead>
                            <tr style={{ textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>
                                <th style={{ padding: "5px" }}>Código</th>
                                <th style={{ padding: "5px" }}>Artículo</th>
                                <th style={{ padding: "5px" }}>Categoría</th>
                                <th style={{ padding: "5px" }}>Stock</th>
                                <th style={{ padding: "5px" }}>Mínimo</th>
                                <th style={{ padding: "5px" }}>Precio</th>
                                <th style={{ padding: "5px" }}>Valor</th>
                                <th style={{ padding: "5px" }}>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...inventarioTodos]
                                .sort((a, b) => (a.nombre || "").localeCompare(b.nombre || ""))
                                .map((item) => {
                                    const esCritico = Number(item.stock_actual) <= Number(item.stock_minimo);
                                    return (
                                        <tr key={item.id} style={{ borderBottom: "1px solid #f3f4f6", background: esCritico ? "#fef2f2" : undefined }}>
                                            <td style={{ padding: "5px" }}>{item.codigo || "—"}</td>
                                            <td style={{ padding: "5px" }}>{item.nombre}</td>
                                            <td style={{ padding: "5px" }}>{categoriasInvPorId.get(item.cat_id)?.nombre || "Sin categoría"}</td>
                                            <td style={{ padding: "5px", fontWeight: esCritico ? 600 : 400, color: esCritico ? "#b91c1c" : undefined }}>
                                                {item.stock_actual} {item.unidad_medida}
                                            </td>
                                            <td style={{ padding: "5px" }}>{item.stock_minimo}</td>
                                            <td style={{ padding: "5px" }}>{formatoMoneda(item.precio_venta)}</td>
                                            <td style={{ padding: "5px" }}>{formatoMoneda(valorLinea(item))}</td>
                                            <td style={{ padding: "5px" }}>{esCritico ? "Crítico" : "Normal"}</td>
                                        </tr>
                                    );
                                })}
                        </tbody>
                    </table>

                    <p style={{ fontWeight: "600", marginBottom: "6px" }}>Movimientos recientes</p>
                    {movimientosRecientes.length === 0 ? (
                        <p style={{ color: "#9ca3af" }}>Sin movimientos registrados.</p>
                    ) : (
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                            <thead>
                                <tr style={{ textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>
                                    <th style={{ padding: "6px" }}>Artículo</th>
                                    <th style={{ padding: "6px" }}>Tipo</th>
                                    <th style={{ padding: "6px" }}>Cantidad</th>
                                    <th style={{ padding: "6px" }}>Orden</th>
                                    <th style={{ padding: "6px" }}>Técnico</th>
                                </tr>
                            </thead>
                            <tbody>
                                {movimientosRecientes.map((m) => (
                                    <tr key={m.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                        <td style={{ padding: "6px" }}>{m.articulo}</td>
                                        <td style={{ padding: "6px" }}>{m.tipoNombre}</td>
                                        <td style={{ padding: "6px" }}>{m.cantidad}</td>
                                        <td style={{ padding: "6px" }}>{m.ord_id ? `Orden #${m.ord_id}` : "—"}</td>
                                        <td style={{ padding: "6px" }}>{m.tecnicoNombre}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </ReporteImprimible>
            )}
        </div>
    );
};

export default Reportes;