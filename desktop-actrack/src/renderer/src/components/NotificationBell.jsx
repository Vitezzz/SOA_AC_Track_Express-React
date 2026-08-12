import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotificaciones } from "../hooks/useNotificaciones";
import Icon from "./Icon";

// A dónde mandar al admin según el tipo de notificación -- todo lo que le
// llega a admin/supervisor hoy (nueva_orden, solicitud_cliente) se resuelve
// desde Gestión de Órdenes, así que por ahora es el mismo destino para
// todas. Si en el futuro hay más tipos, aquí se separan.
const destinoPorTipo = () => "/ordenes";

const NotificationBell = () => {
    const { notificaciones, noLeidas, marcarLeida } = useNotificaciones();
    const navigate = useNavigate();
    const [abierto, setAbierto] = useState(false);
    const [toast, setToast] = useState(null);
    const vistosRef = useRef(new Set());
    const primeraCargaRef = useRef(true);
    const contenedorRef = useRef(null);

    // En cuanto aparece una notificación nueva (id que no habíamos visto),
    // se muestra un toast unos segundos -- sin esto, enterarte de una orden
    // nueva depende de que se te ocurra abrir la campanita o Gestión de
    // Órdenes por tu cuenta.
    useEffect(() => {
        if (primeraCargaRef.current) {
            notificaciones.forEach((n) => vistosRef.current.add(n.id));
            primeraCargaRef.current = false;
            return;
        }

        const nueva = notificaciones.find((n) => !n.leido && !vistosRef.current.has(n.id));
        notificaciones.forEach((n) => vistosRef.current.add(n.id));

        if (nueva) {
            setToast(nueva);
            const timeout = setTimeout(() => setToast(null), 6000);
            return () => clearTimeout(timeout);
        }
    }, [notificaciones]);

    useEffect(() => {
        if (!abierto) return;
        const cerrarSiClickAfuera = (e) => {
            if (contenedorRef.current && !contenedorRef.current.contains(e.target)) setAbierto(false);
        };
        document.addEventListener("mousedown", cerrarSiClickAfuera);
        return () => document.removeEventListener("mousedown", cerrarSiClickAfuera);
    }, [abierto]);

    const irA = (notificacion) => {
        marcarLeida(notificacion);
        setAbierto(false);
        setToast(null);
        navigate(destinoPorTipo(notificacion.tipo));
    };

    return (
        <>
            {toast && (
                <button className="notif-toast" onClick={() => irA(toast)} type="button">
                    <strong>Nueva notificación</strong>
                    <span>{toast.titulo}</span>
                </button>
            )}

            <div className="notif-bell-wrap" ref={contenedorRef}>
                <button type="button" className="notif-bell" onClick={() => setAbierto((v) => !v)}>
                    <Icon name="bell" className="icon-sm" />
                    {noLeidas > 0 && <span className="notif-badge">{noLeidas > 9 ? "9+" : noLeidas}</span>}
                </button>

                {abierto && (
                    <div className="notif-dropdown">
                        <p className="notif-dropdown-title">Notificaciones</p>
                        {notificaciones.length === 0 ? (
                            <p className="notif-dropdown-empty">No tienes notificaciones.</p>
                        ) : (
                            notificaciones
                                .slice()
                                .reverse()
                                .slice(0, 20)
                                .map((n) => (
                                    <button
                                        key={n.id}
                                        type="button"
                                        className={n.leido ? "notif-item" : "notif-item notif-item-nueva"}
                                        onClick={() => irA(n)}
                                    >
                                        {n.titulo}
                                    </button>
                                ))
                        )}
                    </div>
                )}
            </div>
        </>
    );
};

export default NotificationBell;
