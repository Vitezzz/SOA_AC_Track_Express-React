import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Lo inverso de ProtectedRoute: Login/SignUp no revisaban si ya había
// sesión -- si terminabas en "/" estando logueado (botón "atrás" del
// navegador, un link viejo, etc.), Navigation SÍ mostraba la barra completa
// (usa el mismo "user" del contexto, sin importar la ruta) pero encima
// seguía el formulario de Login, una mezcla rota de ambas pantallas.
const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="flex justify-center mt-20">
            <span className="loading loading-spinner loading-lg"></span>
        </div>
    }

    if (user) {
        return <Navigate to="/home" replace />;
    }

    return children;
};

export default PublicRoute;
