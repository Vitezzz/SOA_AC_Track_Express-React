import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

// 15s -- rápido para que se sienta "en vivo" sin martillar el backend.
const INTERVALO_MS = 15000;

// GET /api/notificaciones para admin/supervisor regresa TODAS (para poder
// dar soporte), no solo las propias -- aquí nos quedamos solo con las del
// usuario logueado, si no la campanita mostraría hasta los pings de
// "técnico en camino" de órdenes ajenas.
export const useNotificaciones = () => {
    const { apiFetch, user } = useAuth();
    const [notificaciones, setNotificaciones] = useState([]);
    const [error, setError] = useState("");

    const cargar = useCallback(async () => {
        if (!user) return;
        try {
            const res = await apiFetch("/api/notificaciones");
            if (res.status === 404) {
                setNotificaciones([]);
                return;
            }
            if (!res.ok) throw new Error("No se pudieron cargar las notificaciones");
            const todas = await res.json();
            setNotificaciones(todas.filter((n) => n.usu_id === user.id));
        } catch (err) {
            setError(err.message);
        }
    }, [apiFetch, user]);

    useEffect(() => {
        (async () => {
            await cargar();
        })();
        const intervalo = setInterval(cargar, INTERVALO_MS);
        return () => clearInterval(intervalo);
    }, [cargar]);

    const marcarLeida = async (notificacion) => {
        if (notificacion.leido) return;
        setNotificaciones((prev) => prev.map((n) => (n.id === notificacion.id ? { ...n, leido: true } : n)));
        try {
            await apiFetch(`/api/notificaciones/${notificacion.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...notificacion, leido: true }),
            });
        } catch {
            cargar();
        }
    };

    const noLeidas = notificaciones.filter((n) => !n.leido).length;

    return { notificaciones, noLeidas, marcarLeida, error, recargar: cargar };
};
