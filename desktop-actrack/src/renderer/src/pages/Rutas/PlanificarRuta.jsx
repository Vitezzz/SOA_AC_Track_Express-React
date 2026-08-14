import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useAuth } from "../../context/AuthContext";
import { calcularRutaOptima } from "../../utils/osrm";
import Icon from "../../components/Icon";
import Toast from "../../components/Toast";

import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const iconoParada = L.icon({
    iconUrl,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

// Ubicación fija de la oficina/base -- de aquí "sale" el técnico en esta
// planeación (no es su GPS en vivo, eso vive aparte en Mapa en Vivo).
const UBICACION_BASE = { lat: 17.9895, lng: -92.9475 };

// "HH:MM" de ahorita, para que el input de hora de salida ya empiece con
// algo razonable en vez de vacío.
const horaActual = () => {
    const ahora = new Date();
    return `${String(ahora.getHours()).padStart(2, "0")}:${String(ahora.getMinutes()).padStart(2, "0")}`;
};

// "YYYY-MM-DD" en hora LOCAL (no UTC) -- toISOString().slice(0,10) se
// mueve al día siguiente en cuanto la hora local pasa de las 6pm (somos
// UTC-6), y ahí una orden agendada "hoy" a las 11pm deja de verse como
// de hoy. Se usa tanto para la fecha por defecto del selector como para
// convertir fecha_programada antes de comparar.
const aFechaLocal = (fecha) => {
    const d = new Date(fecha);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const fechaHoy = () => aFechaLocal(new Date());

// Le suma "segundos" a una hora "HH:MM" y regresa "HH:MM:SS", para calcular
// la hora estimada de llegada a cada parada acumulando las duraciones de
// los tramos que regresa OSRM.
// La duración estimada del SERVICIO en sí (la que el admin le puso a la
// orden al crearla/asignarla) -- no confundir con la duración del
// TRASLADO que calcula OSRM entre paradas, son dos cosas distintas.
const textoDuracion = (horas) => {
    if (horas == null || horas === "") return null;
    const h = Number(horas);
    if (!Number.isFinite(h)) return null;
    return `${h}h`;
};

const sumarSegundos = (horaHHMM, segundos) => {
    const [h, m] = horaHHMM.split(":").map(Number);
    const base = new Date(2000, 0, 1, h, m, 0);
    base.setSeconds(base.getSeconds() + segundos);
    const pad = (n) => String(n).padStart(2, "0");
    return `${pad(base.getHours())}:${pad(base.getMinutes())}:${pad(base.getSeconds())}`;
};

const PlanificarRuta = () => {
    const { apiFetch } = useAuth();

    const [tecnicos, setTecnicos] = useState([]);
    const [especialidades, setEspecialidades] = useState([]);
    const [ordenes, setOrdenes] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [rutasExistentes, setRutasExistentes] = useState([]);

    const [tecId, setTecId] = useState("");
    const [fechaRuta, setFechaRuta] = useState(fechaHoy());
    const [ordenesSeleccionadas, setOrdenesSeleccionadas] = useState([]);
    const [ruta, setRuta] = useState(null);
    const [horaSalida, setHoraSalida] = useState(horaActual());

    const [loading, setLoading] = useState(true);
    const [calculando, setCalculando] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [rutaGuardada, setRutaGuardada] = useState(false);
    const [error, setError] = useState("");
    const [toast, setToast] = useState(null);

    // Antes el único aviso era el texto rojo hasta arriba de la página --
    // en esta pantalla, para cuando calculas o guardas la ruta ya estás
    // scrolleado hasta abajo, viendo el mapa, y ese texto queda fuera de
    // vista por completo. El toast flota fijo, así que se ve siempre.
    const mostrarError = (mensaje) => {
        setError(mensaje);
        setToast({ tipo: "error", mensaje });
    };
    const mostrarExito = (mensaje) => setToast({ tipo: "success", mensaje });

    // Lo que YA está guardado para este técnico/día -- antes esta pantalla
    // no lo mostraba en ningún lado, así que reasignar rutas era ir a
    // ciegas: no había forma de ver qué había quedado guardado antes sin
    // adivinar. Se recarga cada que cambias de técnico o de día.
    const [paradasGuardadas, setParadasGuardadas] = useState([]);
    const [cargandoGuardada, setCargandoGuardada] = useState(false);

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const [resTecnicos, resOrdenes, resClientes, resRutas, resEsp] = await Promise.all([
                    apiFetch("/api/tecnicos/todos"),
                    apiFetch("/api/ordenes_servicio"),
                    apiFetch("/api/clientes/"),
                    apiFetch("/api/rutas"),
                    apiFetch("/api/especialidad"),
                ]);

                if (resTecnicos.status !== 404 && resTecnicos.ok) setTecnicos(await resTecnicos.json());
                if (resOrdenes.ok) setOrdenes(await resOrdenes.json());
                if (resClientes.ok) setClientes(await resClientes.json());
                if (resRutas.status !== 400 && resRutas.status !== 404 && resRutas.ok) setRutasExistentes(await resRutas.json());
                if (resEsp.ok) setEspecialidades(await resEsp.json());
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        cargarDatos();
    }, []);

    useEffect(() => {
        const cargarRutaGuardada = async () => {
            setParadasGuardadas([]);
            if (!tecId) return;

            const rutaExistente = rutasExistentes.find(
                (r) => r.tecnico_id === Number(tecId) && aFechaLocal(r.fecha_ruta) === fechaRuta
            );
            if (!rutaExistente) {
                setOrdenesSeleccionadas([]);
                return;
            }

            setCargandoGuardada(true);
            try {
                const res = await apiFetch(`/api/ruta_paradas/ruta/${rutaExistente.id}`);
                if (res.ok) {
                    const paradas = await res.json();
                    const hidratadas = paradas
                        .map((p) => {
                            const orden = ordenes.find((o) => o.id === p.ord_id);
                            const cliente = clientes.find((c) => c.id === orden?.cli_id);
                            return { ...p, orden, cliente };
                        })
                        .sort((a, b) => a.posicion - b.posicion);
                    setParadasGuardadas(hidratadas);
                    // Ya vienen marcadas las que ya estaban -- si el admin nomás
                    // quiere agregar una parada nueva, no tiene que volver a
                    // marcar todas las de siempre.
                    setOrdenesSeleccionadas(hidratadas.map((p) => p.ord_id));
                }
            } finally {
                setCargandoGuardada(false);
            }
        };
        cargarRutaGuardada();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tecId, fechaRuta, rutasExistentes]);

    const especialidadesPorId = new Map(especialidades.map((e) => [e.id, e]));

    // Solo se planifican paradas del día elegido -- si se mezclaran órdenes
    // de otras fechas, "hora_estimada" y la hora de salida dejarían de tener
    // sentido. Si durante el día entran órdenes nuevas para hoy, se vuelve
    // a esta pantalla y se recalcula/reguarda la ruta.
    const ordenesDelTecnico = ordenes.filter(
        (o) =>
            o.tec_id === Number(tecId) &&
            o.estatus !== "cancelada" &&
            o.estatus !== "completada" &&
            o.estatus !== "pagada" &&
            o.fecha_programada &&
            aFechaLocal(o.fecha_programada) === fechaRuta
    );

    const toggleOrden = (ordenId) => {
        setOrdenesSeleccionadas((prev) =>
            prev.includes(ordenId) ? prev.filter((id) => id !== ordenId) : [...prev, ordenId]
        );
    };

    const handleCalcular = async () => {
        setError("");
        setToast(null);
        setRuta(null);
        setRutaGuardada(false);

        if (ordenesSeleccionadas.length < 1) {
            mostrarError("Selecciona al menos una parada");
            return;
        }

        // Cruzamos cada orden elegida con su cliente, para sacar sus
        // coordenadas REALES (las que capturamos con el mapa+pin en
        // "Completar Perfil"/"Registro").
        const paradasConCoordenadas = ordenesSeleccionadas.map((ordId) => {
            const orden = ordenes.find((o) => o.id === ordId);
            const cliente = clientes.find((c) => c.id === orden?.cli_id);
            return { orden, cliente };
        });

        // Si algún cliente todavía no tiene coordenadas guardadas (por
        // ejemplo, se registró antes de que existiera el mapa), no podemos
        // calcular su parada -- se lo decimos claro, en vez de adivinar.
        const sinCoordenadas = paradasConCoordenadas.filter(
            (p) => !p.cliente?.latitud || !p.cliente?.longitud
        );
        if (sinCoordenadas.length > 0) {
            const nombres = sinCoordenadas.map((p) => p.cliente?.nombre || "Cliente desconocido").join(", ");
            mostrarError(`Estos clientes no tienen ubicación guardada todavía: ${nombres}. Deben actualizar su dirección desde el mapa en su perfil.`);
            return;
        }

        setCalculando(true);
        try {
            const puntos = [
                UBICACION_BASE,
                ...paradasConCoordenadas.map((p) => ({
                    lat: Number(p.cliente.latitud),
                    lng: Number(p.cliente.longitud),
                })),
            ];

            const resultado = await calcularRutaOptima(puntos);
            setRuta({ ...resultado, puntos, paradasConCoordenadas });
            mostrarExito(`Ruta calculada: ${resultado.distanciaKm} km, ${paradasConCoordenadas.length} ${paradasConCoordenadas.length === 1 ? "parada" : "paradas"}. Revísala abajo y guárdala.`);
        } catch (err) {
            mostrarError(err.message);
        } finally {
            setCalculando(false);
        }
    };

    // Guarda la ruta ya calculada en RUTAS/RUTA_PARADAS -- sin esto, Móvil
    // no tiene de dónde leer "Mi Agenda del Día" del técnico.
    const handleGuardarRuta = async () => {
        setError("");
        setToast(null);
        setGuardando(true);
        try {
            // Antes esto creaba una ruta NUEVA cada vez que se le daba a
            // "Guardar ruta", aunque ya hubiera una para este técnico/día --
            // terminaban paradas repartidas entre varias rutas duplicadas
            // para el mismo día. Si ya existe, se reusa (y se limpian sus
            // paradas viejas antes de guardar las nuevas, por si el orden o
            // las paradas elegidas cambiaron).
            const rutaExistente = rutasExistentes.find(
                (r) => r.tecnico_id === Number(tecId) && aFechaLocal(r.fecha_ruta) === fechaRuta
            );

            let nuevaRuta;
            if (rutaExistente) {
                nuevaRuta = rutaExistente;
                const resParadasViejas = await apiFetch(`/api/ruta_paradas/ruta/${rutaExistente.id}`);
                if (resParadasViejas.ok) {
                    const paradasViejas = await resParadasViejas.json();
                    for (const vieja of paradasViejas) {
                        const resDelete = await apiFetch(`/api/ruta_paradas/${vieja.id}`, { method: "DELETE" });
                        if (!resDelete.ok) throw new Error((await resDelete.json()).message || "No se pudo limpiar una parada anterior");
                    }
                }
            } else {
                const resRuta = await apiFetch("/api/rutas", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        fecha_ruta: fechaRuta,
                        tecnico_id: Number(tecId),
                        estado: "pendiente",
                    }),
                });
                if (!resRuta.ok) throw new Error((await resRuta.json()).message || "No se pudo crear la ruta");
                nuevaRuta = await resRuta.json();
                setRutasExistentes((prev) => [...prev, nuevaRuta]);
            }

            // ordenParadas[0] es siempre la base (source=first); a partir de
            // ahí cada entrada es una parada real, en el orden en que OSRM
            // decidió visitarlas. Los tramos (legs) van pegados a ese mismo
            // orden: legs[i-1] es el tramo que termina en la parada i.
            const paradasAGuardar = ruta.ordenParadas.slice(1).map((p, i) => {
                const parada = ruta.paradasConCoordenadas[p.indiceOriginal - 1];
                const segundosAcumulados = ruta.duracionesTramos
                    .slice(0, i + 1)
                    .reduce((suma, s) => suma + s, 0);
                return {
                    orden: parada.orden,
                    posicion: i + 1,
                    hora_estimada: sumarSegundos(horaSalida, segundosAcumulados),
                };
            });

            for (const parada of paradasAGuardar) {
                const resParada = await apiFetch("/api/ruta_paradas", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        rut_id: nuevaRuta.id,
                        ord_id: parada.orden.id,
                        posicion: parada.posicion,
                        hora_estimada: parada.hora_estimada,
                        estado: "pendiente",
                    }),
                });
                if (!resParada.ok) throw new Error((await resParada.json()).message || "No se pudo guardar una parada");

                // Sin esto, la orden se queda con la hora con la que se
                // creó aunque OSRM haya decidido otra al optimizar -- la
                // ruta y "Gestión de Órdenes" terminaban mostrando horas
                // distintas para lo mismo. Se resendea la orden completa
                // (full-replace) cambiando solo fecha_programada.
                const o = parada.orden;
                const resOrden = await apiFetch(`/api/ordenes_servicio/${o.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        cli_id: o.cli_id, equ_id: o.equ_id, cat_id: o.cat_id, pri_id: o.pri_id,
                        folio: o.folio, prioridad: o.prioridad, estatus: o.estatus,
                        descripcion: o.descripcion, fecha_cierre: o.fecha_cierre,
                        tec_id: o.tec_id, duracion_estimada_horas: o.duracion_estimada_horas,
                        fecha_programada: `${fechaRuta}T${parada.hora_estimada}`,
                    }),
                });
                if (!resOrden.ok) throw new Error((await resOrden.json()).message || "No se pudo actualizar la hora de la orden");
            }

            setRutaGuardada(true);
            mostrarExito("Ruta guardada -- el técnico ya la puede ver en su Agenda del celular.");
        } catch (err) {
            mostrarError(err.message);
        } finally {
            setGuardando(false);
        }
    };

    if (loading) return <p className="page">Cargando...</p>;

    return (
        <div className="page">
            <Toast tipo={toast?.tipo} mensaje={toast?.mensaje} onCerrar={() => setToast(null)} />
            <Link to="/home" className="page-back">← Inicio</Link>
            <div className="page-header">
                <div>
                    <h2>Planificación de Rutas</h2>
                    <p className="muted-text" style={{ marginTop: "0.25rem" }}>
                        Arma el orden de visitas de un técnico para un día y calcula la ruta más corta entre paradas.
                        Al guardar, el técnico la ve de una vez en su Agenda del celular.
                    </p>
                </div>
            </div>

            {error && <p className="error-text">{error}</p>}

            <div className="panel" style={{ marginBottom: "1.25rem" }}>
                <p style={{ fontWeight: 600, marginBottom: "0.9rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Icon name="users" className="icon-sm" /> 1. Elige técnico y día
                </p>
                <div className="form form-inline" style={{ marginBottom: 0 }}>
                    <label>
                        <span>Técnico</span>
                        <select value={tecId} onChange={(e) => { setTecId(e.target.value); setRuta(null); }}>
                            <option value="">Selecciona un técnico</option>
                            {tecnicos.map((tec) => (
                                <option key={tec.id} value={tec.id}>
                                    {tec.nombre || `Técnico #${tec.usu_id}`}
                                    {especialidadesPorId.get(tec.esp_id) ? ` — ${especialidadesPorId.get(tec.esp_id).nombre}` : ""}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label>
                        <span>Fecha de la ruta</span>
                        <input
                            type="date"
                            value={fechaRuta}
                            onChange={(e) => { setFechaRuta(e.target.value); setRuta(null); }}
                        />
                    </label>
                </div>
            </div>

            {!tecId ? (
                <div className="panel empty-state">
                    <div className="empty-state-icon"><Icon name="route" /></div>
                    <p className="empty-state-title">Todavía no hay nada que planear</p>
                    <p className="empty-state-description">
                        Elige un técnico arriba para ver sus órdenes programadas de ese día y armar su ruta.
                    </p>
                </div>
            ) : cargandoGuardada ? (
                <p className="muted-text" style={{ marginBottom: "1.25rem" }}>Buscando si ya hay una ruta guardada...</p>
            ) : (
                <>
                    {paradasGuardadas.length > 0 && (
                        <div className="panel" style={{ marginBottom: "1.25rem", borderLeft: "3px solid var(--color-accent)" }}>
                            <p style={{ fontWeight: 600, marginBottom: "0.9rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <Icon name="check" className="icon-sm" /> Ya hay una ruta guardada para este día
                            </p>
                            <p className="muted-text" style={{ marginBottom: "0.9rem" }}>
                                Este es el orden con el que se guardó la última vez. Ya viene marcada abajo -- si solo agregas o quitas una parada y vuelves a calcular, se sobreescribe.
                            </p>
                            <ol style={{ margin: 0, paddingLeft: "1.25rem", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                                {paradasGuardadas.map((p) => (
                                    <li key={p.id}>
                                        <strong>{p.orden?.folio || `Orden #${p.ord_id}`}</strong>
                                        {p.cliente?.nombre ? ` — ${p.cliente.nombre}` : ""}
                                        {p.hora_estimada && <span className="muted-text"> · {p.hora_estimada.slice(0, 5)}</span>}
                                        {textoDuracion(p.orden?.duracion_estimada_horas) && (
                                            <span className="muted-text"> · dura {textoDuracion(p.orden.duracion_estimada_horas)}</span>
                                        )}
                                    </li>
                                ))}
                            </ol>

                            {(() => {
                                const conCoordenadas = paradasGuardadas.filter((p) => p.cliente?.latitud && p.cliente?.longitud);
                                if (conCoordenadas.length === 0) return null;
                                return (
                                    <>
                                        <div style={{ height: "220px", borderRadius: "8px", overflow: "hidden", marginTop: "1rem" }}>
                                            <MapContainer
                                                center={[UBICACION_BASE.lat, UBICACION_BASE.lng]}
                                                zoom={12}
                                                style={{ height: "100%", width: "100%" }}
                                                scrollWheelZoom={false}
                                            >
                                                <TileLayer
                                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                />
                                                <Polyline
                                                    positions={[
                                                        [UBICACION_BASE.lat, UBICACION_BASE.lng],
                                                        ...conCoordenadas.map((p) => [Number(p.cliente.latitud), Number(p.cliente.longitud)]),
                                                    ]}
                                                    color="#9ca3af"
                                                    weight={3}
                                                    dashArray="6 6"
                                                />
                                                <Marker position={[UBICACION_BASE.lat, UBICACION_BASE.lng]} icon={iconoParada}>
                                                    <Popup>Punto de partida (oficina)</Popup>
                                                </Marker>
                                                {conCoordenadas.map((p, i) => (
                                                    <Marker
                                                        key={p.id}
                                                        position={[Number(p.cliente.latitud), Number(p.cliente.longitud)]}
                                                        icon={iconoParada}
                                                    >
                                                        <Popup>
                                                            Parada {i + 1}: {p.orden?.folio}<br />
                                                            {p.cliente.nombre}
                                                            {textoDuracion(p.orden?.duracion_estimada_horas) && (
                                                                <><br />Dura {textoDuracion(p.orden.duracion_estimada_horas)}</>
                                                            )}
                                                        </Popup>
                                                    </Marker>
                                                ))}
                                            </MapContainer>
                                        </div>
                                        <p className="hint-text" style={{ marginTop: "0.5rem" }}>
                                            Vista previa con líneas rectas entre paradas -- para la ruta real por calles dale "Calcular ruta óptima".
                                        </p>
                                    </>
                                );
                            })()}
                        </div>
                    )}
                <div className="panel" style={{ marginBottom: "1.25rem" }}>
                    <p style={{ fontWeight: 600, marginBottom: "0.9rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <Icon name="calendar" className="icon-sm" /> 2. Selecciona las paradas del {new Date(`${fechaRuta}T00:00:00`).toLocaleDateString("es-MX")}
                    </p>
                    {ordenesDelTecnico.length === 0 ? (
                        <p className="muted-text">Este técnico no tiene órdenes programadas para ese día.</p>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginBottom: "1rem" }}>
                            {ordenesDelTecnico.map((orden) => {
                                const cliente = clientes.find((c) => c.id === orden.cli_id);
                                const tieneCoordenadas = cliente?.latitud && cliente?.longitud;
                                const seleccionada = ordenesSeleccionadas.includes(orden.id);
                                return (
                                    <label
                                        key={orden.id}
                                        style={{
                                            display: "flex", alignItems: "center", gap: "0.6rem",
                                            padding: "0.6rem 0.75rem", borderRadius: "var(--radius-sm)",
                                            border: "1px solid var(--color-border)",
                                            background: seleccionada ? "var(--color-accent-soft)" : "transparent",
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={seleccionada}
                                            onChange={() => toggleOrden(orden.id)}
                                        />
                                        <span>
                                            <strong>{orden.folio}</strong> — {cliente?.nombre || `Cliente #${orden.cli_id}`}
                                            {orden.fecha_programada && (
                                                <span className="muted-text"> · {orden.fecha_programada.slice(11, 16)}</span>
                                            )}
                                            {textoDuracion(orden.duracion_estimada_horas) && (
                                                <span className="muted-text"> · dura {textoDuracion(orden.duracion_estimada_horas)}</span>
                                            )}
                                            {!tieneCoordenadas && (
                                                <span className="badge badge-warning" style={{ marginLeft: "0.5rem" }}>Sin ubicación guardada</span>
                                            )}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                    )}

                    <button onClick={handleCalcular} disabled={calculando || ordenesDelTecnico.length === 0} className="btn-primary">
                        {calculando ? "Calculando..." : "Calcular ruta óptima"}
                    </button>
                </div>
                </>
            )}

            {ruta && (
                <div className="panel">
                    <p style={{ fontWeight: 600, marginBottom: "0.9rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <Icon name="map" className="icon-sm" /> 3. Revisa la ruta y guárdala
                    </p>

                    <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem" }}>
                        <span className="badge badge-info">{ruta.distanciaKm} km</span>
                        <span className="badge badge-info">{ruta.duracionMinutos} min de traslado</span>
                        <span className="badge badge-neutral">{ruta.paradasConCoordenadas.length} paradas</span>
                        {(() => {
                            const totalHoras = ruta.paradasConCoordenadas.reduce(
                                (suma, p) => suma + (Number(p.orden.duracion_estimada_horas) || 0), 0
                            );
                            if (totalHoras <= 0) return null;
                            return <span className="badge badge-purple">{totalHoras}h de servicio (sin contar traslado)</span>;
                        })()}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                        <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span>Hora de salida</span>
                            <input
                                type="time"
                                value={horaSalida}
                                onChange={(e) => { setHoraSalida(e.target.value); setRutaGuardada(false); }}
                            />
                        </label>
                        <button onClick={handleGuardarRuta} disabled={guardando} className="btn-primary">
                            {guardando ? "Guardando..." : "Guardar ruta"}
                        </button>
                        {rutaGuardada && (
                            <span style={{ color: "#15803d", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                <Icon name="check" className="icon-sm" /> Ruta guardada
                            </span>
                        )}
                    </div>

                    <div style={{ height: "500px", borderRadius: "8px", overflow: "hidden" }}>
                        <MapContainer center={[UBICACION_BASE.lat, UBICACION_BASE.lng]} zoom={13} style={{ height: "100%", width: "100%" }}>
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <Polyline positions={ruta.coordenadasRuta} color="#111827" weight={4} />

                            <Marker position={[UBICACION_BASE.lat, UBICACION_BASE.lng]} icon={iconoParada}>
                                <Popup>Punto de partida (oficina)</Popup>
                            </Marker>

                            {ruta.paradasConCoordenadas.map((p, i) => (
                                <Marker key={p.orden.id} position={[Number(p.cliente.latitud), Number(p.cliente.longitud)]} icon={iconoParada}>
                                    <Popup>
                                        Parada {i + 1}: {p.orden.folio}<br />
                                        {p.cliente.nombre}
                                        {textoDuracion(p.orden.duracion_estimada_horas) && (
                                            <><br />Dura {textoDuracion(p.orden.duracion_estimada_horas)}</>
                                        )}
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlanificarRuta;