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

    if (loading) return <p style={{ padding: "24px" }}>Cargando...</p>;

    return (
        <div style={{ padding: "24px", maxWidth: "480px" }}>
            <h2>{esEdicion ? "Editar" : "Nuevo"} Artículo</h2>

            {error && <p style={{ color: "red" }}>{error}</p>}

            <form onSubmit={handleSubmit}>
                <label style={{ display: "block", marginBottom: "12px" }}>
                    <span style={{ display: "block", marginBottom: "4px" }}>Categoría *</span>
                    <select value={catId} onChange={(e) => setCatId(e.target.value)} style={{ width: "100%", padding: "8px" }}>
                        <option value="">Selecciona una categoría</option>
                        {categorias.map((c) => (
                            <option key={c.id} value={c.id}>{c.nombre}</option>
                        ))}
                    </select>
                </label>

                <label style={{ display: "block", marginBottom: "12px" }}>
                    <span style={{ display: "block", marginBottom: "4px" }}>Código</span>
                    {esEdicion ? (
                        <input value={codigo} disabled style={{ width: "100%", padding: "8px", background: "#f3f4f6" }} />
                    ) : (
                        <p style={{ color: "#6b7280", fontSize: "13px" }}>Se genera automáticamente al guardar</p>
                    )}
                </label>
                <label style={{ display: "block", marginBottom: "12px" }}>
                    <span style={{ display: "block", marginBottom: "4px" }}>Nombre *</span>
                    <input value={nombre} onChange={(e) => setNombre(e.target.value)} style={{ width: "100%", padding: "8px" }} />
                </label>

                <label style={{ display: "block", marginBottom: "12px" }}>
                    <span style={{ display: "block", marginBottom: "4px" }}>Unidad de medida</span>
                    <input value={unidadMedida} onChange={(e) => setUnidadMedida(e.target.value)} placeholder="pza, kg, litro..." style={{ width: "100%", padding: "8px" }} />
                </label>

                <label style={{ display: "block", marginBottom: "12px" }}>
                    <span style={{ display: "block", marginBottom: "4px" }}>Stock actual</span>
                    <input type="number" min="0" value={stockActual} onChange={(e) => setStockActual(e.target.value)} style={{ width: "100%", padding: "8px" }} />
                </label>

                <label style={{ display: "block", marginBottom: "12px" }}>
                    <span style={{ display: "block", marginBottom: "4px" }}>Stock mínimo</span>
                    <input type="number" min="0" value={stockMinimo} onChange={(e) => setStockMinimo(e.target.value)} style={{ width: "100%", padding: "8px" }} />
                </label>

                <label style={{ display: "block", marginBottom: "12px" }}>
                    <span style={{ display: "block", marginBottom: "4px" }}>Precio de venta</span>
                    <input type="number" step="0.01" min="0" value={precioVenta} onChange={(e) => setPrecioVenta(e.target.value)} style={{ width: "100%", padding: "8px" }} />
                </label>

                <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
                    <button type="submit" disabled={guardando}>{guardando ? "Guardando..." : "Guardar"}</button>
                    <button type="button" onClick={() => navigate("/inventario")}>Cancelar</button>
                </div>
            </form>
        </div>
    );
};

export default FormularioInventario;