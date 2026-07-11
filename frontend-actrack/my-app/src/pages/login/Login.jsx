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
    <div className="flex justify-center items-center min-h-64">
      <Card>
        <form onSubmit={handleSubmit} className="card-body">
          <h1 className="card-title text-2xl justify-center">Login</h1>
          <label className="form-control w-full">
            <span className="label-text">Email</span>
            <input
              type="email"
              className="input input-bordered w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="form-control w-full">
            <span className="label-text">Contraseña</span>
            <input
              type="password"
              className="input input-bordered w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <label>No tienes una cuenta? <Link to="/signup" className="text-primary hover:text-secondary transition-colors duration-200">Registrate aqui</Link></label>
          {error && <p className="text-error text-sm mt-2">{error}</p>}
          <button
            type="submit"
            className="btn btn-primary mt-4"
            disabled={loading}
          >
            {loading ? (
              <span className="loading loading-spinner" />
            ) : (
              "Ingresar"
            )}
          </button>
        </form>
      </Card>
    </div>
  );
};

export default Login;
