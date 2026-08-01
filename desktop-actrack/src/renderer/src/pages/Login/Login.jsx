import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const { login, user } = useAuth();
    const navigate = useNavigate();

    // Si ya hay sesión activa (token guardado de una vez anterior), no
    // tiene sentido mostrar el formulario -- mandamos directo a Home.
    useEffect(() => {
        if (user) navigate("/home");
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSubmitting(true);
        try {
            await login(email, password);
            navigate("/home");
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="auth-shell">
            <div className="auth-card">
                <div className="auth-brand-mark">AC</div>
                <h1 style={{ fontSize: "1.25rem", marginBottom: "0.25rem" }}>AC Track — Escritorio</h1>
                <p className="muted-text" style={{ marginBottom: "1.5rem" }}>Panel interno para el equipo de servicio.</p>

                {error && <p className="error-text">{error}</p>}

                <form onSubmit={handleSubmit} className="form">
                    <label>
                        <span>Email</span>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </label>

                    <label>
                        <span>Contraseña</span>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </label>

                    <button type="submit" disabled={submitting} className="btn-primary" style={{ width: "100%", marginTop: "0.5rem" }}>
                        {submitting ? "Entrando..." : "Iniciar sesión"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;