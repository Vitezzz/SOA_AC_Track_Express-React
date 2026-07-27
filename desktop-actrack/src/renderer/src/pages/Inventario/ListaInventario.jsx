import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ListaInventario = () => {
    const [inventario, setInventario] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const { apiFetch } = useAuth();

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const [resInv, resCat] = await Promise.all([
                    apiFetch("/api/inventario"),
                    apiFetch("/api/categoriaInventario"),
                ]);

                if (!resInv.ok) throw new Error("No se pudo cargar el inventario");
                setInventario(await resInv.json());

                if (resCat.ok) setCategorias(await resCat.json());
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        cargarDatos();
    }, []);

    if (loading) return <p style={{ padding: "24px" }}>Cargando...</p>;

    const inventarioConDatos = inventario.map((item) => {
        const categoria = categorias.find((c) => c.id === item.cat_id);
        return {
            ...item,
            nombreCategoria: categoria?.nombre || "—",
            stockBajo: Number(item.stock_actual) <= Number(item.stock_minimo),
        };
    });

    return (
        <div style={{ padding: "24px" }}>
            <Link to="/home">← Inicio</Link>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2>Inventario y Almacén</h2>
                <div style={{ display: "flex", gap: "8px" }}>
                    <Link to="/inventario/nuevo"><button>+ Nuevo Artículo</button></Link>
                    <Link to="/inventario/movimiento"><button>Registrar Movimiento</button></Link>
                </div>
            </div>

            {error && <p style={{ color: "red" }}>{error}</p>}

            {inventarioConDatos.length === 0 ? (
                <p>Todavía no hay artículos registrados.</p>
            ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "16px" }}>
                    <thead>
                        <tr style={{ textAlign: "left", borderBottom: "2px solid #e5e7eb" }}>
                            <th style={{ padding: "8px" }}>Código</th>
                            <th style={{ padding: "8px" }}>Nombre</th>
                            <th style={{ padding: "8px" }}>Categoría</th>
                            <th style={{ padding: "8px" }}>Stock actual</th>
                            <th style={{ padding: "8px" }}>Stock mínimo</th>
                            <th style={{ padding: "8px" }}>Precio</th>
                            <th style={{ padding: "8px" }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {inventarioConDatos.map((item) => (
                            <tr
                                key={item.id}
                                style={{
                                    borderBottom: "1px solid #f3f4f6",
                                    background: item.stockBajo ? "#fef2f2" : "transparent",
                                }}
                            >
                                <td style={{ padding: "8px" }}>{item.codigo}</td>
                                <td style={{ padding: "8px" }}>{item.nombre}</td>
                                <td style={{ padding: "8px" }}>{item.nombreCategoria}</td>
                                <td style={{ padding: "8px", color: item.stockBajo ? "#b91c1c" : "inherit", fontWeight: item.stockBajo ? "bold" : "normal" }}>
                                    {item.stock_actual} {item.stockBajo && "⚠️"}
                                </td>
                                <td style={{ padding: "8px" }}>{item.stock_minimo}</td>
                                <td style={{ padding: "8px" }}>
                                    {new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(item.precio_venta)}
                                </td>
                                <td style={{ padding: "8px" }}>
                                    <Link to={`/inventario/${item.id}/editar`}>
                                        <button>Editar</button>
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default ListaInventario;