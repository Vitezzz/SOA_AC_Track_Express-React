import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

const ESTILOS_ESTADO = {
    borrador: "badge-status-neutral",
    enviada: "badge-status-info",
    aprobada: "badge-status-success",
    rechazada: "badge-status-danger",
};

// Intl.NumberFormat: herramienta nativa de JS para formatear números como
// dinero, respetando el formato de la región (comas, símbolo de moneda, etc.)
const formatoMoneda = (valor) =>
    new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(valor);

const Cotizaciones = () => {
    const [cotizaciones, setCotizaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [procesandoId, setProcesandoId] = useState(null); // para deshabilitar botones mientras se envía

    const { apiFetch } = useAuth();

    useEffect(() => {
        const cargarCotizaciones = async () => {
            try {
                const res = await apiFetch("/api/cotizaciones");

                // Caso especial de este endpoint: 404 = "no tienes cotizaciones",
                // no es un error real, así que no lo tratamos como tal.
                if (res.status === 404) {
                    setCotizaciones([]);
                    return;
                }

                if (!res.ok) throw new Error("No se pudieron cargar tus cotizaciones");
                setCotizaciones(await res.json());
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        cargarCotizaciones();
    }, []);

    const responder = async (cotizacion, nuevoEstado) => {
        setError("");
        setProcesandoId(cotizacion.id);
        try {
            const res = await apiFetch(`/api/cotizaciones/${cotizacion.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ord_id: cotizacion.ord_id,
                    tec_id: cotizacion.tec_id,
                    cli_id: cotizacion.cli_id,
                    folio: cotizacion.folio,
                    estado: nuevoEstado,
                    total: cotizacion.total,
                    notas: cotizacion.notas,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "No se pudo actualizar la cotización");

            // Actualizamos solo esa cotización en el estado local, sin
            // tener que volver a pedir la lista completa al backend.
            setCotizaciones((prev) =>
                prev.map((c) => (c.id === cotizacion.id ? { ...c, estado: nuevoEstado } : c))
            );
        } catch (err) {
            setError(err.message);
        } finally {
            setProcesandoId(null);
        }
    };

    if (loading) return <p className="text-center mt-10">Cargando...</p>;

    return (
        <div className="page-container">
            <h2 className="page-title">Mis Cotizaciones</h2>

            {error && <p className="form-error mb-4">{error}</p>}

            {cotizaciones.length === 0 ? (
                <p className="text-gray-500 text-center">Todavía no tienes cotizaciones.</p>
            ) : (
                <div className="space-y-4">
                    {cotizaciones.map((cot) => {
                        const clase = ESTILOS_ESTADO[cot.estado] || "badge-status-neutral";
                        return (
                            <div key={cot.id} className="panel">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-semibold text-gray-900">Folio: {cot.folio}</span>
                                    <span className={`badge-status ${clase}`}>
                                        {cot.estado}
                                    </span>
                                </div>
                                <p className="text-gray-900 text-lg font-semibold mb-1">
                                    {formatoMoneda(cot.total)}
                                </p>
                                {cot.notas && <p className="text-gray-600 text-sm mb-4">{cot.notas}</p>}

                                {/* Solo mostramos los botones si la cotización está
                                    esperando respuesta del cliente. Si ya está en
                                    'borrador', 'aprobada' o 'rechazada', no aplica. */}
                                {cot.estado === "enviada" && (
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => responder(cot, "aprobada")}
                                            disabled={procesandoId === cot.id}
                                            className="btn-primary flex-1 py-2"
                                        >
                                            Aceptar
                                        </button>
                                        <button
                                            onClick={() => responder(cot, "rechazada")}
                                            disabled={procesandoId === cot.id}
                                            className="btn-secondary flex-1 py-2"
                                        >
                                            Rechazar
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Cotizaciones;