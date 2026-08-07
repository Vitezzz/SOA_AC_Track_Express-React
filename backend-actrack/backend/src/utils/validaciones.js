// Valida que el teléfono tenga exactamente 10 dígitos, sin importar cómo
// lo haya escrito la persona (con espacios, guiones, paréntesis, etc.)
export const validarTelefonoMX = (telefono) => {
    if (!telefono) return false;
    const soloDigitos = telefono.replace(/\D/g, '');
    return soloDigitos.length === 10;
}