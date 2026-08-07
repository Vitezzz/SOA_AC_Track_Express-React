// Modal genérico para los reportes exportables a PDF. No usamos ninguna
// librería de PDF: el botón "Guardar PDF" dispara el diálogo de impresión
// del propio Chromium (Electron), que en Linux/Windows/Mac trae la opción
// nativa "Guardar como PDF". El CSS de @media print oculta todo lo demás
// de la pantalla y solo deja visible el contenido del reporte.
const ReporteImprimible = ({ titulo, subtitulo, onCerrar, children }) => {
    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(17, 24, 39, 0.5)",
                zIndex: 1000,
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "center",
                overflow: "auto",
                padding: "40px 16px",
            }}
        >
            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    .reporte-imprimible, .reporte-imprimible * { visibility: visible; }
                    .reporte-imprimible {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        box-shadow: none !important;
                        max-height: none !important;
                    }
                    .no-print { display: none !important; }
                }
            `}</style>

            <div
                className="reporte-imprimible"
                style={{
                    background: "#fff",
                    width: "760px",
                    maxWidth: "100%",
                    maxHeight: "90vh",
                    overflow: "auto",
                    borderRadius: "8px",
                    padding: "32px",
                    boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
                }}
            >
                <div className="no-print" style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginBottom: "20px" }}>
                    <button onClick={() => window.print()}>🖨️ Imprimir / Guardar PDF</button>
                    <button onClick={onCerrar}>Cerrar</button>
                </div>

                <h2 style={{ margin: 0 }}>{titulo}</h2>
                {subtitulo && <p style={{ margin: "4px 0 20px", color: "#6b7280" }}>{subtitulo}</p>}
                {!subtitulo && <div style={{ marginBottom: "20px" }} />}

                {children}
            </div>
        </div>
    );
};

export default ReporteImprimible;
