const formatearEncabezado = (key) =>
    key
        .replace(/_/g, " ")
        .replace(/\b\w/g, (letra) => letra.toUpperCase());

const formatearValor = (valor) => {
    if (typeof valor === "boolean") {
        return (
            <span
                className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    valor ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                }`}
            >
                {valor ? "Sí" : "No"}
            </span>
        );
    }
    if (valor === null || valor === undefined || valor === "") {
        return <span className="text-gray-300">—</span>;
    }
    return valor;
};

const Table = ({ object }) => {
    // Defensivo: si el arreglo viene vacío, no truena intentando leer
    // las llaves de un elemento que no existe.
    if (!object || object.length === 0) return null;

    return (
        <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
            <table className="w-full text-sm text-left">
                <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="px-4 py-3 font-medium text-gray-500 w-10">#</th>
                        {Object.keys(object[0]).map((key) => (
                            <th key={key} className="px-4 py-3 font-medium text-gray-500 whitespace-nowrap">
                                {formatearEncabezado(key)}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    <Item object={object} />
                </tbody>
            </table>
        </div>
    );
};

const Item = ({ object }) => {
    return (
        <>
            {object.map((item, index) => (
                <tr
                    key={item.id ?? index}
                    className="border-b border-gray-50 last:border-none hover:bg-gray-50/60 transition-colors"
                >
                    <td className="px-4 py-3 text-gray-400">{index + 1}</td>
                    {Object.values(item).map((valor, i) => (
                        <td key={i} className="px-4 py-3 text-gray-700">
                            {formatearValor(valor)}
                        </td>
                    ))}
                </tr>
            ))}
        </>
    );
};

export default Table;