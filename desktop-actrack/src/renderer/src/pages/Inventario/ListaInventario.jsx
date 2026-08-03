import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Icon from "../../components/Icon";

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

    if (loading) return <p className="page">Cargando...</p>;

    const inventarioConDatos = inventario.map((item) => {
        const categoria = categorias.find((c) => c.id === item.cat_id);
        return {
            ...item,
            nombreCategoria: categoria?.nombre || "—",
            stockBajo: Number(item.stock_actual) <= Number(item.stock_minimo),
        };
    });

    return (
        <div className="page">
            <Link to="/home" className="page-back">← Inicio</Link>
            <div className="page-header">
                <h2>Inventario y Almacén</h2>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                    <Link to="/inventario/nuevo"><button className="btn-primary">+ Nuevo Artículo</button></Link>
                    <Link to="/inventario/movimiento"><button>Registrar Movimiento</button></Link>
                    <Link to="/inventario/vehiculos"><button>Inventario en Vehículos</button></Link>
                </div>
            </div>

            {error && <p className="error-text">{error}</p>}

            {inventarioConDatos.length === 0 ? (
                <div className="panel empty-state">
                    <p className="empty-state-title">Todavía no hay artículos registrados</p>
                    <p className="empty-state-description">Agrega tu primer artículo de inventario.</p>
                </div>
            ) : (
                <div className="table-wrap">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Nombre</th>
                                <th>Categoría</th>
                                <th>Stock actual</th>
                                <th>Stock mínimo</th>
                                <th>Precio</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inventarioConDatos.map((item) => (
                                <tr key={item.id} className={item.stockBajo ? "row-alert" : ""}>
                                    <td>{item.codigo}</td>
                                    <td>{item.nombre}</td>
                                    <td>{item.nombreCategoria}</td>
                                    <td style={{ color: item.stockBajo ? "var(--color-danger-text)" : "inherit", fontWeight: item.stockBajo ? "bold" : "normal" }}>
                                        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                                            {item.stock_actual}
                                            {item.stockBajo && <Icon name="warning" className="icon-sm" style={{ color: "var(--color-danger-text)" }} />}
                                        </span>
                                    </td>
                                    <td>{item.stock_minimo}</td>
                                    <td>
                                        {new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(item.precio_venta)}
                                    </td>
                                    <td>
                                        <Link to={`/inventario/${item.id}/editar`}>
                                            <button className="btn-sm">Editar</button>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ListaInventario;