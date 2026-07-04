import {
    selectAllCategoria_Inventario,
    selectCategoria_InventarioId,
    insertCategoria_Inventario,
    updateCategoria_Inventario,
    deleteCategoria_Inventario
} from "../models/categoria_inventario.js";

const getCategoriaInventario = async (req, res) => {
    try {
        const listaCategoriaInventario = await selectAllCategoria_Inventario();

        if (!listaCategoriaInventario) {
            return res.status(400).json({ message: "Lista Categoria Inventario no encontrada" })
        }
        res.status(200).json(listaCategoriaInventario)
    } catch (error) {
        console.error("Error", error);
        res.status(500).json({ message: "Error del servidor" })
    }
}

const getCategoriaInventarioById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Id no encontrado" })
        }

        const categoriaInventarioId = await selectCategoria_InventarioId(id);

        if (!categoriaInventarioId) {
            return res.status(400).json({ message: "Id de categoria Inventario no encontrado" });
        }

        res.status(200).json(categoriaInventarioId);
    } catch (error) {
        console.error("Error: ", error)
        res.status(500).json({ message: "Error del servidor" })
    }
}

const postCategoriaInventario = async (req, res) => {
    try {
        const { nombre } = req.body;

        if (!nombre) {
            return res.status(400).json({ message: "Campo faltante" })
        }

        const nuevaCategoriaInventario = await insertCategoria_Inventario({ nombre });

        res.status(200).json(nuevaCategoriaInventario)
    } catch (error) {
        console.error("Error: ", error);
        res.status(500).json({ message: "Error del servidor" });
    }
}

const putCategoriaInventario = async (req, res) => {
    try {
        const {id} = req.params;

        if(!id){
            return res.status(400).json({ message: "Id no encontrado"})
        }

        const { nombre } = req.body;

        const categoriaInventarioEditada = await updateCategoria_Inventario(id,{nombre});
        
        res.status(200).json({
            id: categoriaInventarioEditada.id,
            nombre: categoriaInventarioEditada.nombre
        })
    } catch (error) {
        console.error("Error: ", error);
        res.status(500).json({ message: "Error del servidor" });
    }
}

const dltCategoriaInventario = async (req, res) => {
    try {
        const { id } = req.params;

        if(!id){
            return res.status(400).json({ message: "Id no encontrado"});
        }

        const menosCategoriaInventario = await deleteCategoria_Inventario(id);

        if(!menosCategoriaInventario){
            return res.status(404).json({ message: `Categoria Inventario ${id} no eliminada`});
        }

        res.status(200).json(`Categoria Inventario ${id} eliminada`)
    } catch (error) {
        console.error("Error: ", error);
        res.status(500).json({ message: "Error del servidor" });
    }
}

export { getCategoriaInventario, getCategoriaInventarioById, postCategoriaInventario, putCategoriaInventario, dltCategoriaInventario}