import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
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

    return children;
};

export default ProtectedRoute;