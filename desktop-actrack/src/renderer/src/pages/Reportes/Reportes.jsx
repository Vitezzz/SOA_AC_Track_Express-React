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

    const [reporteOrden, setReporteOrden] = useState(null);
    const [reporteTecnico, setReporteTecnico] = useState(null);
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
    const stockCritico = reportes.stock_critico || [];
    const tecnicosPorTecId = new Map(tecnicosDisponibles.map((t) => [t.id, t]));

    return (
        <div style={{ padding: "24px" }}>
            <Link to="/home">← Inicio</Link>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
                <h2>Reportes</h2>
                <button onClick={handleRecalcular} disabled={recalculando} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    {!recalculando && <Icon name="refresh" className="icon-sm" />}
                    {recalculando ? "Actualizando..." : "Actualizar datos"}
                </button>
            </div>

            {error && <p style={{ color: "red" }}>{error}</p>}

            <div style={{ display: "flex", gap: "8px", margin: "16px 0", borderBottom: "1px solid #e5e7eb" }}>
                {PESTAÑAS.map((p) => (
                    <button
                        key={p}
                        onClick={() => setPestañaActiva(p)}
                        style={{
                            padding: "8px 16px",
                            border: "none",
                            borderBottom: pestañaActiva === p ? "2px solid #111827" : "2px solid transparent",
                            background: "transparent",
                            fontWeight: pestañaActiva === p ? "600" : "400",
                            cursor: "pointer",
                        }}
                    >
                        {p}
                    </button>
                ))}
            </div>

            {pestañaActiva === "Productividad" && (
                <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                        <p style={{ fontWeight: "600" }}>Productividad por técnico</p>
                        <button onClick={() => exportarCSV(productividad, "productividad_tecnicos")}>
                            ⬇ Exportar CSV
                        </button>
                    </div>
                    {productividad.length === 0 ? (
                        <p>Sin datos todavía.</p>
                    ) : (
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ textAlign: "left", borderBottom: "2px solid #e5e7eb" }}>
                                    <th style={{ padding: "8px" }}>Técnico</th>
                                    <th style={{ padding: "8px" }}>Completadas</th>
                                    <th style={{ padding: "8px" }}>Canceladas</th>
                                    <th style={{ padding: "8px" }}>Total asignadas</th>
                                    <th style={{ padding: "8px" }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {productividad.map((p) => (
                                    <tr key={p.tec_id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                        <td style={{ padding: "8px" }}>
                                            {tecnicosPorTecId.get(p.tec_id)?.nombre || `Técnico #${p.usu_id}`}
                                        </td>
                                        <td style={{ padding: "8px" }}>{p.completadas}</td>
                                        <td style={{ padding: "8px" }}>{p.canceladas}</td>
                                        <td style={{ padding: "8px" }}>{p.total_asignadas}</td>
                                        <td style={{ padding: "8px" }}>
                                            <button onClick={() => setReporteTecnico(p)} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                                <Icon name="file" className="icon-sm" /> Reporte
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {pestañaActiva === "Cobros" && (
                <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                        <p style={{ fontWeight: "600" }}>Desglose de cobros</p>
                        <button onClick={() => exportarCSV(cobros, "cobros")}>
                            ⬇ Exportar CSV
                        </button>
                    </div>
                    {cobros.length === 0 ? (
                        <p>Sin datos todavía.</p>
                    ) : (
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ textAlign: "left", borderBottom: "2px solid #e5e7eb" }}>
                                    <th style={{ padding: "8px" }}>Método</th>
                                    <th style={{ padding: "8px" }}>Estado</th>
                                    <th style={{ padding: "8px" }}>Cantidad</th>
                                    <th style={{ padding: "8px" }}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cobros.map((c, i) => (
                                    <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                        <td style={{ padding: "8px", textTransform: "capitalize" }}>{c.metodo}</td>
                                        <td style={{ padding: "8px", textTransform: "capitalize" }}>{c.estado}</td>
                                        <td style={{ padding: "8px" }}>{c.cantidad}</td>
                                        <td style={{ padding: "8px" }}>{formatoMoneda(c.total)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {pestañaActiva === "Inventario" && (
                <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                        <p style={{ fontWeight: "600" }}>Artículos en stock crítico</p>
                        <button onClick={() => exportarCSV(stockCritico, "stock_critico")}>
                            ⬇ Exportar CSV
                        </button>
                    </div>
                    {stockCritico.length === 0 ? (
                        <p style={{ color: "#15803d" }}>Ningún artículo está en nivel crítico ahorita.</p>
                    ) : (
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ textAlign: "left", borderBottom: "2px solid #e5e7eb" }}>
                                    <th style={{ padding: "8px" }}>Artículo</th>
                                    <th style={{ padding: "8px" }}>Stock actual</th>
                                    <th style={{ padding: "8px" }}>Stock mínimo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stockCritico.map((item) => (
                                    <tr key={item.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                        <td style={{ padding: "8px" }}>{item.nombre}</td>
                                        <td style={{ padding: "8px", color: "#b91c1c", fontWeight: "600" }}>{item.stock_actual}</td>
                                        <td style={{ padding: "8px" }}>{item.stock_minimo}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
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
                                                                <span>{item.descripcion || "(sin descripción)"}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p style={{ fontSize: "13px", color: "#9ca3af", marginBottom: "16px" }}>
                                                        No se marcó ningún checklist para esta orden.
                                                    </p>
                                                )}

                                                <p style={{ fontWeight: "600", fontSize: "13px", marginBottom: "6px" }}>Pagos</p>
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
                >
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
                            <p style={{ margin: 0, color: "#9ca3af" }}>Fecha de cierre</p>
                            <p style={{ margin: 0 }}>
                                {reporteOrden.fecha_cierre
                                    ? new Date(reporteOrden.fecha_cierre).toLocaleDateString("es-MX")
                                    : "—"}
                            </p>
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
                                    <span>{item.descripcion || "(sin descripción)"}</span>
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
                    <div style={{ display: "flex", gap: "32px", marginBottom: "24px" }}>
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
                    </div>

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
        </div>
    );
};

export default Reportes;