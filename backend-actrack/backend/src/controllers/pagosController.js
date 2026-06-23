import {
    selectPagos, selectPagosById, insertPagos,
    updatePagos, deletePagos
} from "../models/pagos.js";

const getPagos = async (req, res) => {
    try {

        const listaPagos = await selectPagos();

        if(await listaPagos.length === 0){
            return res.status(404).json({ message: "Lista no encontrada"})
        }

        return res.status(200).json(listaPagos);
    } catch (error) {
        console.error('Error: ', error)
        res.status(500).json({ message: "Error del servidor" })
    }
}


const getPagosById = async (req, res) => {
    try {

        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "Id no encontrado" })
        }

        const pagosId = await selectPagosById(id);

        if (!pagosId) {
            return res.status(404).json({ message: "Id de pago no encontrado" })
        }

        res.status(200).json(pagosId);
    } catch (error) {
        console.error('Error: ', error)
        res.status(500).json({ message: "Error del servidor" })
    }
}


const postPagos = async (req, res) => {
    try {

        const { cot_id, ord_id, cli_id, metodo, monto, estado = "pendiente" } = req.body;

        if (!ord_id || !cli_id || !metodo || !monto || !estado) {
            return res.status(400).json({ message: "campos faltante" });
        }

        const nuevoPago = await insertPagos({ cot_id, ord_id, cli_id, metodo, monto, estado });

        return res.status(201).json({
            id: nuevoPago.id,
            cot_id: nuevoPago.cot_id,
            ord_id: nuevoPago.ord_id,
            cli_id: nuevoPago.cli_id,
            monto: nuevoPago.monto,
            metodo: nuevoPago.metodo,
            estado: nuevoPago.estado
        })

    } catch (error) {
        console.error('Error: ', error)
        res.status(500).json({ message: "Error del servidor" })
    }
}


const putPagos = async (req, res) => {
    try {

        const { id } = req.params;
        const { cot_id, ord_id, cli_id, metodo, monto, estado } = req.body;

        if (!id) {
            return res.status(400).json({ message: "Id no encontrado" })
        }

        const pagosUpdate = await updatePagos(id,{ cot_id, ord_id, cli_id, metodo, monto, estado });

        if(!pagosUpdate){
            return res.status(404).json({ message: "Pago no encontrado"})
        }

        res.status(200).json({
            id: pagosUpdate.id,
            cot_id: pagosUpdate.cot_id,
            ord_id: pagosUpdate.ord_id,
            cli_id: pagosUpdate.cli_id,
            metodo: pagosUpdate.metodo,
            monto: pagosUpdate.monto,
            estado: pagosUpdate.estado
        })
    } catch (error) {
        console.error('Error: ', error)
        res.status(500).json({ message: "Error del servidor" })
    }
}


const dltPagos = async (req, res) => {
    try {

        const { id } = req.params;
        
        if (!id) {
            return res.status(400).json({ message: "Id no encontrado" })
        }

        const pagoDelete = await deletePagos(id);

        if(!pagoDelete){
            return res.status(404).json({ message: "Id de pago no encontrado"})
        }

        return res.status(200).json(pagoDelete)
         
    } catch (error) {
        console.error('Error: ', error)
        res.status(500).json({ message: "Error del servidor" })
    }
}

export { getPagos, getPagosById, postPagos, putPagos, dltPagos}