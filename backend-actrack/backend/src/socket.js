import { Server } from "socket.io";
import { origenPermitido } from "./utils/corsUtils.js";

let io;

export const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            // Mismo criterio que el CORS de Express (utils/corsUtils.js):
            // localhost/electron/vite en dev, más LAN/Expo para el móvil.
            origin: (origin, callback) => {
                if (origenPermitido(origin) || (origin && origin.startsWith("http://localhost:"))) {
                    callback(null, true);
                } else {
                    callback(new Error("Origen no permitido"));
                }
            },
            credentials: true,
        },
    });

    io.on("connection", (socket) => {
        console.log("Cliente conectado por WebSocket:", socket.id);

        // El técnico (o, por ahora, nuestro simulador) manda su posición.
        socket.on("actualizar_ubicacion", (data) => {
            // data esperado: { tec_id, lat, lng }
            // Reenviamos la posición a TODOS los demás conectados --
            // así el mapa de Desktop se entera al instante.
            io.emit("ubicacion_tecnico", {
                ...data,
                timestamp: new Date().toISOString(),
            });
        });

        socket.on("disconnect", () => {
            console.log("🔌 Cliente desconectado:", socket.id);
        });
    });

    return io;
};