import { useAuth } from "../../context/AuthContext";

const Home = () => {
    const { user } = useAuth();

    return (
        <div style={{ padding: "24px" }}>
            <h1>Bienvenido, {user?.nombre}</h1>
            <p style={{ color: "#6b7280" }}>
                Usa el menú de arriba para navegar entre los módulos.
            </p>
        </div>
    );
};

export default Home;