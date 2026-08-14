import { useState } from "react";
import { createPortal } from "react-dom";
import Icon from "../../components/Icon";

// Modal genérico para los reportes exportables a PDF. No usamos ninguna
// librería de PDF: el botón "Guardar PDF" dispara el diálogo de impresión
// del propio Chromium (Electron), que en Linux/Windows/Mac trae la opción
// nativa "Guardar como PDF". El CSS de @media print oculta todo lo demás
// de la pantalla y solo deja visible el contenido del reporte.
//
// firmas: si se pasa un arreglo de etiquetas (ej. ["Técnico", "Cliente"]),
// se agregan líneas de firma al final -- solo tiene sentido en reportes que
// de verdad se entregan/firman en sitio (orden de servicio), no en los que
// son puramente informativos (histórico de técnico).
const ReporteImprimible = ({ titulo, subtitulo, onCerrar, children, firmas }) => {
    // El folio se genera una sola vez por reporte abierto, no en cada
    // render -- si no, cambiaría cada vez que el componente padre se
    // re-renderiza por algo ajeno (ej. una notificación nueva).
    const [folio] = useState(() => `RPT-${Math.floor(1000 + Math.random() * 9000)}`);
    const fechaGeneracion = new Date().toLocaleString("es-MX", {
        day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
    // Se monta con un portal directo a <body>, fuera del árbol de
    // #root -- así, al imprimir, basta con ocultar #root completo (que
    // colapsa TODO su espacio, a diferencia de visibility:hidden que lo
    // deja reservado) y el reporte queda como el único contenido de la
    // página, fluyendo normal en varias hojas. Antes vivía dentro del
    // mismo árbol que el resto de la app: el overlay era position:fixed,
    // y Chromium repite en CADA página de impresión cualquier contenido
    // colgado de un ancestro fijo -- por eso el PDF salía con la misma
    // página duplicada varias veces.
    return createPortal(
        <div
            className="reporte-overlay"
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
                    #root { display: none !important; }
                    .reporte-overlay {
                        position: static !important;
                        inset: auto !important;
                        display: block !important;
                        background: none !important;
                        padding: 0 !important;
                        overflow: visible !important;
                    }
                    .reporte-imprimible {
                        width: 100%;
                        box-shadow: none !important;
                        max-height: none !important;
                        overflow: visible !important;
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
                    <button onClick={() => window.print()} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Icon name="printer" className="icon-sm" /> Imprimir / Guardar PDF
                    </button>
                    <button onClick={onCerrar}>Cerrar</button>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid #111827", paddingBottom: "14px", marginBottom: "20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{
                            width: "36px", height: "36px", borderRadius: "8px",
                            background: "linear-gradient(135deg, #0e8a82, #0a6a63)",
                            color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            <Icon name="home" className="icon-sm" />
                        </div>
                        <div>
                            <p style={{ margin: 0, fontWeight: 700, fontSize: "15px" }}>AC Track</p>
                            <p style={{ margin: 0, fontSize: "11px", color: "#6b7280" }}>Servicio técnico de climatización</p>
                        </div>
                    </div>
                    <div style={{ textAlign: "right", fontSize: "11px", color: "#6b7280" }}>
                        <p style={{ margin: 0 }}>Folio: <strong style={{ color: "#111827" }}>{folio}</strong></p>
                        <p style={{ margin: 0 }}>Generado: {fechaGeneracion}</p>
                    </div>
                </div>

                <h2 style={{ margin: 0 }}>{titulo}</h2>
                {subtitulo && <p style={{ margin: "4px 0 20px", color: "#6b7280" }}>{subtitulo}</p>}
                {!subtitulo && <div style={{ marginBottom: "20px" }} />}

                {children}

                {firmas && firmas.length > 0 && (
                    <div style={{ display: "flex", gap: "40px", marginTop: "48px", paddingTop: "8px" }}>
                        {firmas.map((etiqueta) => (
                            <div key={etiqueta} style={{ flex: 1, textAlign: "center" }}>
                                <div style={{ borderTop: "1px solid #111827", paddingTop: "6px", fontSize: "12px", color: "#6b7280" }}>
                                    {etiqueta}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <p style={{ marginTop: "28px", paddingTop: "10px", borderTop: "1px solid #e5e7eb", fontSize: "10px", color: "#9ca3af", textAlign: "center" }}>
                    Documento generado automáticamente por AC Track · {folio}
                </p>
            </div>
        </div>,
        document.body
    );
};

export default ReporteImprimible;
