import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const formatoMoneda = (valor) =>
    new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(valor);

const EditarCotizacion = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { apiFetch, user } = useAuth();
    const esAdmin = user?.rol_id === 2;

    const [cotizacion, setCotizacion] = useState(null);
    const [tecnicos, setTecnicos] = useState([]);
    const [inventario, setInventario] = useState([]);
    const [stockVehiculo, setStockVehiculo] = useState([]);
    const [renglones, setRenglones] = useState([]);

    // Contexto de la orden que se está cotizando -- sin esto no se ve qué
    // pidió el cliente ni en qué equipo, y cotizar se siente a ciegas.
    const [orden, setOrden] = useState(null);
    const [cliente, setCliente] = useState(null);
    const [equipo, setEquipo] = useState(null);
    const [marca, setMarca] = useState(null);
    const [categoria, setCategoria] = useState(null);

    const [tecId, setTecId] = useState("");
    const [estado, setEstado] = useState("");
    const [notas, setNotas] = useState("");

    const [invId, setInvId] = useState("");
    const [cantidadPieza, setCantidadPieza] = useState("");
    const [precioUnitario, setPrecioUnitario] = useState("");
    const [esManoObra, setEsManoObra] = useState(false);
    const [concepto, setConcepto] = useState("");

    const [loading, setLoading] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [agregando, setAgregando] = useState(false);
    const [error, setError] = useState("");
    const [guardado, setGuardado] = useState(false);

    const cargarDatos = async () => {
        try {
            const [resCotizacion, resTecnicos, resInventario, resDetalle, resStock] = await Promise.all([
                apiFetch(`/api/cotizaciones/${id}`),
                apiFetch("/api/tecnicos/"),
                apiFetch("/api/inventario"),
                apiFetch("/api/cotizacion_detalle"),
                apiFetch("/api/inventario_vehiculo"),
            ]);

            if (!resCotizacion.ok) throw new Error("No se pudo cargar la cotización");
            const data = await resCotizacion.json();
            setCotizacion(data);
            setTecId(data.tec_id || "");
            setEstado(data.estado);
            setNotas(data.notas || "");

            if (resTecnicos.status !== 404 && resTecnicos.ok) setTecnicos(await resTecnicos.json());
            if (resInventario.ok) setInventario(await resInventario.json());

            if (resStock.status === 404) {
                setStockVehiculo([]);
            } else if (resStock.ok) {
                const todoElStock = await resStock.json();
                setStockVehiculo(todoElStock.filter((s) => s.tec_id === data.tec_id));
            }

            if (resDetalle.status === 404) {
                setRenglones([]);
            } else if (resDetalle.ok) {
                const todos = await resDetalle.json();
                setRenglones(todos.filter((r) => r.cot_id === Number(id)));
            }

            if (data.ord_id) {
                const resOrden = await apiFetch(`/api/ordenes_servicio/${data.ord_id}`);
                if (resOrden.ok) {
                    const dataOrden = await resOrden.json();
                    setOrden(dataOrden);

                    const [resCliente, resEquipo, resCategoria] = await Promise.all([
                        dataOrden.cli_id ? apiFetch(`/api/clientes/${dataOrden.cli_id}`) : null,
                        dataOrden.equ_id ? apiFetch(`/api/equipos/${dataOrden.equ_id}`) : null,
                        dataOrden.cat_id ? apiFetch(`/api/categoriaServicio/${dataOrden.cat_id}`) : null,
                    ]);

                    if (resCliente?.ok) setCliente(await resCliente.json());
                    if (resCategoria?.ok) setCategoria(await resCategoria.json());

                    if (resEquipo?.ok) {
                        const dataEquipo = await resEquipo.json();
                        setEquipo(dataEquipo);
                        if (dataEquipo.mar_id) {
                            const resMarca = await apiFetch(`/api/marcas/${dataEquipo.mar_id}`);
                            if (resMarca.ok) setMarca(await resMarca.json());
                        }
                    }
                }
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarDatos();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setGuardado(false);
        setGuardando(true);

        try {
            const res = await apiFetch(`/api/cotizaciones/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ord_id: cotizacion.ord_id,
                    tec_id: Number(tecId),
                    cli_id: cotizacion.cli_id,
                    folio: cotizacion.folio,
                    estado,
                    total: cotizacion.total,
                    notas,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "No se pudo actualizar la cotización");

            setGuardado(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setGuardando(false);
        }
    };

    const handleAgregarRenglon = async (e) => {
        e.preventDefault();
        setError("");

        if ((!esManoObra && !invId) || !cantidadPieza || !precioUnitario) {
            setError("Completa artículo, cantidad y precio unitario");
            return;
        }
        if (esManoObra && !concepto) {
            setError("Describe en qué consistió la mano de obra");
            return;
        }

        setAgregando(true);
        try {
            const res = await apiFetch("/api/cotizacion_detalle", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    inv_id: esManoObra ? null : Number(invId),
                    cot_id: Number(id),
                    cantidad: Number(cantidadPieza),
                    precio_unitario: Number(precioUnitario),
                    es_mano_obra: esManoObra,
                    concepto: esManoObra ? concepto : null,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "No se pudo agregar el renglón");

            setInvId("");
            setCantidadPieza("");
            setPrecioUnitario("");
            setEsManoObra(false);
            setConcepto("");
            await cargarDatos();
        } catch (err) {
            setError(err.message);
        } finally {
            setAgregando(false);
        }
    };

    const handleEliminarRenglon = async (renglonId) => {
        if (!window.confirm("¿Quitar este renglón? Si era una pieza física, se regresa al stock del técnico.")) return;
        try {
            const res = await apiFetch(`/api/cotizacion_detalle/${renglonId}`, { method: "DELETE" });
            if (!res.ok) throw new Error("No se pudo eliminar el renglón");
            await cargarDatos();
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) return <p className="page">Cargando...</p>;

    return (
        <div className="page page-narrow">
            <h2>Editar Cotización: {cotizacion?.folio}</h2>

            {error && <p className="error-text">{error}</p>}
            {guardado && <p className="success-text">¡Cotización actualizada correctamente!</p>}

            {orden && (
                <div className="panel" style={{ marginBottom: "16px", fontSize: "14px", lineHeight: "1.6" }}>
                    <p><strong>Orden:</strong> {orden.folio}
                        {cliente && ` · ${cliente.nombre}`}
                        {cliente?.telefono && ` · ${cliente.telefono}`}
                    </p>
                    <p><strong>Equipo:</strong> {equipo ? `${equipo.tipo || "—"}${marca?.nombre ? ` ${marca.nombre}` : ""}${equipo.modelo ? ` ${equipo.modelo}` : ""}` : "Sin equipo asociado"}</p>
                    <p><strong>Servicio solicitado:</strong> {categoria?.nombre || `#${orden.cat_id}`}</p>
                    {orden.descripcion && <p><strong>Descripción:</strong> {orden.descripcion}</p>}
                </div>
            )}

            <form onSubmit={handleSubmit} className="form">
                <label>
                    <span>Estado</span>
                    <select value={estado} onChange={(e) => setEstado(e.target.value)}>
                        <option value="borrador">Borrador</option>
                        <option value="enviada">Enviada</option>
                        <option value="aprobada">Aprobada</option>
                        <option value="rechazada">Rechazada</option>
                    </select>
                </label>

                <label>
                    <span>Técnico responsable</span>
                    <select value={tecId} onChange={(e) => setTecId(e.target.value)}>
                        {tecnicos.map((tec) => (
                            <option key={tec.id} value={tec.id}>Técnico #{tec.usu_id}</option>
                        ))}
                    </select>
                </label>

                <label>
                    <span>Total (calculado automáticamente)</span>
                    <p style={{ fontWeight: "600", fontSize: "18px" }}>{formatoMoneda(cotizacion?.total || 0)}</p>
                </label>

                <label>
                    <span>Notas</span>
                    <textarea value={notas} onChange={(e) => setNotas(e.target.value)} />
                </label>

                <div className="form-actions">
                    <button type="submit" disabled={guardando} className="btn-primary">{guardando ? "Guardando..." : "Guardar cambios"}</button>
                    <button type="button" onClick={() => navigate("/cotizaciones")}>Volver</button>
                </div>
            </form>

            <hr style={{ margin: "24px 0" }} />

            <h3>Piezas y mano de obra</h3>

            {renglones.length === 0 ? (
                <p>Todavía no hay renglones agregados.</p>
            ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "16px" }}>
                    <thead>
                        <tr style={{ textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>
                            <th>Artículo / Concepto</th>
                            <th>Cantidad</th>
                            <th>Precio unit.</th>
                            <th>Subtotal</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {renglones.map((r) => {
                            const articulo = inventario.find((i) => i.id === r.inv_id);
                            return (
                                <tr key={r.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                    <td>{r.es_mano_obra ? (r.concepto || "Mano de obra") : (articulo?.nombre || `Artículo #${r.inv_id}`)}</td>
                                    <td>{r.cantidad}</td>
                                    <td>{formatoMoneda(r.precio_unitario)}</td>
                                    <td>{formatoMoneda(r.subtotal)}</td>
                                    <td>
                                        {esAdmin && (
                                            <button onClick={() => handleEliminarRenglon(r.id)} style={{ color: "red" }}>Quitar</button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}

            <form onSubmit={handleAgregarRenglon} className="form" style={{ maxWidth: "400px" }}>
                <p style={{ fontWeight: "600" }}>Agregar renglón</p>

                <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <input type="checkbox" checked={esManoObra} onChange={(e) => {
                        setEsManoObra(e.target.checked);
                        setInvId("");
                        setPrecioUnitario("");
                        setConcepto("");
                    }} />
                    <span>Es mano de obra (no descuenta stock de vehículo)</span>
                </label>

                {!esManoObra ? (
                    <label>
                        <span>Artículo</span>
                        <select value={invId} onChange={(e) => {
                            setInvId(e.target.value);
                            const seleccionado = inventario.find((i) => String(i.id) === e.target.value);
                            if (seleccionado) setPrecioUnitario(seleccionado.precio_venta);
                        }}>
                            <option value="">Selecciona un artículo</option>
                            {stockVehiculo.map((s) => {
                                const articulo = inventario.find((i) => i.id === s.inv_id);
                                return (
                                    <option key={s.inv_id} value={s.inv_id}>
                                        {articulo?.nombre || `Artículo #${s.inv_id}`} (disponible: {s.cantidad})
                                    </option>
                                );
                            })}
                        </select>
                        {stockVehiculo.length === 0 && (
                            <p style={{ color: "#b45309", fontSize: "13px" }}>
                                Este técnico no tiene ningún artículo en su vehículo todavía.
                            </p>
                        )}
                    </label>
                ) : (
                    <label>
                        <span>¿En qué consistió el trabajo? *</span>
                        <input
                            type="text"
                            placeholder="Ej. Instalación de capacitor, diagnóstico eléctrico..."
                            value={concepto}
                            onChange={(e) => setConcepto(e.target.value)}
                        />
                    </label>
                )}

                <label>
                    <span>Cantidad</span>
                    <input type="number" min="0.001" step="0.001" value={cantidadPieza} onChange={(e) => setCantidadPieza(e.target.value)} />
                </label>

                <label>
                    <span>Precio unitario</span>
                    <input type="number" min="0" step="0.01" value={precioUnitario} onChange={(e) => setPrecioUnitario(e.target.value)} />
                </label>

                <button type="submit" disabled={agregando} className="btn-primary">
                    {agregando ? "Agregando..." : "+ Agregar renglón"}
                </button>
            </form>
        </div>
    );
};

export default EditarCotizacion;