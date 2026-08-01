import { useState, useEffect } from "react";
import { Card } from "../../components/Card";
import { useAuth } from "../../context/AuthContext";
import AddressAutocompleteInput from "../../components/AddressAutocompleteInput";
import Icon from "../../components/Icon";
import LoadingState from "../../components/LoadingState";

const CompletarPerfil = () => {

    const [telefono, setTelefono] = useState("");
    const [direccion, setDireccion] = useState("");
    const [infoCliente, setInfoCliente] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
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
        setGuardado(false);

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
            if (!res.ok) throw new Error(data.message || "No se pudieron actualizar los datos");

            setUser((prev) => ({ ...prev, perfil_completo: true }));
            setGuardado(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <LoadingState />;

    // Nombre completo, uniendo solo las partes que sí existan --
    // si viene de Google/Facebook, paterno/materno son null y no aparecen.
    const nombreCompleto = [infoCliente?.nombre, infoCliente?.paterno, infoCliente?.materno]
        .filter(Boolean)
        .join(" ");

    return (
        <div className="page-shell">
            <Card maxWidth="max-w-xl">
                <div className="text-center mb-6">
                    <h1 className="page-title mb-1">Mi perfil</h1>
                    <p className="text-sm text-gray-500">
                        Mantén tus datos actualizados para que podamos atenderte mejor.
                    </p>
                </div>

                {guardado && <p className="form-success mb-4">¡Tus datos se guardaron correctamente!</p>}
                {error && <p className="form-error mb-4">{error}</p>}

                {infoCliente && (
                    <div className="panel !shadow-none !border-gray-100 bg-gray-50 mb-6 !p-5">
                        <div className="flex items-center justify-between mb-4">
                            <span className="font-semibold text-gray-900 text-lg">{nombreCompleto}</span>
                            <span className={`badge-status ${infoCliente.activo ? "badge-status-success" : "badge-status-neutral"}`}>
                                {infoCliente.activo ? "Cuenta activa" : "Cuenta inactiva"}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                            <p><span className="text-gray-400">Nombre:</span> <span className="text-gray-700">{infoCliente.nombre || "—"}</span></p>
                            <p><span className="text-gray-400">Apellido paterno:</span> <span className="text-gray-700">{infoCliente.paterno || "—"}</span></p>
                            <p><span className="text-gray-400">Apellido materno:</span> <span className="text-gray-700">{infoCliente.materno || "—"}</span></p>
                            <p><span className="text-gray-400">Correo:</span> <span className="text-gray-700">{infoCliente.email}</span></p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <label className="form-control w-full">
                        <span className="form-label">Teléfono</span>
                        <div className="input-group">
                            <Icon name="phone" className="input-icon" />
                            <input
                                type="tel"
                                className="form-input"
                                value={telefono}
                                onChange={(e) => setTelefono(e.target.value)}
                            />
                        </div>
                    </label>

                    <label className="form-control w-full">
                        <span className="form-label">Dirección</span>
                        <div className="input-group">
                            <Icon name="pin" className="input-icon" />
                            <AddressAutocompleteInput
                                className="form-input"
                                value={direccion}
                                onChange={setDireccion}
                            />
                        </div>
                    </label>

                    <button type="submit" className="btn-primary w-full py-3" disabled={submitting}>
                        {submitting ? <span className="loading loading-spinner loading-sm" /> : "Guardar cambios"}
                    </button>
                </form>
            </Card>
        </div>
    );
};

export default CompletarPerfil;