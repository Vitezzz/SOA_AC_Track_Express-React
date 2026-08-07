//index.js starts tour server
import dotenv from "dotenv";
import http from "http";
import app from './app.js';
import { initSocket } from './socket.js';

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