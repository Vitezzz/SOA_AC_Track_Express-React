import { useState, useEffect } from "react";
import { Card } from "../../components/Card";
import { useAuth } from "../../context/AuthContext";

const CompletarPerfil = () => {

    const [telefono, setTelefono] = useState("");
    const [direccion, setDireccion] = useState("");
    const [infoCliente, setInfoCliente] = useState(null); // nombre, email, activo — solo lectura
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    // Nuevo estado, junto a los demás
    const [guardado, setGuardado] = useState(false);

    const { apiFetch, setUser } = useAuth();

    useEffect(() => {
        const cargarPerfil = async () => {
            try {
                const res = await apiFetch("/api/clientes/perfil");

                if (!res.ok) throw new Error("No se pudo cargar tu perfil");

                const data = await res.json();
                setTelefono(data.telefono || "");
                setDireccion(data.direccion || "");
                setInfoCliente(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        cargarPerfil();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setGuardado(false);   // 👈 reinicia el aviso cada vez que reintenta

        if (!telefono || !direccion) {
            setError("Completa ambos campos antes de continuar");
            return;
        }

        setSubmitting(true);
        try {
            const res = await apiFetch("/api/clientes/perfil", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ telefono, direccion }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "No se pudieron actualizar los datos");
            }

            setUser((prev) => ({ ...prev, perfil_completo: true }));
            setGuardado(true);   // 👈 nuevo
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <p className="text-center mt-10">Cargando...</p>;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Card>
                <h1 className="text-2xl font-semibold text-gray-900 text-center mb-2">
                    Mi perfil
                </h1>
                <p className="text-sm text-gray-500 text-center mb-6">
                    Mantén tu teléfono y dirección actualizados para que podamos atenderte.
                </p>

                {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

                {guardado && (
                    <p className="text-green-600 text-sm text-center mb-4">
                        ¡Tus datos se guardaron correctamente!
                    </p>
                )}

                {infoCliente && (
                    <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-1">
                        <p className="text-sm text-gray-700">
                            <span className="font-medium">Nombre:</span> {infoCliente.nombre}
                        </p>
                        <p className="text-sm text-gray-700">
                            <span className="font-medium">Email:</span> {infoCliente.email}
                        </p>
                        <p className="text-sm text-gray-700">
                            <span className="font-medium">Estado de cuenta:</span>{" "}
                            {infoCliente.activo ? "Activa" : "Inactiva"}
                        </p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <label className="form-control w-full">
                        <span className="text-sm font-medium text-gray-700 mb-1 block">Teléfono</span>
                        <input
                            type="tel"
                            className="input input-bordered w-full rounded-lg border-gray-200 focus:border-gray-400 focus:ring-0"
                            value={telefono}
                            onChange={(e) => setTelefono(e.target.value)}
                        />
                    </label>

                    <label className="form-control w-full">
                        <span className="text-sm font-medium text-gray-700 mb-1 block">Dirección</span>
                        <input
                            type="text"
                            className="input input-bordered w-full rounded-lg border-gray-200 focus:border-gray-400 focus:ring-0"
                            value={direccion}
                            onChange={(e) => setDireccion(e.target.value)}
                        />
                    </label>
                    <button
                        type="submit"
                        className="btn w-full bg-gray-900 text-white hover:bg-gray-800 border-none rounded-lg py-3"
                        disabled={submitting}
                    >
                        {submitting ? (
                            <span className="loading loading-spinner loading-sm" />
                        ) : (
                            "Guardar"
                        )}
                    </button>
                </form>
            </Card>
        </div>
    );
};

export default CompletarPerfil;