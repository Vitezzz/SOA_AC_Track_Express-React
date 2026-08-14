import {
    selectCotizaciones, selectCotizacionesById, selectCotizacionesByCliente, selectCotizacionesByTecnico, insertCotizaciones,
    updateCotizaciones, deleteCotizaciones,
    generarSiguienteFolioCotizacion
} from "../models/cotizaciones.js";
import { puedeVerTodo } from "../utils/roleUtils.js";
import { getClienteById } from "../models/clientes.js";
import { selectOrdenesServicioById } from "../models/ordenes_servicio.js";
import { selectTecnicoById } from "../models/tecnicos.js";
import { getClienteIdByUserId, getTecnicoIdByUserId } from '../utils/lookupUtils.js'
import { enviarSMS, formatearTelefonoE164 } from "../utils/smsService.js";
import { enviarPush } from "../utils/pushService.js";
import { insertNotificaciones } from "../models/notificaciones.js";
import pool from '../config/database.js'

const getCotizaciones = async (req, res) => {
    try {

        let listaCotizaciones;

        if (puedeVerTodo(req.user.rol_id)) {
            listaCotizaciones = await selectCotizaciones();
        } else if (req.user.rol_id === 3) {
            const cli_id = await getClienteIdByUserId(req.user.id);
            if (!cli_id) return res.status(404).json({ message: 'Cliente no encontrado' });
            listaCotizaciones = await selectCotizacionesByCliente(cli_id);
        } else if (req.user.rol_id === 4) {
            const tec_id = await getTecnicoIdByUserId(req.user.id);
            if (!tec_id) return res.status(404).json({ message: 'Tecnico no encontrado' });
            listaCotizaciones = await selectCotizacionesByTecnico(tec_id);
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

        const { ord_id, tec_id, cli_id, estado, total,
            notas } = req.body;

        if (!ord_id || !tec_id || !cli_id || !estado || total === undefined || total === null) {
            return res.status(400).json({ message: "Faltan campos" })
        }

        const clienteExiste = await getClienteById(cli_id);
        if (!clienteExiste) return res.status(404).json({ message: 'Cliente no encontrado' })

        const ordenExiste = await selectOrdenesServicioById(ord_id);
        if (!ordenExiste) return res.status(404).json({ message: 'Orden no encontrada' });

        const tecnicoExiste = await selectTecnicoById(tec_id);
        if (!tecnicoExiste) return res.status(404).json({ message: 'Tecnico no encontrado' })

        const folio = await generarSiguienteFolioCotizacion();

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
        const { ord_id, tec_id, cli_id, folio, estado, total, notas } = req.body;
        if (!id) {
            return res.status(400).json({ message: "id no encontrado" });
        }

        if (estado === 'enviada' && Number(total) <= 0) {
            return res.status(400).json({ message: 'No puedes enviar una cotización sin piezas o mano de obra agregada (el total es $0)' });
        }

        const clienteExiste = await getClienteById(cli_id);
        if (!clienteExiste) return res.status(404).json({ message: 'Cliente no encontrado' })

        const ordenExiste = await selectOrdenesServicioById(ord_id);
        if (!ordenExiste) return res.status(404).json({ message: 'Orden no encontrada' });

        const tecnicoExiste = await selectTecnicoById(tec_id);
        if (!tecnicoExiste) return res.status(404).json({ message: 'Tecnico no encontrado' })

        // Se necesita el estado ANTES del update para no re-notificar cada
        // vez que se re-guarda una cotización que ya estaba "enviada" (p.ej.
        // al agregar otro renglón, que resendea la cotización sin cambiar
        // su estado) -- solo se avisa al cliente la primera vez que entra
        // a "enviada".
        const cotizacionAntes = await selectCotizacionesById(id);

        const cotizacionUpdt = await updateCotizaciones(id, {
            ord_id, tec_id, cli_id, folio, estado, total, notas
        });

        if (!cotizacionUpdt || !cotizacionUpdt.id) {
            return res.status(404).json({ message: "Id de cotizacion no encontrado" })
        }

        // Antes esto solo avisaba al cliente cuando SU cotización quedaba
        // aprobada -- pero nadie le avisaba que había una cotización nueva
        // ESPERANDO su respuesta, así que solo se enteraba si abría la app
        // por su cuenta. Se manda push + notificación in-app también al
        // entrar a "enviada" (típicamente el técnico, cotizando en campo).
        if (estado === 'enviada' && cotizacionAntes?.estado !== 'enviada') {
            await enviarPush(
                clienteExiste.usu_id,
                'Nueva cotización para tu servicio',
                `Cotización ${cotizacionUpdt.folio} por $${Number(total).toFixed(2)} -- revísala y responde en la app.`
            );
            await insertNotificaciones({
                usu_id: clienteExiste.usu_id,
                tipo: 'cotizacion_enviada',
                titulo: `Cotización ${cotizacionUpdt.folio} lista para tu revisión`,
                leido: false,
            });
        }

        // Si la cotización se está aprobando, notificamos al cliente por SMS.
        // El avance de la orden (pendiente -> en_proceso -> completada) queda
        // como responsabilidad del técnico/staff (app de escritorio/móvil),
        // no se dispara automáticamente aquí.
        if (estado === 'aprobada') {
            const mensaje = `AC Track: tu cotización ${cotizacionUpdt.folio} fue confirmada. ¡Gracias por tu preferencia!`;
            await enviarSMS(clienteExiste.telefono, mensaje);
            await insertNotificaciones({
                usu_id: clienteExiste.usu_id,
                tipo: 'sms_cotizacion_aprobada',
                titulo: `Cotización ${cotizacionUpdt.folio} aprobada`,
                leido: false,
            });
        }

        // Al rechazar tampoco se avisaba a nadie -- el técnico se quedaba
        // esperando una respuesta que ya había llegado, sin enterarse salvo
        // que entrara a checar manualmente.
        if (estado === 'rechazada' && cotizacionAntes?.estado !== 'rechazada') {
            await enviarPush(
                tecnicoExiste.usu_id,
                'Cotización rechazada',
                `El cliente rechazó la cotización ${cotizacionUpdt.folio}. Revisa la orden para ver los siguientes pasos.`
            );
            await insertNotificaciones({
                usu_id: tecnicoExiste.usu_id,
                tipo: 'cotizacion_rechazada',
                titulo: `Cotización ${cotizacionUpdt.folio} fue rechazada por el cliente`,
                leido: false,
            });
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