import { getCategoriaServicio, getCategoriaServicioId, createCategoriaServicio, updateCategoriaServicio, deleteCategoriaServicio } from "../models/categoria_servicio.js";

const listadoCategoriaServicio = async (req, res) => {
    try {
        const listaCategoriaServicio = await getCategoriaServicio();
        if (!listaCategoriaServicio) {
            return res.status(400).json({ message: "Lista de categorias de servicio no encontrada" });
        }
        res.status(200).json(listaCategoriaServicio);
    } catch (error) {
        console.error('Error: ', error)
        res.status(500).json({ message: "Error del servidor" });
    }
}

const categoriaServicioById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "Id no encontrado" });
        }

        const categoriaServicioId = await getCategoriaServicioId(id);

        if (!categoriaServicioId) {
            return res.status(400).json({ message: "Id de categoria servicio no encontrado" })
        }

        res.status(200).json(categoriaServicioId);
    } catch (error) {
        console.error('Error: ', error);
        res.status(500).json({ message: "Error del servidor" })
    }
}

const crearCategoriaServicio = async (req, res) => {
    try {
        const { nombre } = req.body;

        if (!nombre) {
            return res.status(400).json({ message: "Dato faltante" })
        }

        const nuevaCategoriaServicio = await createCategoriaServicio({ nombre });

        res.status(201).json({
            id: nuevaCategoriaServicio.id,
            nombre: nuevaCategoriaServicio.nombre
        })
    } catch (error) {
        console.error("Error: ", error)
        res.status(500).json({ message: "Error del servidor" });
    }
}

const putCategoriaServicio = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: 'Id no encontrado' })
        }

        const {nombre} = req.body;

        const categoriaServicioActualizada = await updateCategoriaServicio(id, { nombre });

        if (!categoriaServicioActualizada) {
            return res.status(400).json({ message: "Id de categoria servicio no encontrada" })
        }

        res.status(200).json({
            id: categoriaServicioActualizada.id,
            nombre: categoriaServicioActualizada.nombre
        });
    } catch (error) {
        console.error('Error: ', error);
        res.status(500).json({ message: "Error del servidor"});
    }
}

const categoriaServicioDelete = async(req, res) => {
    try{
        const { id } = req.params;

        if(!id){
            return res.status(400).json({ message: "Id no encontrado"});
        }

        const csDelete = await deleteCategoriaServicio(id);

        if(!csDelete){
            return res.status(400).json({ message: "Id de categoria servicio no encontrado"});
        }

        res.status(200).json(csDelete);
    }catch(error){
        console.error("Error: ", error)
        res.status(500).json({ message: "Error del servidor"})
    }
}

export {listadoCategoriaServicio,categoriaServicioById, crearCategoriaServicio, putCategoriaServicio, categoriaServicioDelete}