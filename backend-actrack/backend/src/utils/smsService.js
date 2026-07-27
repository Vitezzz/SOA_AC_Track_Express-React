import twilio from "twilio";

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Twilio exige el formato internacional E.164 (+52...), pero tu columna
// "telefono" es texto libre -- aquí lo normalizamos antes de mandarlo.
export const formatearTelefonoE164 = (telefono) => {
    if (!telefono) return null;
    const soloDigitos = telefono.replace(/\D/g, ""); // quita espacios, guiones, etc.
    if (soloDigitos.length === 0) return null;
    return telefono.startsWith("+") ? telefono : `+52${soloDigitos}`;
};

export const enviarSMS = async (telefonoDestino, mensaje) => {
    const telefonoFormateado = formatearTelefonoE164(telefonoDestino);

    if (!telefonoFormateado) {
        console.warn("No se envió SMS: el cliente no tiene teléfono registrado.");
        return null;
    }

    try {

        console.log("Intentando enviar SMS a:", telefonoFormateado);
        console.log("Desde:", process.env.TWILIO_PHONE_NUMBER);
        console.log("SID cargado:", process.env.TWILIO_ACCOUNT_SID ? "sí" : "NO -- undefined");

        const resultado = await client.messages.create({
            body: mensaje,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: telefonoFormateado,
        });
        return resultado;
    } catch (error) {
        // Un SMS fallido NO debe tronar la acción principal (aceptar la
        // cotización) -- solo lo registramos, no lo relanzamos con throw.
        console.error("Error al enviar SMS:", error.message, error.code);
        console.error("Error al enviar SMS:", error.message);
        return null;
    }
};