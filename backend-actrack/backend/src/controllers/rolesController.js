import { getRoles, getRolesById} from '../models/roles.js'

const allRoles = async (req, res) => {
    try{
        const roles = await getRoles();
        res.status(200).json(roles)
    }catch(error){
        console.error(error);
        res.status(500).json({ message: 'Error de servidor'})
    }
}

const idRol = async (req, res) => {
    try{

        const { id } = req.params;

        if(!id){
            return res.status(400).json({ message:  "ID no proporcionado"})
        }
        const rolExist = await getRolesById(id);

        if(!rolExist){
            return res.status(404).json({ message: "Rol no encontrado"})
        }

        res.status(200).json(rolExist)
    }catch(error){
        console.error(error);
        res.status(500).json({ message: "Error de servidor"})

    }
}

export { allRoles, idRol};