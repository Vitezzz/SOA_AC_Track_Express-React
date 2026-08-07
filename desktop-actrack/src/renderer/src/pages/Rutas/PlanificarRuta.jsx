import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useAuth } from "../../context/AuthContext";
import { calcularRutaOptima } from "../../utils/osrm";

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

// "YYYY-MM-DD" de hoy, para que el selector de fecha de la ruta ya
// empiece en el día correcto.
const fechaHoy = () => new Date().toISOString().slice(0, 10);

// Le suma "segundos" a una hora "HH:MM" y regresa "HH:MM:SS", para calcular
// la hora estimada de llegada a cada parada acumulando las duraciones de
// los tramos que regresa OSRM.
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
    const [ordenes, setOrdenes] = useState([]);
    const [clientes, setClientes] = useState([]);

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

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const [resTecnicos, resOrdenes, resClientes] = await Promise.all([
                    apiFetch("/api/tecnicos/todos"),
                    apiFetch("/api/ordenes_servicio"),
                    apiFetch("/api/clientes/"),
                ]);

                if (resTecnicos.status !== 404 && resTecnicos.ok) setTecnicos(await resTecnicos.json());
                if (resOrdenes.ok) setOrdenes(await resOrdenes.json());
                if (resClientes.ok) setClientes(await resClientes.json());
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        cargarDatos();
    }, []);

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
            o.fecha_programada.slice(0, 10) === fechaRuta
    );

    const toggleOrden = (ordenId) => {
        setOrdenesSeleccionadas((prev) =>
            prev.includes(ordenId) ? prev.filter((id) => id !== ordenId) : [...prev, ordenId]
        );
    };

    const handleCalcular = async () => {
        setError("");
        setRuta(null);
        setRutaGuardada(false);

        if (ordenesSeleccionadas.length < 1) {
            setError("Selecciona al menos una parada");
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
            setError(`Estos clientes no tienen ubicación guardada todavía: ${nombres}. Deben actualizar su dirección desde el mapa en su perfil.`);
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
        } catch (err) {
            setError(err.message);
        } finally {
            setCalculando(false);
        }
    };

    // Guarda la ruta ya calculada en RUTAS/RUTA_PARADAS -- sin esto, Móvil
    // no tiene de dónde leer "Mi Agenda del Día" del técnico.
    const handleGuardarRuta = async () => {
        setError("");
        setGuardando(true);
        try {
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
            const nuevaRuta = await resRuta.json();

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
                    ord_id: parada.orden.id,
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
                        ord_id: parada.ord_id,
                        posicion: parada.posicion,
                        hora_estimada: parada.hora_estimada,
                        estado: "pendiente",
                    }),
                });
                if (!resParada.ok) throw new Error((await resParada.json()).message || "No se pudo guardar una parada");
            }

            setRutaGuardada(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setGuardando(false);
        }
    };

    if (loading) return <p style={{ padding: "24px" }}>Cargando...</p>;

    return (
        <div style={{ padding: "24px" }}>
            <Link to="/home">← Inicio</Link>
            <h2>Planificación de Rutas</h2>

            {error && <p style={{ color: "red" }}>{error}</p>}

            <div style={{ display: "flex", gap: "24px", marginBottom: "12px" }}>
                <label style={{ display: "block" }}>
                    <span style={{ display: "block", marginBottom: "4px" }}>Técnico</span>
                    <select value={tecId} onChange={(e) => { setTecId(e.target.value); setOrdenesSeleccionadas([]); setRuta(null); }}>
                        <option value="">Selecciona un técnico</option>
                        {tecnicos.map((tec) => (
                            <option key={tec.id} value={tec.id}>{tec.nombre || `Técnico #${tec.usu_id}`}</option>
                        ))}
                    </select>
                </label>

                <label style={{ display: "block" }}>
                    <span style={{ display: "block", marginBottom: "4px" }}>Fecha de la ruta</span>
                    <input
                        type="date"
                        value={fechaRuta}
                        onChange={(e) => { setFechaRuta(e.target.value); setOrdenesSeleccionadas([]); setRuta(null); }}
                    />
                </label>
            </div>

            {tecId && (
                <div style={{ marginBottom: "16px" }}>
                    <p style={{ fontWeight: "600", marginBottom: "8px" }}>
                        Selecciona las paradas del {new Date(`${fechaRuta}T00:00:00`).toLocaleDateString("es-MX")}:
                    </p>
                    {ordenesDelTecnico.length === 0 ? (
                        <p style={{ color: "#9ca3af" }}>Este técnico no tiene órdenes programadas para ese día.</p>
                    ) : (
                        ordenesDelTecnico.map((orden) => {
                            const cliente = clientes.find((c) => c.id === orden.cli_id);
                            const tieneCoordenadas = cliente?.latitud && cliente?.longitud;
                            return (
                                <label key={orden.id} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                                    <input
                                        type="checkbox"
                                        checked={ordenesSeleccionadas.includes(orden.id)}
                                        onChange={() => toggleOrden(orden.id)}
                                    />
                                    <span>
                                        {orden.folio} — {cliente?.nombre || `Cliente #${orden.cli_id}`}
                                        {!tieneCoordenadas && (
                                            <span style={{ color: "#b45309", fontSize: "12px" }}> (sin ubicación guardada)</span>
                                        )}
                                    </span>
                                </label>
                            );
                        })
                    )}

                    <button onClick={handleCalcular} disabled={calculando} style={{ marginTop: "12px" }}>
                        {calculando ? "Calculando..." : "Calcular ruta óptima"}
                    </button>
                </div>
            )}

            {ruta && (
                <>
                    <p>Distancia total: <strong>{ruta.distanciaKm} km</strong> — Tiempo estimado: <strong>{ruta.duracionMinutos} min</strong></p>

                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                        <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span>Hora de salida</span>
                            <input
                                type="time"
                                value={horaSalida}
                                onChange={(e) => { setHoraSalida(e.target.value); setRutaGuardada(false); }}
                            />
                        </label>
                        <button onClick={handleGuardarRuta} disabled={guardando}>
                            {guardando ? "Guardando..." : "Guardar ruta"}
                        </button>
                        {rutaGuardada && <span style={{ color: "#15803d" }}>Ruta guardada ✓</span>}
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
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    </div>
                </>
            )}
        </div>
    );
};

export default PlanificarRuta;