// Orígenes fijos permitidos siempre (web/desktop en dev).
export const origenesFijos = ['http://localhost:5173', 'http://localhost:5174', 'capacitor://localhost', 'file://'];

// En desarrollo, además de los orígenes fijos, aceptamos:
// - cualquier IP de LAN (celular con Expo Go pegándole a http://192.168.x.x:3000)
// - esquemas de Expo (exp://192.168.x.x:8081)
// Los requests nativos (fetch desde React Native) casi nunca mandan Origin,
// esos ya pasan siempre (se deja pasar cuando origin es undefined).
export const origenLanPermitido = (origin) =>
    process.env.NODE_ENV !== 'production' &&
    /^(http:\/\/(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.)\d+\.\d+(:\d+)?|exp:\/\/)/.test(origin);

export const origenPermitido = (origin) =>
    !origin || origenesFijos.includes(origin) || origenLanPermitido(origin);
