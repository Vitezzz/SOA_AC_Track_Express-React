import {
    selectCotizaciones, selectCotizacionesById, selectCotizacionesByCliente, insertCotizaciones,
    updateCotizaciones, deleteCotizaciones
} from "../models/cotizaciones.js";
import { puedeVerTodo } from "../utils/roleUtils.js";
import { getClienteById } from "../models/clientes.js";
import { selectOrdenesServicioById } from "../models/ordenes_servicio.js";
import { selectTecnicoById } from "../models/tecnicos.js";
import { getClienteIdByUserId } from '../utils/lookupUtils.js'

const getCotizaciones = async (req, res) => {
    try {

        let listaCotizaciones;

        if (puedeVerTodo(req.user.rol_id)) {
            listaCotizaciones = await selectCotizaciones();
        } else if (req.user.rol_id === 3) {
            const cli_id = await getClienteIdByUserId(req.user.id);
            if(!cli_id) return res.status(404).json({ message: 'Cliente no encontrado'});
            listaCotizaciones = await selectCotizacionesByCliente(cli_id);            
        } else {
            return res.status(403).json({ message: "No tienes acceso" })
        }

        if (listaCotizaciones.length === 0) {
            return res.status(404).json({ message: "Lista de cotizaciones no encontrada" })
        }

        res.status(200).json(listaCotizaciones)

    } catch (error) {
        console.error("Error: ", error);
        res.status(500).json({ message: "Error del servidor" })
    }
}

const getCotizacioneById = async (req, res) => {
    try {

        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "Id no encontrado" });
        }

        const cotizacionId = await selectCotizacionesById(id);

        if (!cotizacionId) {
            return res.status(404).json({ message: "Id de cotizacion no encontrado" });
        }

        res.status(200).json(cotizacionId)

    } catch (error) {
        console.error("Error: ", error);
        res.status(500).json({ message: "Error del servidor" })
    }
}

const postCotizacione = async (req, res) => {
    try {

        const { ord_id, tec_id, cli_id, folio, estado, total,
            notas } = req.body;

        if (!ord_id || !tec_id || !cli_id || !folio || !estado || !total) {
            return res.status(400).json({ message: "Faltan campos" })
        }

        const clienteExiste = await getClienteById(cli_id);
        if (!clienteExiste) return res.status(404).json({ message: 'Cliente no encontrado' })

        const ordenExiste = await selectOrdenesServicioById(ord_id);
        if (!ordenExiste) return res.status(404).json({ message: 'Orden no encontrada' });

        const tecnicoExiste = await selectTecnicoById(tec_id);
        if (!tecnicoExiste) return res.status(404).json({ message: 'Tecnico no encontrado' })

        const nuevaCotizacion = await insertCotizaciones({
            ord_id, tec_id, cli_id, folio, estado, total,
            notas
        });

        res.status(201).json({
            id: nuevaCotizacion.id,
            ord_id: nuevaCotizacion.ord_id,
            tec_id: nuevaCotizacion.tec_id,
            cli_id: nuevaCotizacion.cli_id,
            folio: nuevaCotizacion.folio,
            estado: nuevaCotizacion.estado,
            total: nuevaCotizacion.total,
            notas: nuevaCotizacion.notas
        })
    } catch (error) {
        console.error("Error: ", error);
        res.status(500).json({ message: "Error del servidor" })
    }
}

const putCotizaciones = async (req, res) => {
    try {

        const { id } = req.params;
        const { ord_id, tec_id, cli_id, folio, estado, total,
            notas } = req.body;
        if (!id) {
            return res.status(400).json({ message: "id no encontrado" });
        }

        const clienteExiste = await getClienteById(cli_id);
        if (!clienteExiste) return res.status(404).json({ message: 'Cliente no encontrado' })

        const ordenExiste = await selectOrdenesServicioById(ord_id);
        if (!ordenExiste) return res.status(404).json({ message: 'Orden no encontrada' });

        const tecnicoExiste = await selectTecnicoById(tec_id);
        if (!tecnicoExiste) return res.status(404).json({ message: 'Tecnico no encontrado' })

        const cotizacionUpdt = await updateCotizaciones(id, {
            ord_id, tec_id, cli_id, folio, estado, total,
            notas
        });

        if (!cotizacionUpdt || !cotizacionUpdt.id) {
            return res.status(404).json({ message: "Id de cotizacion no encontrado" })
        }

        res.status(200).json({
            id: cotizacionUpdt.id,
            ord_id: cotizacionUpdt.ord_id,
            tec_id: cotizacionUpdt.tec_id,
            cli_id: cotizacionUpdt.cli_id,
            folio: cotizacionUpdt.folio,
            estado: cotizacionUpdt.estado,
            total: cotizacionUpdt.total,
            notas: cotizacionUpdt.notas
        })


    } catch (error) {
        console.error("Error: ", error);
        res.status(500).json({ message: "Error del servidor" })
    }
}

const dltCotizaciones = async (req, res) => {
    try {

        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "Id no encontrado" });
        }

        const cotizacionDlt = await deleteCotizaciones(id);

        if (!cotizacionDlt) {
            return res.status(404).json({ message: "Id de cotizacion no encontrado" });
        }

        return res.status(200).json(cotizacionDlt);

    } catch (error) {
        console.error("Error: ", error);
        res.status(500).json({ message: "Error del servidor" })
    }
}

export { getCotizaciones, getCotizacioneById, postCotizacione, putCotizaciones, dltCotizaciones };