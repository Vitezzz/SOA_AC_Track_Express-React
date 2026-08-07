import { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../config/env';

// rol_id de técnico en el backend (backend-actrack/backend/src/utils/roleUtils.js) --
// esta app es solo para técnicos, nadie más debería poder entrar.
const ROL_TECNICO = 4;

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restaurarSesion = async () => {
      const tokenGuardado = await SecureStore.getItemAsync('token');
      if (!tokenGuardado) {
        setLoading(false);
        return;
      }
      setToken(tokenGuardado);
      try {
        const res = await apiFetchConToken(tokenGuardado, '/api/auth/profile');
        if (res.ok) {
          setUser(await res.json());
        } else {
          await limpiarSesion();
        }
      } catch {
        // Sin conexión o backend caído -- no tronamos la app, se queda
        // deslogueado y podrá reintentar cuando haya red.
      } finally {
        setLoading(false);
      }
    };
    restaurarSesion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const limpiarSesion = async () => {
    await SecureStore.deleteItemAsync('token');
    await SecureStore.deleteItemAsync('refreshToken');
    setToken(null);
    setUser(null);
  };

  const login = async (email, password) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Credenciales incorrectas');

    const perfilRes = await apiFetchConToken(data.accessToken, '/api/auth/profile');
    const perfil = await perfilRes.json();

    if (perfil.rol_id !== ROL_TECNICO) {
      throw new Error('Esta app es solo para técnicos');
    }

    await SecureStore.setItemAsync('token', data.accessToken);
    await SecureStore.setItemAsync('refreshToken', data.refreshToken);
    setToken(data.accessToken);
    setUser(perfil);
    return perfil;
  };

  const logout = async () => {
    await limpiarSesion();
  };

  // Igual que apiFetch, pero recibe el token explícito en vez de leerlo del
  // estado -- lo necesitamos justo después de login/refresh, antes de que
  // el estado "token" termine de actualizarse.
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

    // El access token expiró -- intentamos renovar con el refresh token
    // antes de rendirnos.
    const refreshToken = await SecureStore.getItemAsync('refreshToken');
    if (!refreshToken) {
      await limpiarSesion();
      return res;
    }

    const refreshRes = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!refreshRes.ok) {
      await limpiarSesion();
      return res;
    }

    const refreshData = await refreshRes.json();
    await SecureStore.setItemAsync('token', refreshData.accessToken);
    setToken(refreshData.accessToken);

    return apiFetchConToken(refreshData.accessToken, url, options);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, apiFetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
