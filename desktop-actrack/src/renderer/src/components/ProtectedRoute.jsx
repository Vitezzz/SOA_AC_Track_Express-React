import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// "roles" es opcional -- sin él, cualquier usuario logueado entra (como
// antes). Con él, solo pasan los rol_id listados; el resto rebota a /home
// en vez de a "/" porque ya tienen sesión, solo no les toca esa pantalla.
const ProtectedRoute = ({ children, roles }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", marginTop: "80px" }}>
                Cargando...
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/" replace />;
    }

    if (roles && !roles.includes(user.rol_id)) {
        return <Navigate to="/home" replace />;
    }

    return children;
};

export default ProtectedRoute;