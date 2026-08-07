import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { io } from "socket.io-client";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Leaflet, por un bug conocido con bundlers como Vite, no encuentra solo
// sus iconos por default -- se los indicamos manualmente.
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const iconoTecnico = L.icon({
    iconUrl,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

const MapaEnVivo = () => {
    // Guardamos la última posición conocida de CADA técnico, por su tec_id
    const [posiciones, setPosiciones] = useState({});

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

    // Centro inicial del mapa: Villahermosa, Tabasco
    const centroInicial = [17.9895, -92.9475];

    return (
        <div style={{ padding: "24px" }}>
            <Link to="/home">← Inicio</Link>
            <h2>Mapa en Vivo de Técnicos</h2>

            <div style={{ height: "500px", borderRadius: "8px", overflow: "hidden", marginTop: "16px" }}>
                <MapContainer center={centroInicial} zoom={13} style={{ height: "100%", width: "100%" }}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {Object.values(posiciones).map((pos) => (
                        <Marker key={pos.tec_id} position={[pos.lat, pos.lng]} icon={iconoTecnico}>
                            <Popup>
                                Técnico #{pos.tec_id}<br />
                                Última actualización: {new Date(pos.timestamp).toLocaleTimeString("es-MX")}
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>

            {Object.keys(posiciones).length === 0 && (
                <p style={{ marginTop: "12px", color: "#6b7280" }}>
                    Esperando que algún técnico empiece a transmitir su ubicación...
                </p>
            )}
        </div>
    );
};

export default MapaEnVivo;