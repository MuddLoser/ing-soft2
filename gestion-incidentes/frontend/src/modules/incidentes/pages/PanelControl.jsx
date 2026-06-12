import { useEffect, useState } from "react";
import Icon from "../../../shared/icons/Icon";
import { obtenerIncidentes, formalizarIncidente, asignarSolucion } from "../../../api/incidentesApi";

function PanelControl() {
  const [incidentes, setIncidentes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [incidenteDetalle, setIncidenteDetalle] = useState(null);
  
  const [modoEdicion, setModoEdicion] = useState(false);
  const [editPlan, setEditPlan] = useState("");
  const [editSolucion, setEditSolucion] = useState("");

  const cargarDatos = () => {
    obtenerIncidentes()
      .then((data) => {
        setIncidentes(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleFormalizar = async (id, e) => {
    e.stopPropagation();
    try {
      await formalizarIncidente(id);
      cargarDatos(); 
    } catch (error) {
      console.error(error);
      alert("Hubo un error al intentar formalizar.");
    }
  };

  const abrirDetalles = (inc) => {
    setIncidenteDetalle(inc);
    setEditPlan(inc.plan_accion_i || "");
    setEditSolucion(inc.solucion_i || "");
    setModoEdicion(false);
  };

  const handleGuardarPlanSolucion = async () => {
    if (!editPlan.trim() || !editSolucion.trim()) {
      alert("Tanto el plan de acción como la solución son obligatorios.");
      return;
    }

    try {
      const respuestaPython = await asignarSolucion(incidenteDetalle.id_i, editPlan, editSolucion);
     
      setIncidenteDetalle(respuestaPython);
      setModoEdicion(false);
      cargarDatos(); 
    } catch (error) {
      console.error(error);
      alert("Error al actualizar las medidas de resolución.");
    }
  };

  return (
    <div className="page">
      <div className="breadcrumb">
        <span className="current">Panel de Control</span>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Incidentes Recientes</h2>
          <p>Haga clic en cualquier caso para abrir la ficha de seguimiento y planes de acción.</p>
        </div>

        <div style={{ padding: "24px" }}>
          {loading ? (
            <p>Cargando incidentes desde Python...</p>
          ) : !Array.isArray(incidentes) || incidentes.length === 0 ? (
            <p style={{ color: "var(--ink-500)" }}>No hay incidentes registrados aún.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              
              {incidentes.map((inc) => (
                <div 
                  key={inc.id_i} 
                  onClick={() => abrirDetalles(inc)} 
                  style={{ padding: "16px", border: "1px solid var(--line)", borderRadius: "8px", background: "#fff", cursor: "pointer", transition: "transform 0.2s" }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--teal-600)"}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--line)"}
                >
                  
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <strong style={{ fontSize: "16px", color: "var(--teal-800)" }}>{inc.titulo_i}</strong>
                    <span style={{ fontSize: "13px", color: "var(--ink-500)", background: "var(--bg-2)", padding: "4px 8px", borderRadius: "4px" }}>
                      Folio: {inc.id_i}
                    </span>
                  </div>
                  
                  <p style={{ margin: "0 0 12px 0", fontSize: "14px", color: "var(--ink-700)" }}>{inc.descripcion_i}</p>
                  
                  <div style={{ paddingTop: "12px", borderTop: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", gap: "16px", fontSize: "13px", color: "var(--ink-500)" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Icon name="calendar" size={14} /> {inc.fecha_i}</span>
                      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Icon name="users" size={14} /> {inc.estudiantes_asociados?.join(", ")}</span>
                      <span style={{ display: "flex", alignItems: "center", gap: "4px", color: inc.estado_i === "Formalizado" ? "var(--teal-700)" : "inherit", fontWeight: inc.estado_i === "Formalizado" ? "bold" : "normal" }}>
                        <Icon name="shield" size={14} /> {inc.estado_i}
                      </span>
                    </div>

                    <div style={{ display: "flex", gap: "8px" }}>
                      {inc.estado_i !== "Formalizado" && (
                        <button 
                          type="button"
                          onClick={(e) => handleFormalizar(inc.id_i, e)}
                          style={{ padding: "4px 10px", background: "transparent", border: "1px solid var(--ink-300)", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}
                        >
                          Formalizar
                        </button>
                      )}
                      <span style={{ fontSize: "12px", color: "var(--teal-700)", fontWeight: "600", display: "flex", alignItems: "center", gap: "2px" }}>
                        Ver Ficha <Icon name="chev" size={12} />
                      </span>
                    </div>
                  </div>

                </div>
              ))}
              
            </div>
          )}
        </div>
      </div>

      
      {incidenteDetalle && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000 }}>
          <div style={{ background: "#fff", padding: "28px", borderRadius: "12px", width: "650px", maxWidth: "92%", maxHeight: "88vh", overflowY: "auto", boxShadow: "0 20px 40px rgba(0,0,0,0.25)" }}>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "18px", borderBottom: "2px solid var(--line)", paddingBottom: "12px" }}>
              <div>
                <span style={{ fontSize: "12px", background: "var(--teal-700)", color: "#fff", padding: "2px 6px", borderRadius: "4px", fontWeight: "bold" }}>
                  FOLIO {incidenteDetalle.id_i}
                </span>
                <h3 style={{ marginTop: "6px", marginBottom: 0, fontSize: "20px", color: "var(--ink-900)" }}>{incidenteDetalle.titulo_i}</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setIncidenteDetalle(null)} 
                style={{ background: "transparent", border: "none", fontSize: "22px", cursor: "pointer", color: "var(--ink-400)" }}
              >
                ×
              </button>
            </div>

            <div style={{ display: "flex", gap: "20px", fontSize: "13px", color: "var(--ink-600)", background: "var(--bg)", padding: "10px 14px", borderRadius: "6px", marginBottom: "20px" }}>
              <div><strong>Fecha/Hora:</strong> {incidenteDetalle.fecha_i}</div>
              <div><strong>Reportado por:</strong> {incidenteDetalle.reportado_por || "No registrado"}</div>
              <div><strong>Estado:</strong> <span style={{ fontWeight: "bold", color: incidenteDetalle.estado_i === "Formalizado" ? "var(--teal-700)" : "inherit" }}>{incidenteDetalle.estado_i}</span></div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <h4 style={{ margin: "0 0 6px 0", fontSize: "14px", color: "var(--ink-900)", fontWeight: "600" }}>Relato Detallado de los Hechos</h4>
              <div style={{ fontSize: "14px", color: "var(--ink-700)", background: "#f9f9f9", padding: "12px", borderRadius: "6px", border: "1px solid var(--line-2)", whiteSpace: "pre-line" }}>
                {incidenteDetalle.descripcion_i}
              </div>
            </div>

            <div style={{ marginBottom: "24px" }}>
              <h4 style={{ margin: "0 0 6px 0", fontSize: "14px", color: "var(--ink-900)" }}>Estudiantes Implicados</h4>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {incidenteDetalle.estudiantes_asociados?.map((e, idx) => (
                  <span key={idx} style={{ background: "var(--bg-2)", border: "1px solid var(--line)", padding: "4px 10px", borderRadius: "16px", fontSize: "13px", color: "var(--ink-800)" }}>
                    {e}
                  </span>
                ))}
              </div>
            </div>

            {incidenteDetalle.estado_i !== "Formalizado" ? (
              <div style={{ background: "#fef8f5", border: "1px solid #f3d9cb", padding: "16px", borderRadius: "8px", textAlign: "center", color: "#8a2a14", fontSize: "14px" }}>
                <Icon name="triangle" size={18} /> El caso debe ser <strong>Formalizado</strong> externamente antes de poder diseñar el plan de acción y las soluciones definitivas.
              </div>
            ) : (
              <div style={{ borderTop: "1px dashed var(--line)", paddingTop: "16px" }}>
                
                {!modoEdicion ? (

                  <div>
                    <div style={{ marginBottom: "16px" }}>
                      <h4 style={{ margin: "0 0 4px 0", fontSize: "14px", color: "var(--ink-900)" }}>Plan de Acción Interno</h4>
                      <p style={{ margin: 0, fontSize: "14px", color: incidenteDetalle.plan_accion_i ? "var(--ink-800)" : "var(--ink-400)", fontStyle: incidenteDetalle.plan_accion_i ? "normal" : "italic" }}>
                        {incidenteDetalle.plan_accion_i || "No se ha registrado una estrategia o plan de acción de seguimiento aún."}
                      </p>
                    </div>

                    <div style={{ marginBottom: "20px" }}>
                      <h4 style={{ margin: "0 0 4px 0", fontSize: "14px", color: "var(--ink-900)" }}>Solución y Medida Definitiva</h4>
                      <p style={{ margin: 0, fontSize: "14px", color: incidenteDetalle.solucion_i ? "var(--ink-800)" : "var(--ink-400)", fontStyle: incidenteDetalle.solucion_i ? "normal" : "italic" }}>
                        {incidenteDetalle.solucion_i || "No se ha registrado la sanción o solución definitiva adoptada."}
                      </p>
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      <button 
                        type="button" 
                        onClick={() => setModoEdicion(true)}
                        style={{ padding: "8px 16px", background: "var(--teal-700)", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}
                      >
                        <Icon name="gear" size={14} /> 
                        {incidenteDetalle.plan_accion_i ? "Editar Plan y Solución" : "Asignar Plan y Solución"}
                      </button>
                    </div>
                  </div>
                ) : (

                  <div style={{ background: "var(--bg)", padding: "16px", borderRadius: "8px", border: "1px solid var(--line)" }}>
                    <h4 style={{ marginTop: 0, marginBottom: "12px", color: "var(--teal-800)", fontSize: "15px" }}>Actualizar Seguimiento del Caso</h4>
                    
                    <div style={{ marginBottom: "12px" }}>
                      <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>Plan de Acción (Pasos a seguir)</label>
                      <textarea 
                        style={{ width: "100%", height: "70px", padding: "8px", borderRadius: "4px", border: "1px solid var(--line)", resize: "none", fontFamily: "inherit" }}
                        value={editPlan}
                        onChange={(e) => setEditPlan(e.target.value)}
                        placeholder="Ej: Entrevistar a los testigos, citar a los tutores legales y derivar a psicología escolar..."
                      />
                    </div>

                    <div style={{ marginBottom: "16px" }}>
                      <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>Solución Asignada (Resolución final)</label>
                      <textarea 
                        style={{ width: "100%", height: "70px", padding: "8px", borderRadius: "4px", border: "1px solid var(--line)", resize: "none", fontFamily: "inherit" }}
                        value={editSolucion}
                        onChange={(e) => setEditSolucion(e.target.value)}
                        placeholder="Ej: Firma de compromiso de sana convivencia y amonestación en el libro de clases conforme al reglamento interno..."
                      />
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                      <button type="button" onClick={() => setModoEdicion(false)} style={{ padding: "6px 12px", background: "transparent", border: "none", cursor: "pointer", color: "var(--ink-600)" }}>
                        Cancelar
                      </button>
                      <button type="button" onClick={handleGuardarPlanSolucion} style={{ padding: "6px 14px", background: "var(--teal-700)", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "600" }}>
                        Guardar Cambios
                      </button>
                    </div>
                  </div>
                )}

              </div>
            )}

          </div>
        </div>
      )}
      
    </div>
  );
}

export default PanelControl;