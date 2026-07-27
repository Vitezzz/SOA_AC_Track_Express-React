import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

// A diferencia de la web (donde usamos rutas relativas gracias al proxy de
// Vite), aquí necesitamos la URL completa -- Electron no tiene ese proxy.
const API_URL = "http://localhost:3000";

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    // El token vive en memoria (useState) Y en localStorage, para que
    // sobreviva si cierras y vuelves a abrir la app.
    const [token, setToken] = useState(() => localStorage.getItem("token"));

    useEffect(() => {
        const verificarSesion = async () => {
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                const res = await apiFetch("/api/auth/profile");
                if (res.ok) {
                    setUser(await res.json());
                } else {
                    // Token viejo/inválido -- lo limpiamos
                    localStorage.removeItem("token");
                    setToken(null);
                }
            } catch {
                // Sin conexión, o backend caído -- no tronamos la app
            } finally {
                setLoading(false);
            }
        };
        verificarSesion();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const login = async (email, password) => {
        const res = await fetch(`${API_URL}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Credenciales incorrectas");

        // Guardamos el token en los 2 lugares: memoria (para usarlo ya) y
        // localStorage (para que sobreviva a cerrar la app).
        localStorage.setItem("token", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        setToken(data.accessToken);

        const perfilRes = await apiFetchConToken(data.accessToken, "/api/auth/profile");
        const perfil = await perfilRes.json();
        setUser(perfil);
        return perfil;
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        setToken(null);
        setUser(null);
    };

    // Función interna: igual que apiFetch, pero recibe el token explícito
    // en vez de leerlo del estado -- la necesitamos justo después de hacer
    // login, antes de que el estado "token" termine de actualizarse.
    const apiFetchConToken = async (tokenAUsar, url, options = {}) => {
        return fetch(`${API_URL}${url}`, {
            ...options,
            headers: {
                ...options.headers,
                Authorization: `Bearer ${tokenAUsar}`,
            },
        });
    };

    const apiFetch = async (url, options = {}) => {
        const res = await apiFetchConToken(token, url, options);

        if (res.status !== 401) return res;

        // Igual que en la web: si el token expiró, intentamos renovar con
        // el refreshToken antes de rendirnos.
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
            logout();
            return res;
        }

        const refreshRes = await fetch(`${API_URL}/api/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
        });

        if (!refreshRes.ok) {
            logout();
            return res;
        }

        const refreshData = await refreshRes.json();
        localStorage.setItem("token", refreshData.accessToken);
        setToken(refreshData.accessToken);

        return apiFetchConToken(refreshData.accessToken, url, options);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, apiFetch, setUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);