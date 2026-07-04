import { selectTipoMovimientoInventario, selectTipoMovimientoInventarioById } from "../models/tipos_movimiento_inventario.js";

const getTipoMovimientoInventario = async (req, res) => {

    try {
        const listaMovimientosInventario = await selectTipoMovimientoInventario();

        if (!listaMovimientosInventario) {
            return res.status(400).json({ message: "Lista de movimientos inventario no encontrada" });
        }

        res.status(200).json(listaMovimientosInventario);
    } catch (error) {
        console.error("Error: ", error);
        return res.status(500).json({ message: "Error del servidor" });
    }
}

const getTipoMovimientoInventarioById = async (req, res) => {

    try {

        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "Id no encontrado" })
        }

        const listaMovimientosInventarioById = await selectTipoMovimientoInventarioById(id);

        if (!listaMovimientosInventarioById) {
            return res.status(404).json({ message: "Id de movimiento inventario no encontrado" })
        }

        res.status(200).json(listaMovimientosInventarioById);
    } catch (error) {
        console.error("Error: ", error);
        return res.status(500).json({ message: "Error del servidor" });
    }
}

export { getTipoMovimientoInventario, getTipoMovimientoInventarioById }