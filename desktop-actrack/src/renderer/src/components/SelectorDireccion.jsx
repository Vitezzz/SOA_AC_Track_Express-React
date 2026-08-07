import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const iconoPin = L.icon({ iconUrl, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });

// Componente interno: escucha los clics dentro del mapa y mueve el pin ahí
const ManejadorClics = ({ onMover }) => {
    useMapEvents({
        click(e) {
            onMover(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
};

const SelectorDireccion = ({ direccion, onChange, lat, lng, onCoordenadas }) => {
    const [sugerencias, setSugerencias] = useState([]);
    const [mostrarLista, setMostrarLista] = useState(false);
    const contenedorRef = useRef(null);

    // Centro por default: Villahermosa, si todavía no hay coordenadas
    const posicion = lat && lng ? [lat, lng] : [17.9895, -92.9475];

    useEffect(() => {
        if (!direccion || direccion.trim().length < 4) {
            setSugerencias([]);
            return;
        }

        const timeoutId = setTimeout(async () => {
            try {
                const params = new URLSearchParams({
                    format: "json",
                    q: direccion,
                    countrycodes: "mx",
                    limit: "5",
                });
                const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`);
                if (!res.ok) return;
                const data = await res.json();
                setSugerencias(data);
                setMostrarLista(true);
            } catch (err) {
                console.error("Error al buscar direcciones:", err.message);
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [direccion]);

    useEffect(() => {
        const manejarClicFuera = (e) => {
            if (contenedorRef.current && !contenedorRef.current.contains(e.target)) {
                setMostrarLista(false);
            }
        };
        document.addEventListener("mousedown", manejarClicFuera);
        return () => document.removeEventListener("mousedown", manejarClicFuera);
    }, []);

    const elegirSugerencia = (sugerencia) => {
        onChange(sugerencia.display_name);
        onCoordenadas(Number(sugerencia.lat), Number(sugerencia.lon));
        setMostrarLista(false);
        setSugerencias([]);
    };

    // Cuando arrastran/hacen clic en el mapa directamente, además de mover
    // el pin, buscamos la dirección real de ese punto (geocodificación
    // inversa), para que el texto y el pin siempre queden sincronizados.
    const moverPin = async (nuevaLat, nuevaLng) => {
        onCoordenadas(nuevaLat, nuevaLng);
        try {
            const params = new URLSearchParams({ format: "json", lat: nuevaLat, lon: nuevaLng });
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?${params}`);
            if (res.ok) {
                const data = await res.json();
                if (data.display_name) onChange(data.display_name);
            }
        } catch (err) {
            console.error("Error en geocodificación inversa:", err.message);
        }
    };

    return (
        <div>
            <div ref={contenedorRef} className="relative">
                <input
                    type="text"
                    className="form-input"
                    value={direccion}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => sugerencias.length > 0 && setMostrarLista(true)}
                    placeholder="Empieza a escribir tu dirección..."
                    autoComplete="off"
                />
                {mostrarLista && sugerencias.length > 0 && (
                    // z-index alto a propósito: las capas internas de Leaflet
                    // (tiles, marcadores, controles) llegan hasta ~700-1000,
                    // así que con z-10 el mapa de más abajo se dibujaba encima
                    // de esta lista y no dejaba ver las opciones.
                    <ul
                        className="absolute w-full bg-white border border-gray-200 rounded-lg shadow-md mt-1 max-h-60 overflow-y-auto"
                        style={{ zIndex: 2000 }}
                    >
                        {sugerencias.map((s) => (
                            <li
                                key={s.place_id}
                                onClick={() => elegirSugerencia(s)}
                                className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                            >
                                {s.display_name}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <p className="text-xs text-gray-400 mt-2 mb-1">
                Ajusta el pin haciendo clic en el mapa, si la ubicación no quedó exacta:
            </p>
            <div style={{ height: "250px", borderRadius: "12px", overflow: "hidden" }}>
                <MapContainer center={posicion} zoom={15} style={{ height: "100%", width: "100%" }}>
                    <TileLayer
                        attribution='&copy; OpenStreetMap contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker
                        position={posicion}
                        icon={iconoPin}
                        draggable={true}
                        eventHandlers={{
                            dragend: (e) => {
                                const { lat: nuevaLat, lng: nuevaLng } = e.target.getLatLng();
                                moverPin(nuevaLat, nuevaLng);
                            },
                        }}
                    />
                    <ManejadorClics onMover={moverPin} />
                </MapContainer>
            </div>
        </div>
    );
};

export default SelectorDireccion;