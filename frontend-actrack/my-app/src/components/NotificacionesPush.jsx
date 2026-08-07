import { useEffect, useState } from "react";
import { escucharMensajesEnPrimerPlano } from "../config/firebase";

const NotificacionesPush = () => {
    const [notificacion, setNotificacion] = useState(null);

    useEffect(() => {
        escucharMensajesEnPrimerPlano((payload) => {
            setNotificacion(payload.notification);
            // Se oculta sola después de unos segundos
            setTimeout(() => setNotificacion(null), 6000);
        });
    }, []);

    if (!notificacion) return null;

    return (
        <div style={{
            position: "fixed", top: "16px", right: "16px", background: "#111827", color: "white",
            padding: "12px 16px", borderRadius: "8px", zIndex: 9999, maxWidth: "300px",
        }}>
            <p style={{ fontWeight: "600", marginBottom: "4px" }}>{notificacion.title}</p>
            <p style={{ fontSize: "13px" }}>{notificacion.body}</p>
        </div>
    );
};

export default NotificacionesPush;