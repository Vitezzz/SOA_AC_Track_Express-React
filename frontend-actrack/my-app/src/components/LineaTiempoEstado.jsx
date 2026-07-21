const ETAPAS = [
    { key: "pendiente", label: "Pendiente" },
    { key: "en_proceso", label: "En proceso" },
    { key: "completada", label: "Completada" },
];

const LineaTiempoEstado = ({ estatus }) => {
    // Cancelada es un estado "fuera" de la línea de progreso normal,
    // no tiene sentido mostrarla como un paso más de la secuencia.
    if (estatus === "cancelada") {
        return (
            <div className="flex items-center gap-2 text-red-600 text-xs font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                Orden cancelada
            </div>
        );
    }

    const indiceActual = ETAPAS.findIndex((etapa) => etapa.key === estatus);

    return (
        <div className="flex items-center">
            {ETAPAS.map((etapa, index) => {
                const alcanzada = index <= indiceActual;
                const esUltima = index === ETAPAS.length - 1;
                return (
                    <div key={etapa.key} className="flex items-center flex-1 last:flex-none">
                        <div className="flex flex-col items-center">
                            <div
                                className={`w-3.5 h-3.5 rounded-full border-2 ${
                                    alcanzada ? "bg-gray-900 border-gray-900" : "bg-white border-gray-300"
                                }`}
                            />
                            <span
                                className={`text-[11px] mt-1 whitespace-nowrap ${
                                    alcanzada ? "text-gray-900 font-medium" : "text-gray-400"
                                }`}
                            >
                                {etapa.label}
                            </span>
                        </div>
                        {!esUltima && (
                            <div
                                className={`flex-1 h-0.5 mx-1 mb-4 ${
                                    index < indiceActual ? "bg-gray-900" : "bg-gray-200"
                                }`}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default LineaTiempoEstado;