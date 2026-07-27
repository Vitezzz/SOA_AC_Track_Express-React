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
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <form onSubmit={handleSubmit} style={{ width: "320px" }}>
                <h1>AC Track — Escritorio</h1>
                {error && <p style={{ color: "red" }}>{error}</p>}

                <label style={{ display: "block", marginBottom: "12px" }}>
                    <span style={{ display: "block", marginBottom: "4px" }}>Email</span>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ width: "100%", padding: "8px" }}
                        required
                    />
                </label>

                <label style={{ display: "block", marginBottom: "12px" }}>
                    <span style={{ display: "block", marginBottom: "4px" }}>Contraseña</span>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ width: "100%", padding: "8px" }}
                        required
                    />
                </label>

                <button type="submit" disabled={submitting} style={{ width: "100%", padding: "10px" }}>
                    {submitting ? "Entrando..." : "Iniciar sesión"}
                </button>
            </form>
        </div>
    );
};

export default Login;