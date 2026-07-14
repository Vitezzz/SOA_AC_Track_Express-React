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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card>
        <form onSubmit={handleSubmit} className="space-y-5">
          <h1 className="text-2xl font-semibold text-gray-900 text-center mb-6">Iniciar Sesión</h1>
          <label className="form-control w-full">
            <span className="text-sm font-medium text-gray-700 mb-1 block">Email</span>
            <input
              type="email"
              className="input input-bordered w-full rounded-lg border-gray-200 focus:border-gray-400 focus:ring-0"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="form-control w-full">
            <span className="text-sm font-medium text-gray-700 mb-1 block">Contraseña</span>
            <input
              type="password"
              className="input input-bordered w-full rounded-lg border-gray-200 focus:border-gray-400 focus:ring-0"
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
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button
            type="submit"
            className="btn w-full bg-gray-900 text-white hover:bg-gray-800 border-none rounded-lg py-3"
            disabled={loading}
          >
            {loading ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              "Ingresar"
            )}
          </button>
          <a href="/api/auth/google" className="btn w-full bg-white text-gray-700 border
          border-gray-200 hover:bg-gray-50 rounded-lg py-3">Iniciar Sesión con Google</a>
        </form>
      </Card>
    </div>
  );
};

export default Login;
