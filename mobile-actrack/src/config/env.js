// EXPO_PUBLIC_* se inyecta en build time desde .env (ver .env.example) --
// no puede ser "localhost" porque el celular con Expo Go no es la misma
// máquina que corre el backend.
export const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) {
  console.warn(
    'EXPO_PUBLIC_API_URL no está definida -- copia .env.example a .env y pon la IP de LAN de tu backend.'
  );
}
