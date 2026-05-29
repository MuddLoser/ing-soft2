import { useEffect, useState } from "react";
import Icon from "../../../shared/icons/Icon";
import { obtenerIncidentes } from "../../../api/incidentesApi";

function PanelControl() {
  const [incidentes, setIncidentes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    obtenerIncidentes()
      .then((data) => {
        setIncidentes(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="page">
      <div className="breadcrumb">
        <span className="current">Panel de Control</span>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Incidentes Recientes</h2>
        </div>

        <div style={{ padding: "24px" }}>
          {loading ? (
            <p>Cargando incidentes...</p>
          ) : incidentes.length === 0 ? (
            <p style={{ color: "var(--ink-500)" }}>No hay incidentes registrados aún.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {incidentes.map((inc) => (
                <div key={inc.id_i} style={{ padding: "16px", border: "1px solid var(--line)", borderRadius: "8px", background: "#fff" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <strong style={{ fontSize: "16px", color: "var(--teal-800)" }}>{inc.titulo_i}</strong>
                    <span style={{ fontSize: "13px", color: "var(--ink-500)", background: "var(--bg-2)", padding: "4px 8px", borderRadius: "4px" }}>
                      Folio: {inc.id_i}
                    </span>
                  </div>

                  <p style={{ margin: "0 0 8px 0", fontSize: "14px", color: "var(--ink-700)" }}>{inc.descripcion_i}</p>
                  
                  <div style={{ display: "flex", gap: "16px", fontSize: "13px", color: "var(--ink-500)" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Icon name="calendar" size={14} /> {inc.fecha_i}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Icon name="users" size={14} /> {inc.estudiantes_asociados?.join(", ")}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Icon name="shield" size={14} /> {inc.estado_i}</span>
                  </div>

                  <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: "1px solid var(--line)", display: "flex", gap: "8px" }}>
                    
                    {inc.estado_i !== "Formalizado" && (
                      <button 
                        type="button"
                        onClick={() => handleFormalizar(inc.id_i)}
                        style={{ padding: "6px 12px", background: "transparent", border: "1px solid var(--ink-300)", borderRadius: "4px", cursor: "pointer", fontSize: "13px", display: "flex", alignItems: "center", gap: "4px" }}
                      >
                        <Icon name="check" size={14} /> Formalizar
                      </button>
                    )}

                    {inc.estado_i === "Formalizado" && !inc.solucion_i && (
                      <button 
                        type="button"
                        onClick={() => abrirModalSolucion(inc.id_i)}
                        style={{ padding: "6px 12px", background: "var(--teal-700)", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "13px", display: "flex", alignItems: "center", gap: "4px" }}
                      >
                        <Icon name="plus" size={14} /> Asignar Solución
                      </button>
                    )}

                    {inc.solucion_i && (
                      <div style={{ fontSize: "13px", color: "var(--teal-800)", background: "#e6f4f1", padding: "6px 12px", borderRadius: "4px", width: "100%" }}>
                        <strong>Solución aplicada:</strong> {inc.solucion_i}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PanelControl;