import jwt from 'jsonwebtoken';

export const generateAccessToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '15m'});
}

export const generateRefreshToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d'});
}
//jwt.sign - crea el token
//{ id } el payload , lo que va dentro del token (el ID del usuario)
/*
process.env.JWT_SECRET - la clave secreta para firmar, guardada en .env
{ expiresIn: '30d'} - el token expria en 30 días
*/

//Devuelve un string tipo: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpVCJ9

export const cookieOptions = {
    httpOnly: true, //No se puede acceder dede JavaScript en el navegador (protege contra XXS).
    secure: process.env.NODE_ENV === 'production', //solo se envia por HTTPS en producción
    sameSite: 'Strict', //solo se envía si vienes del mismo sitio (protege contra CSRF)
    maxAge: 15 * 60 * 1000 //15 min
}