import { ETAPAS_ORDEN, indiceProgreso } from "../utils/ordenesProgreso";

const ETIQUETAS = {
    pendiente: "Pendiente",
    en_proceso: "En proceso",
    completada: "Completada",
    pagada: "Pagada",
};

const LineaTiempoEstado = ({ estatus, historial = [] }) => {
    if (estatus === "cancelada") {
        return (
            <div className="flex items-center gap-2 text-red-600 text-xs font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                Orden cancelada
            </div>
        );
    }

    const actual = indiceProgreso(historial);

    return (
        <div>
            <div className="flex items-center">
                {ETAPAS_ORDEN.map((etapa, index) => {
                    // Ya NO asumimos "si llegaste a X, pasaste por todo lo anterior"
                    // -- solo marcamos como alcanzado lo que el historial real dice
                    // que de verdad ocurrió para esta orden.
                    const alcanzada = historial.includes(etapa);
                    const esActual = index === actual;
                    const esUltima = index === ETAPAS_ORDEN.length - 1;
                    return (
                        <div key={etapa} className="flex items-center flex-1 last:flex-none">
                            <div className="flex flex-col items-center">
                                <div
                                    className="w-3.5 h-3.5 rounded-full border-2"
                                    style={{
                                        backgroundColor: alcanzada ? "var(--color-accent)" : "#fff",
                                        borderColor: alcanzada ? "var(--color-accent)" : "#d1d5db",
                                        boxShadow: esActual ? "0 0 0 3px var(--color-accent-soft-strong)" : "none",
                                    }}
                                />
                                <span
                                    className={`text-[11px] mt-1 whitespace-nowrap ${
                                        alcanzada ? "font-medium" : "text-gray-400"
                                    }`}
                                    style={alcanzada ? { color: "var(--color-accent-hover)" } : undefined}
                                >
                                    {ETIQUETAS[etapa]}
                                </span>
                            </div>
                            {!esUltima && (
                                <div
                                    className="flex-1 h-0.5 mx-1 mb-4"
                                    style={{ backgroundColor: alcanzada ? "var(--color-accent)" : "#e5e7eb" }}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
            {actual >= 0 && (
                <p className="text-[11px] mt-1" style={{ color: "var(--color-text-subtle)" }}>
                    Paso {actual + 1} de {ETAPAS_ORDEN.length}
                </p>
            )}
        </div>
    );
};

export default LineaTiempoEstado;
