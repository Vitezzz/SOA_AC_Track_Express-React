import { selectOrdenesServicioById, updateOrdenesServicio } from "../models/ordenes_servicio.js";
import { selectCotizacionesById, selectCotizacionAprobadaPorOrden } from "../models/cotizaciones.js";
import { insertPagos, selectPagosPorOrden, selectPagosById, updatePagos } from "../models/pagos.js";
import { insertBitacoraEstados } from "../models/bitacora_estados.js";
import { getClienteById } from "../models/clientes.js";
import { getClienteIdByUserId, getTecnicoIdByUserId } from '../utils/lookupUtils.js'


export const procesarPago = async({ cot_id, ord_id, cli_id, metodo, monto, estado = "pendiente"}, user) =>{
    if(!ord_id|| !cli_id || !metodo || !monto ){
        const error = new Error("Campos faltantes");
        error.status = 400;
        throw error;
    }

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

    if(orden.estatus === "cancelada"){
        const error = new Error(`La orden ya está cancelada, no se puede registrar un pago`);
        error.status = 400;
        throw error;
    }

    if(orden.cli_id !== cli_id){
        const error = new Error ('El cliente no coincide con la orden');
        error.status = 400;
        throw error;
    }

    const userCliId = await getClienteIdByUserId(user.id);
    const userTecId = user.rol_id === 4 ? await getTecnicoIdByUserId(user.id) : null;

    const esStaffAutorizado = user.rol_id === 2 || user.rol_id === 5;
    const esElPropioCliente = userCliId === cli_id;
    const esElTecnicoAsignado = user.rol_id === 4 && userTecId === orden.tec_id;

    if (!esStaffAutorizado && !esElPropioCliente && !esElTecnicoAsignado) {
        const error = new Error('No puedes registrar un pago para esta orden');
        error.status = 403;
        throw error;
    }

    const cotizacionAprobada = await selectCotizacionAprobadaPorOrden(ord_id);
    if (!cotizacionAprobada) {
        const error = new Error('Esta orden no tiene una cotización aprobada; no se puede determinar el monto a cobrar');
        error.status = 400;
        throw error;
    }

    const pagosExistentes = await selectPagosPorOrden(ord_id);
    const sumaYaPagada = pagosExistentes
        .filter((p) => p.estado === 'pagado')
        .reduce((suma, p) => suma + Number(p.monto), 0);

    const saldoPendiente = Number(cotizacionAprobada.total) - sumaYaPagada;

    if (saldoPendiente <= 0) {
        const error = new Error('Esta orden ya está completamente pagada');
        error.status = 400;
        throw error;
    }

    if (Number(monto) > saldoPendiente) {
        const error = new Error(`El monto excede lo que falta por cobrar (saldo pendiente: $${saldoPendiente.toFixed(2)})`);
        error.status = 400;
        throw error;
    }

    const pago = await insertPagos({ cot_id: cot_id || cotizacionAprobada.id, ord_id, cli_id, metodo, monto, estado});

    if (estado === 'pagado') {
        const nuevaSumaPagada = sumaYaPagada + Number(monto);
        if (nuevaSumaPagada >= Number(cotizacionAprobada.total)) {
            await updateOrdenesServicio(ord_id, {
                cli_id: orden.cli_id, equ_id: orden.equ_id, cat_id: orden.cat_id,
                pri_id: orden.pri_id, folio: orden.folio, prioridad: orden.prioridad,
                estatus: "pagada", descripcion: orden.descripcion,
                fecha_programada: orden.fecha_programada, fecha_cierre: orden.fecha_cierre,
                tec_id: orden.tec_id, duracion_estimada_horas: orden.duracion_estimada_horas
            });

            await insertBitacoraEstados({
                ord_id,
                usu_id: user.id,
                estado_anterior: orden.estatus,
                estado_nuevo: "pagada"
            })
        }
    }

    return pago;
}

// Confirma un pago que quedó registrado como "pendiente" -- necesario
// porque un pago pendiente nunca cuenta para el saldo de la orden, y
// hay que poder "convertirlo" en un cobro real ya recibido.
export const confirmarPago = async (id, user) => {
    const pago = await selectPagosById(id);
    if (!pago) {
        const error = new Error('Pago no encontrado');
        error.status = 404;
        throw error;
    }

    if (pago.estado === 'pagado') {
        const error = new Error('Este pago ya estaba confirmado');
        error.status = 400;
        throw error;
    }

    const orden = await selectOrdenesServicioById(pago.ord_id);
    if (!orden) {
        const error = new Error('Orden no encontrada');
        error.status = 404;
        throw error;
    }

    const cotizacionAprobada = await selectCotizacionAprobadaPorOrden(pago.ord_id);
    if (!cotizacionAprobada) {
        const error = new Error('Esta orden no tiene cotización aprobada');
        error.status = 400;
        throw error;
    }

    const pagosExistentes = await selectPagosPorOrden(pago.ord_id);
    const sumaYaPagada = pagosExistentes
        .filter((p) => p.estado === 'pagado' && p.id !== pago.id)
        .reduce((suma, p) => suma + Number(p.monto), 0);

    // Si con lo que YA está confirmado (sin contar este pago) la orden
    // ya está saldada, este pago es un duplicado sobrante -- no se puede
    // confirmar, para no exceder el total real de la cotización.
    if (sumaYaPagada >= Number(cotizacionAprobada.total)) {
        const error = new Error('Esta orden ya está completamente pagada -- este pago quedó como duplicado sobrante. Puedes eliminarlo.');
        error.status = 400;
        throw error;
    }

    const pagoConfirmado = await updatePagos(id, {
        cot_id: pago.cot_id, ord_id: pago.ord_id, cli_id: pago.cli_id,
        metodo: pago.metodo, monto: pago.monto, estado: 'pagado'
    });

    const nuevaSumaPagada = sumaYaPagada + Number(pago.monto);
    if (nuevaSumaPagada >= Number(cotizacionAprobada.total)) {
        await updateOrdenesServicio(pago.ord_id, {
            cli_id: orden.cli_id, equ_id: orden.equ_id, cat_id: orden.cat_id,
            pri_id: orden.pri_id, folio: orden.folio, prioridad: orden.prioridad,
            estatus: "pagada", descripcion: orden.descripcion,
            fecha_programada: orden.fecha_programada, fecha_cierre: orden.fecha_cierre,
            tec_id: orden.tec_id, duracion_estimada_horas: orden.duracion_estimada_horas
        });

        await insertBitacoraEstados({
            ord_id: pago.ord_id,
            usu_id: user.id,
            estado_anterior: orden.estatus,
            estado_nuevo: "pagada"
        })
    }

    return pagoConfirmado;
}