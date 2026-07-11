import  { Navigate} from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth()

    //Mientras se verifica la sesión (el fetch), muestra un spinner centrado
    if(loading){
        return <div className="flex justify-center mt-20">
            <span className="loading loading-spinner loading-lg"></span>
        </div>
    }

    //Si no hya usuario redirige a / con replace
    //El replace evita que el usuario pueda usar "volver atras del navegador para volver a la ruta protegida"
    if(!user){
        return <Navigate to="/" replace/>
    }

    //Si hay usuario renderiza el contenido normal
    return children
}

export default ProtectedRoute