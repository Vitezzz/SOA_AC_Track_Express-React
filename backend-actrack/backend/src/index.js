//index.js starts tour server
import dotenv from "dotenv";
import http from "http";
import cron from "node-cron";
import app from './app.js';
import { initSocket } from './socket.js';
import { generarOrdenesVencidas } from './services/mantenimientoPreventivoService.js';

dotenv.config();

const PORT = process.env.PORT || 3000;

// Antes usábamos app.listen(...) directo -- ahora necesitamos crear un
// servidor HTTP "de verdad" primero, porque Socket.IO necesita acceso a
// ese servidor crudo (Express no se lo puede dar por sí solo).
const httpServer = http.createServer(app);
initSocket(httpServer);

httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Revisión diaria de mantenimientos preventivos vencidos (todos los días a
// las 7am) -- genera la orden de servicio y el SMS de recordatorio solos,
// sin que el admin tenga que acordarse de revisar la lista. También corre
// una vez al arrancar el servidor, por si estuvo apagado y se acumularon
// mantenimientos vencidos mientras tanto.
cron.schedule('0 7 * * *', () => {
    generarOrdenesVencidas().catch((err) => console.error('Error en revisión diaria de mantenimientos:', err.message));
});
generarOrdenesVencidas().catch((err) => console.error('Error en revisión inicial de mantenimientos:', err.message));