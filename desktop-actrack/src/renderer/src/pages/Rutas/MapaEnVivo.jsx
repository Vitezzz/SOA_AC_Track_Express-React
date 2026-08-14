import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { io } from "socket.io-client";
import "leaflet/dist/leaflet.css";
import { useAuth } from "../../context/AuthContext";
import Icon from "../../components/Icon";

// Un color fijo por técnico (por tec_id) en vez del pin de Leaflet -- así
// se distinguen de un vistazo entre varios puntos en el mapa.
const COLORES = ["#2563eb", "#16a34a", "#f59e0b", "#dc2626", "#7c3aed", "#0891b2", "#db2777"];
const colorPorTecnico = (tecId) => COLORES[tecId % COLORES.length];

const MapaEnVivo = () => {
    const { apiFetch } = useAuth();

    // Guardamos la última posición conocida de CADA técnico, por su tec_id
    const [posiciones, setPosiciones] = useState({});
    const [tecnicos, setTecnicos] = useState([]);
    const [especialidades, setEspecialidades] = useState([]);
    // Dirección legible por tec_id, resuelta una vez (no en vivo, por
    // técnico -- no hace falta pedirla de nuevo a menos que recargues).
    const [direcciones, setDirecciones] = useState({});

    useEffect(() => {
        const cargarTecnicos = async () => {
            const [resTec, resEsp] = await Promise.all([
                apiFetch("/api/tecnicos/todos"),
                apiFetch("/api/especialidad"),
            ]);
            if (resTec.status !== 404 && resTec.ok) setTecnicos(await resTec.json());
            if (resEsp.ok) setEspecialidades(await resEsp.json());
        };
        cargarTecnicos();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        // Nos conectamos al mismo servidor de WebSockets que ya construimos
        const socket = io("http://localhost:3000");

        socket.on("connect", () => {
            console.log("Desktop conectado al mapa en vivo:", socket.id);
        });

        // Cada vez que llega una posición nueva, actualizamos SOLO la
        // entrada de ese técnico específico -- los demás se quedan igual.
        socket.on("ubicacion_tecnico", (data) => {
            setPosiciones((prev) => ({
                ...prev,
                [data.tec_id]: data,
            }));
        });

        // Cuando el componente se "desmonta" (sales de esta pantalla),
        // cerramos la conexión -- si no, se quedaría abierta para siempre.
        return () => {
            socket.disconnect();
        };
    }, []);

    // Convierte lat/lng a una dirección legible (OpenStreetMap Nominatim).
    // Solo se pide una vez por técnico -- si quieres la dirección
    // actualizada tras un cambio de posición, hay que recargar la pantalla.
    useEffect(() => {
        Object.values(posiciones).forEach((pos) => {
            if (direcciones[pos.tec_id]) return;
            setDirecciones((prev) => ({ ...prev, [pos.tec_id]: "Buscando dirección..." }));
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.lat}&lon=${pos.lng}`)
                .then((res) => res.json())
                .then((data) => {
                    setDirecciones((prev) => ({ ...prev, [pos.tec_id]: data?.display_name || "Dirección no disponible" }));
                })
                .catch(() => {
                    setDirecciones((prev) => ({ ...prev, [pos.tec_id]: "Dirección no disponible" }));
                });
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [posiciones]);

    const especialidadesPorId = new Map(especialidades.map((e) => [e.id, e]));
    const especialidadDeTecnico = (tecId) => {
        const tecnico = tecnicos.find((t) => t.id === tecId);
        return especialidadesPorId.get(tecnico?.esp_id)?.nombre || null;
    };

    // Centro inicial del mapa: Villahermosa, Tabasco
    const centroInicial = [17.9895, -92.9475];

    return (
        <div className="page">
            <Link to="/home" className="page-back">← Inicio</Link>
            <div className="page-header">
                <div>
                    <h2>Mapa en Vivo de Técnicos</h2>
                    <p className="muted-text" style={{ marginTop: "0.25rem" }}>
                        Posición más reciente de cada técnico conectado, en tiempo real.
                    </p>
                </div>
            </div>

            <div className="panel" style={{ padding: 0, overflow: "hidden", marginBottom: "1.25rem" }}>
              <div style={{ height: "500px" }}>
                <MapContainer center={centroInicial} zoom={13} style={{ height: "100%", width: "100%" }}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {Object.values(posiciones).map((pos) => {
                        const tecnico = tecnicos.find((t) => t.id === pos.tec_id);
                        return (
                            <CircleMarker
                                key={pos.tec_id}
                                center={[pos.lat, pos.lng]}
                                radius={10}
                                pathOptions={{
                                    color: "#fff",
                                    weight: 2,
                                    fillColor: colorPorTecnico(pos.tec_id),
                                    fillOpacity: 1,
                                }}
                            >
                                <Popup>
                                    {tecnico?.nombre || `Técnico #${pos.tec_id}`}
                                    {especialidadDeTecnico(pos.tec_id) && ` — ${especialidadDeTecnico(pos.tec_id)}`}
                                    <br />
                                    Última actualización: {new Date(pos.timestamp).toLocaleTimeString("es-MX")}
                                </Popup>
                            </CircleMarker>
                        );
                    })}
                </MapContainer>
              </div>
            </div>

            {Object.keys(posiciones).length === 0 ? (
                <div className="panel empty-state">
                    <div className="empty-state-icon"><Icon name="map" /></div>
                    <p className="empty-state-title">Esperando técnicos</p>
                    <p className="empty-state-description">
                        En cuanto algún técnico empiece a transmitir su ubicación, va a aparecer aquí.
                    </p>
                </div>
            ) : (
                <div>
                    <p style={{ fontWeight: 600, marginBottom: "0.75rem" }}>Técnicos en el mapa</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {Object.values(posiciones).map((pos) => {
                            const tecnico = tecnicos.find((t) => t.id === pos.tec_id);
                            return (
                                <div
                                    key={pos.tec_id}
                                    style={{
                                        display: "flex",
                                        alignItems: "flex-start",
                                        gap: "10px",
                                        padding: "10px 12px",
                                        border: "1px solid #e5e7eb",
                                        borderRadius: "8px",
                                    }}
                                >
                                    <span
                                        style={{
                                            width: "12px",
                                            height: "12px",
                                            borderRadius: "999px",
                                            background: colorPorTecnico(pos.tec_id),
                                            marginTop: "3px",
                                            flexShrink: 0,
                                        }}
                                    />
                                    <div>
                                        <div style={{ fontWeight: 600 }}>
                                            {tecnico?.nombre || `Técnico #${pos.tec_id}`}
                                            {especialidadDeTecnico(pos.tec_id) && (
                                                <span style={{ fontWeight: 400, color: "#6b7280" }}> · {especialidadDeTecnico(pos.tec_id)}</span>
                                            )}
                                        </div>
                                        <div style={{ fontSize: "0.85rem", color: "#4b5563" }}>
                                            {direcciones[pos.tec_id] || "Buscando dirección..."}
                                        </div>
                                        <div style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "2px" }}>
                                            Última actualización: {new Date(pos.timestamp).toLocaleTimeString("es-MX")}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MapaEnVivo;