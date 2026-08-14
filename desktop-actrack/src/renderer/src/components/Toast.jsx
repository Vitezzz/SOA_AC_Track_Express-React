import { useEffect } from "react";

const ETIQUETAS = { success: "✓ Listo", error: "⚠ Ups" };

// Aviso flotante fijo (arriba a la derecha, sobre todo lo demás) para
// éxito/error de una acción -- a diferencia de un mensaje de texto normal
// en la página, este se ve sin importar qué tan abajo esté scrolleado el
// usuario, y se puede cerrar tocándolo o esperando a que se cierre solo.
const Toast = ({ tipo = "success", mensaje, onCerrar, duracionMs = 5000 }) => {
    useEffect(() => {
        if (!mensaje) return;
        const timeout = setTimeout(onCerrar, duracionMs);
        return () => clearTimeout(timeout);
    }, [mensaje, duracionMs, onCerrar]);

    if (!mensaje) return null;

    return (
        <button type="button" className={`notif-toast notif-toast--${tipo}`} onClick={onCerrar}>
            <strong>{ETIQUETAS[tipo] || "Aviso"}</strong>
            <span>{mensaje}</span>
        </button>
    );
};

export default Toast;
