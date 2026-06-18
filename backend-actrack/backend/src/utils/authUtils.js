import jwt from 'jsonwebtoken';

export const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d'});
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
    maxAge: 30 * 24 * 60 *  60 * 1000 //30 dias
}