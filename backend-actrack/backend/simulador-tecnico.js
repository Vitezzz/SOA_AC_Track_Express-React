import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

// Coordenadas de ejemplo en Villahermosa, Tabasco -- un punto de inicio
// y uno de destino, para simular que el "técnico" se mueve entre ambos.
const inicio = { lat: 17.9895, lng: -92.9475 };
const destino = { lat: 17.9995, lng: -92.9275 };
const PASOS = 30;

let paso = 0;

socket.on("connect", () => {
    console.log("✅ Simulador conectado, id:", socket.id);

    const intervalo = setInterval(() => {
        if (paso > PASOS) {
            console.log("🏁 El técnico llegó a su destino.");
            clearInterval(intervalo);
            socket.disconnect();
            return;
        }

        // Interpolación simple: vamos calculando puntos intermedios entre
        // inicio y destino, poco a poco, para simular movimiento real.
        const progreso = paso / PASOS;
        const lat = inicio.lat + (destino.lat - inicio.lat) * progreso;
        const lng = inicio.lng + (destino.lng - inicio.lng) * progreso;

        socket.emit("actualizar_ubicacion", {
            tec_id: 3, // usa el id real de un técnico que ya tengas
            lat,
            lng,
        });

        console.log(`📍 Paso ${paso}/${PASOS} — lat: ${lat.toFixed(5)}, lng: ${lng.toFixed(5)}`);
        paso++;
    }, 2000); // manda una posición nueva cada 2 segundos
});

socket.on("connect_error", (err) => {
    console.error("❌ Error de conexión:", err.message);
});