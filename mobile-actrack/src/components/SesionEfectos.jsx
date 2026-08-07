import { useAuth } from '../context/AuthContext';
import { usePushRegistration } from '../hooks/usePushRegistration';
import { useUbicacionEnVivo } from '../hooks/useUbicacionEnVivo';

// No renderiza nada -- solo dispara los efectos de sesión (registrar el
// token de push, mandar ubicación en vivo) mientras haya un técnico
// logueado, sin importar en qué pantalla esté parado.
export default function SesionEfectos() {
  const { user, apiFetch } = useAuth();
  usePushRegistration(user, apiFetch);
  useUbicacionEnVivo(user, apiFetch);
  return null;
}
