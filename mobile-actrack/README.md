# mobile-actrack

App móvil (Expo / React Native) para los técnicos de campo de AC Track. Ver el plan completo en `../Hernández De La Cruz Humberto - Act 2 - Descripcion Proyectos.md` (sección 11).

## Setup

1. `npm install`
2. Copia `.env.example` a `.env` y pon la IP de LAN de la máquina donde corre `backend-actrack` (no `localhost` -- el celular no es la misma máquina):
   ```
   hostname -I
   ```
   usa la que sea de tu red Wi-Fi/Ethernet (normalmente `192.168.x.x`), puerto `3000`.
3. Con `backend-actrack` corriendo (`NODE_ENV` distinto de `production`, para que el CORS de LAN esté habilitado):
   ```
   npx expo start
   ```
4. Escanea el QR con Expo Go (Android/iOS) -- el celular y la computadora deben estar en la misma red.

## Convenciones

- Expo Router (carpeta `app/`) -- misma idea que las rutas de `desktop-actrack/src/renderer/src/App.jsx`, pero basada en archivos.
- `src/context/AuthContext.jsx` sigue el mismo patrón que `desktop-actrack` (Bearer header, sin cookies), cambiando `localStorage` por `expo-secure-store`.
- JavaScript, no TypeScript -- igual que el resto del monorepo.
