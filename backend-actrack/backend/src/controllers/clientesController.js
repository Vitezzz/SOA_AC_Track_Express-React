import { getClientes, getClienteById, getClienteByEmail, createCliente, updateCliente, deleteCliente } from "../models/clientes.js";
import { findUserById } from "../models/usuarios.js";


const allClientes = async (req, res) => {
    try {
        const listaClientes = await getClientes();
        if (!listaClientes) {
            return res.status(400).json({ message: 'Clientes no encontrados' });
        }
        res.status(200).json(listaClientes);
    } catch (error) {
        console.error('Error: ', error)
        res.status(500).json({ message: "Error del servidor" })
    }
}

const clienteById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "Id no encontrado" })
        }

        const clienteId = await getClienteById(id);

        if (!clienteId) {
            return res.status(400).json({ message: "Cliente no encontrado" });
        }

        res.status(200).json(clienteId);
    } catch (error) {
        console.error("Error:", error)
        res.status(500).json({ message: "Error del servidor" })
    }
}

const crearCliente = async (req, res) => {

    try {
        const { usu_id, nombre, email, telefono, direccion } = req.body;

        if (!usu_id || !nombre || !email || !telefono || !direccion) {
            return res.status(400).json({ message: 'Favor de proporcionar los campos faltantes' });
        }

        const clienteExiste = await getClienteByEmail(email);
        if (clienteExiste) {
            return res.status(400).json({ message: 'Cliente ya registrado' })
        }

        const usuarioExiste = await findUserById(usu_id);
        if (!usuarioExiste) return res.status(404).json({ message: 'Usuario no encontrado' })

        const nuevoCliente = await createCliente({
            usu_id, nombre, email, telefono, direccion
        });

        res.status(201).json({
            id: nuevoCliente.id,
            usu_id: nuevoCliente.usu_id,
            nombre: nuevoCliente.nombre,
            email: nuevoCliente.email,
            telefono: nuevoCliente.telefono,
            direccion: nuevoCliente.direccion
        })
    } catch (error) {
        console.error('Error:', error)
        res.status(500).json({ message: "Error del servidor" })
    }
}

const clienteUpdate = async (req, res) => {
    try {
        const { id } = req.params;
        const { usu_id, nombre, email, telefono, direccion, activo } = req.body;

        if (!id) {
            return res.status(400).json({ message: 'Id no encontrado' });
        };


        const usuarioExiste = await findUserById(usu_id);
        if (!usuarioExiste) return res.status(404).json({ message: 'Usuario no encontrado' })

        const actualizarCliente = await updateCliente(id, { usu_id, nombre, email, telefono, direccion, activo });

        res.status(200).json({
            id: actualizarCliente.id,
            usu_id: actualizarCliente.usu_id,
            nombre: actualizarCliente.nombre,
            email: actualizarCliente.email,
            telefono: actualizarCliente.telefono,
            direccion: actualizarCliente.direccion,
            activo: actualizarCliente.activo
        })
    } catch (error) {
        console.error("Error", error);
        res.status(500).json({ message: "Error del servidor" })
    }
}

const clienteDelete = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "Id no encontrado" });
        }

        const clienteDeleted = await deleteCliente(id);

        return res.status(200).json({ message: `Cliente eliminado ${id}` })

    } catch (error) {

        console.error('Error', error);
        res.status(500).json({ message: 'Error del servidor' })
    }
}

export { allClientes, clienteById, crearCliente, clienteDelete, clienteUpdate }