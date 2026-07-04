import {
    selectAllInventario,
    selectInventarioId,
    insertInventario,
    updateInventario,
    deleteInventario
} from "../models/inventario.js";
import { selectCategoria_InventarioId } from "../models/categoria_inventario.js";


const getInventario = async (req, res) => {
    try {
        const listaInventario = await selectAllInventario();

        if (!listaInventario) {
            return res.status(400).json({ message: "Lista de inventario no encontrada" })
        }
        res.status(200).json(listaInventario)
    } catch (error) {
        console.error("Error", error);
        res.status(500).json({ message: "Error del servidor" })
    }
}

const getInventarioById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Id no encontrado" })
        }

        const inventarioId = await selectInventarioId(id);

        if (!inventarioId) {
            return res.status(400).json({ message: "Id de inventario no encontrado" });
        }

        res.status(200).json(inventarioId);
    } catch (error) {
        console.error("Error: ", error)
        res.status(500).json({ message: "Error del servidor" })
    }
}

const postInventario = async (req, res) => {
    try {
        const { cat_id, codigo, nombre, unidad_medida, stock_actual, precio_venta } = req.body;

        if (!nombre) {
            return res.status(400).json({ message: "Campo faltante" })
        }

        const categoriaInventarioExiste = await selectCategoria_InventarioId(cat_id);
        if (!categoriaInventarioExiste) return res.status(404).json({ message: 'Categoria Inventario no encontrada' })

        const nuevoInventario = await insertInventario({ cat_id, codigo, nombre, unidad_medida, stock_actual, precio_venta });

        res.status(200).json(nuevoInventario)
    } catch (error) {
        console.error("Error: ", error);
        res.status(500).json({ message: "Error del servidor" });
    }
}

const putInventario = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "Id no encontrado" })
        }

        const { cat_id, codigo, nombre, unidad_medida, stock_actual, precio_venta } = req.body;

        const categoriaInventarioExiste = await selectCategoria_InventarioId(cat_id);
        if (!categoriaInventarioExiste) return res.status(404).json({ message: 'Categoria Inventario no encontrada' })


        const inventarioEditado = await updateInventario(id, { cat_id, codigo, nombre, unidad_medida, stock_actual, precio_venta });

        res.status(200).json(inventarioEditado)
    } catch (error) {
        console.error("Error: ", error);
        res.status(500).json({ message: "Error del servidor" });
    }
}

const dltInventario = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "Id no encontrado" });
        }

        const menosInventario = await deleteInventario(id);

        if (!menosInventario) {
            return res.status(400).json({ message: "Id de inventario no encontrado" });
        }

        res.status(200).json(menosInventario)
    } catch (error) {
        console.error("Error: ", error);
        res.status(500).json({ message: "Error del servidor" });
    }
}

export { getInventario, getInventarioById, postInventario, putInventario, dltInventario }
