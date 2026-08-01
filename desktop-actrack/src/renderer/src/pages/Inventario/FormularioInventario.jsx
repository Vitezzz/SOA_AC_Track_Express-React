import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const FormularioInventario = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { apiFetch } = useAuth();
    const esEdicion = Boolean(id);

    const [categorias, setCategorias] = useState([]);
    const [catId, setCatId] = useState("");
    const [codigo, setCodigo] = useState("");
    const [nombre, setNombre] = useState("");
    const [unidadMedida, setUnidadMedida] = useState("");
    const [stockActual, setStockActual] = useState("");
    const [stockMinimo, setStockMinimo] = useState("");
    const [precioVenta, setPrecioVenta] = useState("");

    const [loading, setLoading] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const peticiones = [apiFetch("/api/categoriaInventario")];
                if (esEdicion) peticiones.push(apiFetch(`/api/inventario/${id}`));

                const [resCategorias, resItem] = await Promise.all(peticiones);
                if (resCategorias.ok) setCategorias(await resCategorias.json());

                if (esEdicion) {
                    if (!resItem.ok) throw new Error("No se pudo cargar el artículo");
                    const data = await resItem.json();
                    setCatId(data.cat_id);
                    setCodigo(data.codigo || "");
                    setNombre(data.nombre);
                    setUnidadMedida(data.unidad_medida || "");
                    setStockActual(data.stock_actual);
                    setStockMinimo(data.stock_minimo);
                    setPrecioVenta(data.precio_venta);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        cargarDatos();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!nombre || !catId) {
            setError("Nombre y categoría son obligatorios");
            return;
        }

        setGuardando(true);
        try {
            const url = esEdicion ? `/api/inventario/${id}` : "/api/inventario";
            const res = await apiFetch(url, {
                method: esEdicion ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    cat_id: Number(catId),
                    codigo,
                    nombre,
                    unidad_medida: unidadMedida,
                    stock_actual: Number(stockActual) || 0,
                    precio_venta: Number(precioVenta) || 0,
                    stock_minimo: Number(stockMinimo) || 0,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "No se pudo guardar el artículo");

            navigate("/inventario");
        } catch (err) {
            setError(err.message);
        } finally {
            setGuardando(false);
        }
    };

    if (loading) return <p className="page">Cargando...</p>;

    return (
        <div className="page page-narrow">
            <h2>{esEdicion ? "Editar" : "Nuevo"} Artículo</h2>

            {error && <p className="error-text">{error}</p>}

            <form onSubmit={handleSubmit} className="form">
                <label>
                    <span>Categoría *</span>
                    <select value={catId} onChange={(e) => setCatId(e.target.value)}>
                        <option value="">Selecciona una categoría</option>
                        {categorias.map((c) => (
                            <option key={c.id} value={c.id}>{c.nombre}</option>
                        ))}
                    </select>
                </label>

                <label>
                    <span>Código</span>
                    {esEdicion ? (
                        <input value={codigo} disabled />
                    ) : (
                        <p className="hint-text">Se genera automáticamente al guardar</p>
                    )}
                </label>
                <label>
                    <span>Nombre *</span>
                    <input value={nombre} onChange={(e) => setNombre(e.target.value)} />
                </label>

                <label>
                    <span>Unidad de medida</span>
                    <input value={unidadMedida} onChange={(e) => setUnidadMedida(e.target.value)} placeholder="pza, kg, litro..." />
                </label>

                <label>
                    <span>Stock actual</span>
                    <input type="number" min="0" value={stockActual} onChange={(e) => setStockActual(e.target.value)} />
                </label>

                <label>
                    <span>Stock mínimo</span>
                    <input type="number" min="0" value={stockMinimo} onChange={(e) => setStockMinimo(e.target.value)} />
                </label>

                <label>
                    <span>Precio de venta</span>
                    <input type="number" step="0.01" min="0" value={precioVenta} onChange={(e) => setPrecioVenta(e.target.value)} />
                </label>

                <div className="form-actions">
                    <button type="submit" disabled={guardando} className="btn-primary">{guardando ? "Guardando..." : "Guardar"}</button>
                    <button type="button" onClick={() => navigate("/inventario")}>Cancelar</button>
                </div>
            </form>
        </div>
    );
};

export default FormularioInventario;