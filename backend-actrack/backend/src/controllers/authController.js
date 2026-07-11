import { deleteSesiones, insertSesiones } from '../models/sesiones.js';
import { createUser, findUserByEmail } from '../models/usuarios.js'
import { cookieOptions, generateAccessToken, generateRefreshToken } from '../utils/authUtils.js'
import jwt from 'jsonwebtoken';
import { selectSesionesByToken } from '../models/sesiones.js';
import bcrypt from 'bcryptjs'

const register = async (req, res) => {
    try {

        const { rol_id, nombre, paterno, materno, email, password } = req.body;

        if (!nombre || !email || !password) {
            return res.status(400).json({ message: 'Favor de proporcionar todos los campos' })
        }

        const usuarioExiste = await findUserByEmail(email)
        if (usuarioExiste) {
            return res.status(400).json({ message: "El email ya esta registrado" })
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt)

        const nuevoUsuario = await createUser({
            rol_id, nombre, paterno, materno, email, password: passwordHash
        });

        const token = generateAccessToken(nuevoUsuario.id);

        res.cookie('token', token, cookieOptions);

        res.status(201).json({
            id: nuevoUsuario.id,
            nombre: nuevoUsuario.nombre,
            email: nuevoUsuario.email
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Error del servidor' })

    }
}


const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(401).json({ message: 'Credenciales Inválidas' });
        }

        const user = await findUserByEmail(email);

        if (!user) {
            return res.status(401).json({ message: 'Credenciales Inválidas' });
        }

        const coincide = await bcrypt.compare(password, user.password);

        if (!coincide) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const accessToken = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id);

        //Calcular fecha de expiracion del refresh (7 días desde ahora)
        const expira = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        //Guardar refresh token en BD 
        await insertSesiones(user.id, refreshToken, expira);

        res.cookie('token', accessToken, cookieOptions);

        res.status(200).json({
            email: user.email,
            refreshToken
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Error del servidor' })
    }
}

const getProfile = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'No autenticado' });
        }
        res.json(req.user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error del servidor' });
    }
}

const logout = async (req, res) => {
    try {
        await deleteSesiones(req.user.id);
        res.clearCookie('token', cookieOptions);
        res.status(200).json({ message: 'Sesion cerrada' });
    } catch (error) {
        console.error('Error:', error)
        res.status(500).json({ message: 'Error del servidor' });
    }
}

const refresh = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({ message: 'Refresh token requerido' });
        }

        const sesion = await selectSesionesByToken(refreshToken);

        if (!sesion) {
            return res.status(401).json({ message: 'Refresh token inválido' })
        }

        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

        const accessToken = generateAccessToken(decoded.id);

        res.cookie('token', accessToken, cookieOptions);

        res.json({ message: 'Token renovado' })
    } catch (error) {
        console.error(error)
        res.status(401).json({ message: "Refresh token expirado o invàlido" })
    }
}

export { register, login, getProfile, logout, refresh };