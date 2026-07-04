import {
    selectPagos, selectPagosById, selectPagosByCliente, insertPagos,
    updatePagos, deletePagos
} from "../models/pagos.js";
import { puedeVerTodo } from "../utils/roleUtils.js";
import { selectCotizacionesByCliente, selectCotizacionesById } from "../models/cotizaciones.js";
import { selectOrdenesServicioById } from "../models/ordenes_servicio.js";
import { getClienteById } from "../models/clientes.js";
import { getClienteIdByUserId } from '../utils/lookupUtils.js'
import * as pagosService from '../services/pagosService.js'

const getPagos = async (req, res) => {
    try {

        let listaPagos;

        if (puedeVerTodo(req.user.rol_id)) {
            listaPagos = await selectPagos();
        } else if (req.user.rol_id === 3) {
            const cli_id = await getClienteById(req.user.id);
            if(!cli_id) return res.status(404).json({ message : 'Cliente no encontrado'});
            listaPagos = await selectPagosByCliente(cli_id)
        } else {
            return res.status(403).json({ message: "No tienes acceso" })
        }

        if (listaPagos.length === 0) {
            return res.status(404).json({ message: "Lista no encontrada" })
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


/*
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
 */

const postPagos = async(req,res) => {

    try{
        const nuevoPago = await pagosService.procesarPago(req.body, req.user);
        return res.status(201).json({
            id:nuevoPago.id,
            ord_id: nuevoPago.ord_id,
            cli_id: nuevoPago.cli_id,
            monto: nuevoPago.monto,
            metodo: nuevoPago.metodo,
            estado:nuevoPago.estado
        })

    }catch(error){
        console.error('Error: ', error)
        res.status(error.status || 500).json({ message : error.message || 'Error del servidor'})
    }
}

const putPagos = async (req, res) => {
    try {

        const { id } = req.params;
        const { cot_id, ord_id, cli_id, metodo, monto, estado } = req.body;

        if (!id) {
            return res.status(400).json({ message: "Id no encontrado" })
        }

        const clienteExiste = await getClienteById(cli_id);
        if(!clienteExiste) return res.status(404).json({message :'Cliente no encontrado'});

        const ordenExiste = await selectOrdenesServicioById(ord_id);
        if(!ordenExiste) return res .status(404).json({ message : 'Orden no encontrada'});

        const cotizacionExiste = await selectCotizacionesById(cot_id);
        if(!cotizacionExiste) return res.status(404).json({ message : 'Cotizacion no encontrada'});

        const pagosUpdate = await updatePagos(id, { cot_id, ord_id, cli_id, metodo, monto, estado });

        if (!pagosUpdate) {
            return res.status(404).json({ message: "Pago no encontrado" })
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

        if (!pagoDelete) {
            return res.status(404).json({ message: "Id de pago no encontrado" })
        }

        return res.status(200).json(pagoDelete)

    } catch (error) {
        console.error('Error: ', error)
        res.status(500).json({ message: "Error del servidor" })
    }
}

export { getPagos, getPagosById, postPagos, putPagos, dltPagos }