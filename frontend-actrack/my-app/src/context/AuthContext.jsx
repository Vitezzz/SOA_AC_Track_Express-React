import { createContext, useContext, useState, useEffect } from "react";

//Crea el contenedor global 
const AuthContext = createContext();

//Este es el componente que envolvera a todo App.jsx y proveera el estado global
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    //empieza en true, sirve para mostrar un spinner mientras se verifica la sesión
    const [loading, setLoading] = useState(true)

    //Hace un get a la /api/auth/profile con la cookie de sesion
    useEffect(() => {
        fetch("/api/auth/profile", { credentials: "include" })
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
                //Si el backend responde ok, guarda usuario en setUser(data)
                if (data) setUser(data)
                setLoading(false)
            })
            .catch(() => setLoading(false)) //atrapa cualquier error de red (no de respuesta HTTP),eso ya lo maneja el res.ok

            //el vacio final [], hace que solo se ejecute una vez al montar la app
    }, [])

    const login = async (email ,password ) => {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers : {"Content-Type": "application/json"},
            body: JSON.stringify({ email, password}),
            credentials: "include", //le dice al servidor "incluye las cookies en esta petición aunque sea otro dominio"
                                    //Sin esto el backend nunca recibe la cookie de sesión y responde como si estuvieras autenticado
        })

        //Espera a que el servidor responda y convierte la respuesta a JSON
        const data = await res.json();

        if(!res.ok) throw new Error(data.message || "Credenciales incorrectas")

        //Obtener perfil completo
        const profileRes = await fetch("/api/auth/profile", { credentials: "include"})
        const profile= await profileRes.json()
        //SI todo salio bien , data es el objeto del usuario
        //lo guardo en el estado global
        setUser(profile)
        return profile
    }

    /* Lee lacookie de sesión (JWT) , la invalida
    o la borra y responde con un JSON*/
    const logout = async() => {
        const res = await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: "include"
        })

         const data = await res.json();

         if(!res.ok) throw new Error(data.message || 'Error de logout');

         setUser(null)
         return data
    }

    //formData no es palabra reservada, es nombre del parametro
    const register = async(formData) => {
        const res =await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify(formData),
            credentials: "include",
        })

        const data = await res.json()

        if(!res.ok) throw new Error(data.message || "Error al registrarse")

        return data
    }

    return(
        //Todo lo que este dentro de <AuthContext.Provider> en App.jsx le provee user y loading
        <AuthContext.Provider value={{ user, loading, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext);