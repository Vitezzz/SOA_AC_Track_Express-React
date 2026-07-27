import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Si no hay sesión (estás en Login), no mostramos nada
    if (!user) return null;

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <nav
            style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 24px",
                borderBottom: "1px solid #e5e7eb",
            }}
        >
            <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                <Link to="/home" style={{ fontWeight: "bold" }}>AC Track</Link>
                <Link to="/ordenes">Órdenes</Link>
                <Link to="/clientes">Clientes y Equipos</Link>
                <Link to="/cotizaciones">Cotizaciones</Link>
                <Link to="/pagos">Pagos</Link>
                <Link to="/tecnicos">Técnicos</Link>
                <Link to="/mantenimiento">Mantenimiento</Link>
                <Link to="/inventario">Inventario</Link>
                <Link to="/configuracion">Configuración</Link>
            </div>

            <div>
                <span style={{ marginRight: "16px" }}>{user.nombre}</span>
                <button onClick={handleLogout}>Cerrar sesión</button>
            </div>
        </nav>
    );
};

export default Navbar;