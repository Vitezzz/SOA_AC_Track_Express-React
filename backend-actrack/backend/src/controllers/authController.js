import { createUser, findUserByEmail } from '../models/usuarios.js'
import { generateToken, cookieOptions } from '../utils/authUtils.js'
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

        const token = generateToken(nuevoUsuario.id);

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

        if(!user){
            return res.status(401).json({ message: 'Credenciales Inválidas'});
        }

        const coincide = await bcrypt.compare(password, user.password);

        if(!coincide){
            return res.status(401).json({ message: 'Credenciales inválidas'});
        }

        const token = generateToken(user.id);

        res.cookie ('token', token, cookieOptions);

        res.status(200).json({
            email : user.email,
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Error del servidor'})
    }
}

const getProfile = async(req, res) => {
    try{
        if(!req.user){
            return res.status(401).json({ message: 'No autenticado'});
        }
        res.json(req.user);
    }catch(error){
        console.error(error);
        res.status(500).json({ message: 'Error del servidor'});
    }
}

const logout = async(req,res) => {
    res.clearCookie('token', cookieOptions)
    res.status(200).json({message: 'Sesion cerrada'});
}

export {register, login, getProfile, logout};