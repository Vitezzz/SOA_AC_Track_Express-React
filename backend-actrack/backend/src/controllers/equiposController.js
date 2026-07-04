import { getEquipos, getEquipoById, selectEquiposByCliente, createEquipo, updateEquipo, deleteEquipo } from "../models/equipos.js";
import { getClienteById } from "../models/clientes.js";
import { getMarcaId } from "../models/marcas.js";
import { puedeVerTodo } from "../utils/roleUtils.js";
import { getClienteIdByUserId} from '../utils/lookupUtils.js'

const listaEquipos = async (req, res) => {
    try {
        let listadoEquipos;

        if (puedeVerTodo(req.user.rol_id)) {
            listadoEquipos = await getEquipos();
        } else if (req.user.rol_id === 3) {

            const cli_id = await getClienteIdByUserId(req.user.id);
            if(!cli_id) return res.status(404).json({ message : 'Cliente no encontrado'});
            listadoEquipos = await selectEquiposByCliente(cli_id);
        } else {
            return res.status(403).json({ message: 'No tienes acceso' });
        }

        if (!listadoEquipos) {
            return res.status(400).json({ message: "Equipos no encontrados" });
        }
        res.status(200).json(listadoEquipos);
    } catch (error) {
        console.error('Error: ', error)
        res.status(500).json({ message: 'Error del servidor' });
    }
}

const equiposById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "Id no encontrado" });
        }

        const equipoId = await getEquipoById(id);

        if (!equipoId) {
            return res.status(400).json({ message: "Id de equipo no encontrado" })
        }

        res.status(200).json(equipoId);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error del servidor" });
    }
}

const crearEquipo = async (req, res) => {
    try {
        const { cli_id, mar_id, modelo, numero_serie, tipo } = req.body;

        if (!cli_id || !mar_id || !modelo || !numero_serie || !tipo) {
            return res.status(400).json({ message: "Campos faltantes" });
        }

        const clienteExiste = await getClienteById(cli_id);
        if (!clienteExiste) return res.status(404).json({ message: 'Cliente no encontrado' });

        const marcaExiste = await getMarcaId(mar_id);
        if (!marcaExiste) return res.status(404).json({ message: 'Marca no encontrada' })

        const equipoNuevo = await createEquipo({ cli_id, mar_id, modelo, numero_serie, tipo });

        res.status(201).json({
            id: equipoNuevo.id,
            cli_id: equipoNuevo.cli_id,
            mar_id: equipoNuevo.mar_id,
            modelo: equipoNuevo.modelo,
            numero_serie: equipoNuevo.numero_serie,
            tipo: equipoNuevo.tipo
        })
    } catch (error) {
        console.error("Error :", error)
        res.status(500).json({ message: "Error del servidor" })
    }
}

const actualizarEquipo = async (req, res) => {
    try {
        const { id } = req.params;
        const { cli_id, mar_id, modelo, numero_serie, tipo } = req.body
        if (!id) {
            return res.status(400).json({ message: "Id no encontrado" })
        }

        const clienteExiste = await getClienteById(cli_id);
        if (!clienteExiste) return res.status(404).json({ message: 'Cliente no encontrado' });

        const marcaExiste = await getMarcaId(mar_id);
        if (!marcaExiste) return res.status(404).json({ message: 'Marca no encontrada' })

        const equipoActualizado = await updateEquipo(id, { cli_id, mar_id, modelo, numero_serie, tipo });

        if (!equipoActualizado) {
            return res.status(404).json({ message: "Equipo no encontrado" })
        }

        res.status(200).json({
            id: equipoActualizado.id,
            cli_id: equipoActualizado.cli_id,
            mar_id: equipoActualizado.mar_id,
            modelo: equipoActualizado.modelo,
            numero_serie: equipoActualizado.numero_serie,
            tipo: equipoActualizado.tipo
        })
    } catch (error) {
        console.error("Error: ", error);
        res.status(500).json({ message: "Error del servidor" })
    }
}

const eliminarEquipo = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Id no encontrado" })
        }

        const equipoEliminado = await deleteEquipo(id);

        res.status(200).json(equipoEliminado);

    } catch (error) {
        console.error("Error: ", error)
        res.status(500).json({ message: "Error del servidor" })
    }
}

export { listaEquipos, equiposById, crearEquipo, actualizarEquipo, eliminarEquipo }