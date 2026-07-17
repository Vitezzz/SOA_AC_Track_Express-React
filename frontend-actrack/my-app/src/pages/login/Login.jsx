import { Card } from "../../components/Card.jsx";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from '../../context/AuthContext.jsx'

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  //Navigate
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password)
      navigate("/home");
    } catch (err) {
      setError(err.message)
      console.log('Error:', err.message)
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell">
      <Card>
        <form onSubmit={handleSubmit} className="space-y-5">
          <h1 className="page-title text-center">Iniciar Sesión</h1>
          <label className="form-control w-full">
            <span className="form-label">Email</span>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="form-control w-full">
            <span className="form-label">Contraseña</span>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <label className="block text-sm text-gray-500 text-center">
            No tienes una cuenta?{" "}
            <Link to="/signup" className="text-gray-900 font-medium hover:text-gray-600 transition-colors">
              Regístrate aquí
            </Link>
          </label>
          {error && <p className="form-error">{error}</p>}
          <button
            type="submit"
            className="btn-primary w-full py-3"
            disabled={loading}
          >
            {loading ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              "Ingresar"
            )}
          </button>
          <a href="/api/auth/google" className="btn-secondary w-full py-3">Iniciar Sesión con Google</a>
        </form>
      </Card>
    </div>
  );
};

export default Login;
