import { getRoles, getRolesById } from '../models/roles.js'

export const listarRoles = async() => {
    const roles = await getRoles();
    return roles;
}

export const obtenerRol = async(id) => {
    if(!id){
        const error = new Error('Id no proporcionado');
        error.status = 400;
        throw error;
    }

    const rol = await getRolesById(id);

    if(!rol){
        const error = new Error('Rol no encontrado');
        error.status = 404;
        throw error;
    }

    return rol;
}