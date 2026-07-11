import { selectOrdenesServicioById, updateOrdenesServicio } from "../models/ordenes_servicio.js";
import { selectCotizacionesById } from "../models/cotizaciones.js";
import { insertPagos } from "../models/pagos.js";
import { insertBitacoraEstados } from "../models/bitacora_estados.js";
import { getClienteById } from "../models/clientes.js";
import { getClienteIdByUserId } from '../utils/lookupUtils.js'


export const procesarPago = async({ cot_id, ord_id, cli_id, metodo, monto, estado = "pendiente"}, user) =>{
    if(!ord_id|| !cli_id || !metodo || !monto ){
        const error = new Error("Campos faltantes");
        error.status = 400;
        throw error;
    }

    if (cot_id) {
        const cotizacion = await selectCotizacionesById(cot_id);
        if (!cotizacion) {
            const error = new Error('Cotizacion no encontrada');
            error.status = 404;
            throw error;
        }
    }

    //Validacion que exista la orden
    const orden = await selectOrdenesServicioById(ord_id);
    if(!orden){
        const error = new Error ('Orden no encontrada');
        error.status = 404;
        throw error;
    }

    const cliente = await getClienteById(cli_id)
    if(!cliente){
        const error = new Error('Cliente no encontrado')
        error.status = 404;
        throw error;
    }

    //3. Validar que la orden no este pagada o cancelada
    if(orden.estatus === "pagada" || orden.estatus === "cancelada"){
        const error = new Error(`La orden ya esta ${orden.estatus}`);
        error.status = 400;
        throw error;
    }

    if(orden.cli_id !== cli_id){
        const error = new Error ('El cliente no coincide con la orden');
        error.status = 400;
        throw error;
    }

    const userCliId = await getClienteIdByUserId(user.id);
    if(user.rol_id !== 2 && userCliId !== cli_id){
        const error = new Error('No puedes crear un pago para otro cliente');
        error.status = 403;
        throw error;
    }

    //Insertar pago
    const pago = await insertPagos({ cot_id, ord_id, cli_id, metodo, monto, estado});

    //Actualizar estado de la orden
    await updateOrdenesServicio(ord_id, {
        cli_id: orden.cli_id, equ_id: orden.equ_id, cat_id: orden.cat_id,
        pri_id: orden.pri_id, folio: orden.folio, prioridad: orden.prioridad,
        estatus: "pagada", descripcion: orden.descripcion,
        fecha_programada: orden.fecha_programada, fecha_cierre: orden.fecha_cierre,
        tec_id: orden.tec_id
    });

    //Insertar en bitacora
    await insertBitacoraEstados({
        ord_id,
        usu_id: user.id,
        estado_anterior: orden.estatus,
        estado_nuevo: "pagada"
    })

    return pago;
}