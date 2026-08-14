import { io } from "socket.io-client";

// Coloca a cada técnico en un punto fijo distinto de la ciudad para verlos
// en el Mapa en Vivo -- no se mueven, solo se re-transmiten cada cierto
// tiempo para que la posición siga ahí si abres/recargas el mapa después.
const tecnicos = [
    { tec_id: 3, nombre: "Juan Pérez", lat: 17.9895, lng: -92.9475 },
    { tec_id: 4, nombre: "AdolfTecnico Tec Nico", lat: 18.0060, lng: -92.9210 },
    { tec_id: 5, nombre: "Adolfo Tecnico De Climas", lat: 17.9705, lng: -92.9700 },
];

const INTERVALO_MS = 15000;

const socket = io("http://localhost:3000");

socket.on("connect", () => {
    console.log("✅ Simulador (posiciones fijas) conectado, id:", socket.id);

    const emitirTodos = () => {
        tecnicos.forEach((t) => {
            socket.emit("actualizar_ubicacion", { tec_id: t.tec_id, lat: t.lat, lng: t.lng });
        });
        console.log(`📍 Posiciones reenviadas (${new Date().toLocaleTimeString("es-MX")})`);
    };

    emitirTodos();
    setInterval(emitirTodos, INTERVALO_MS);
});

socket.on("connect_error", (err) => {
    console.error("❌ Error de conexión:", err.message);
});
