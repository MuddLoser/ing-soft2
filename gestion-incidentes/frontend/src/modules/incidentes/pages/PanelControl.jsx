import { useEffect, useState } from "react";
import Icon from "../../../shared/icons/Icon";
import { formalizarIncidente, editarIncidenteCompleto, buscarIncidentesEnBackend } from "../../../api/incidentesApi";

function PanelControl() {
  const [incidentes, setIncidentes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [filtroFecha, setFiltroFecha] = useState("");

  const [incidenteDetalle, setIncidenteDetalle] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  
  const [editTitulo, setEditTitulo] = useState("");
  const [editDescripcion, setEditDescripcion] = useState("");
  const [editPlan, setEditPlan] = useState("");
  const [editSolucion, setEditSolucion] = useState("");

  const [toast, setToast] = useState({ mostrar: false, mensaje: "", tipo: "error" });
  const mostrarNotificacion = (mensaje, tipo = "error") => {
    setToast({ mostrar: true, mensaje, tipo });
    setTimeout(() => {
      setToast({ mostrar: false, mensaje: "", tipo: "error" });
    }, 3500); 
  };

  const cargarDatos = () => {
    buscarIncidentesEnBackend(terminoBusqueda, filtroFecha)
      .then((data) => setIncidentes(data))
      .catch(console.error);
  };

  const formatearFecha = (fechaOriginal) => {
    if (!fechaOriginal) return "Sin fecha";
    
    const partes = fechaOriginal.split("T");
    const fecha = partes[0]; 
    const hora = partes[1] ? ` a las ${partes[1]}` : "";
    
    const [year, month, day] = fecha.split("-");
    const yearCorto = year.slice(-2);
    
    return `${day}/${month}/${yearCorto}${hora}`;
  };

  useEffect(() => {
    setLoading(true);
    buscarIncidentesEnBackend(terminoBusqueda, filtroFecha)
      .then((data) => {
        setIncidentes(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [terminoBusqueda, filtroFecha]);

  const handleFormalizar = async (id, e) => {
    e.stopPropagation();
    try {
      await formalizarIncidente(id);
      cargarDatos(); 
      mostrarNotificacion("Incidente formalizado correctamente", "exito");
    } catch (error) {
      console.error(error);
      mostrarNotificacion("Hubo un error al intentar formalizar.", "error");
    }
  };

  const abrirDetalles = (inc) => {
    setIncidenteDetalle(inc);
    setEditTitulo(inc.titulo_i || "");
    setEditDescripcion(inc.descripcion_i || "");
    setEditPlan(inc.plan_accion_i || "");
    setEditSolucion(inc.solucion_i || "");
    setModoEdicion(false);
    setToast({ mostrar: false, mensaje: "", tipo: "error" });
  };

  const handleGuardarCambios = async () => {
      if (!editTitulo.trim()) {
        mostrarNotificacion("El título del incidente es obligatorio.", "error");
      return;
      }
      if (!editDescripcion.trim()) {
        mostrarNotificacion("El relato detallado no puede quedar vacío.", "error");
        return;
      }
      if (!editPlan.trim() || !editSolucion.trim()) {
        mostrarNotificacion("El plan de acción y la solución son obligatorios.", "error");
        return;
      }
  
      try {
        const datosAEnviar = {
          titulo: editTitulo,
          descripcion: editDescripcion,
          estudiantes: incidenteDetalle.estudiantes_asociados,
          plan_accion: editPlan,
          solucion: editSolucion
        };
  
        const respuestaPython = await editarIncidenteCompleto(incidenteDetalle.id_i, datosAEnviar);
        
        setIncidenteDetalle(respuestaPython); 
        setModoEdicion(false);
        cargarDatos();
        mostrarNotificacion("Cambios guardados con éxito.", "exito"); 
      } catch (error) {
        console.error(error);
      }
    };





  return (
    <div className="page">
      <div className="breadcrumb">
        <span className="current">Panel de Control</span>
      </div>

      <div className="card">
        <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h2>Incidentes Recientes</h2>
            <p>Haga clic en cualquier caso para abrir la ficha de seguimiento y planes de acción.</p>
          </div>
          
          <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
            <input 
              type="date"
              value={filtroFecha}
              onChange={(e) => setFiltroFecha(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--line-2)", background: "var(--bg-2)", color: "var(--ink-700)", outline: "none" }}
            />

            <div style={{ position: "relative", width: "250px", maxWidth: "100%" }}>
              <span style={{ position: "absolute", left: "12px", top: "10px", color: "var(--ink-400)", display: "flex", alignItems: "center" }}>
                <Icon name="search" size={16} />
              </span>
              <input 
                type="text"
                placeholder="Buscar estudiante..."
                value={terminoBusqueda}
                onChange={(e) => setTerminoBusqueda(e.target.value)}
                style={{ width: "100%", padding: "8px 12px 8px 36px", borderRadius: "6px", border: "1px solid var(--line-2)", fontSize: "14px", outline: "none", background: "var(--bg-2)" }}
              />
              {terminoBusqueda && (
                <button onClick={() => setTerminoBusqueda("")} style={{ position: "absolute", right: "12px", top: "8px", background: "transparent", border: "none", fontSize: "16px", cursor: "pointer", color: "var(--ink-400)" }}>×</button>
              )}
            </div>

            {(terminoBusqueda || filtroFecha) && (
              <button onClick={() => { setTerminoBusqueda(""); setFiltroFecha(""); }} style={{ padding: "8px 12px", background: "transparent", border: "1px solid var(--line-2)", borderRadius: "6px", cursor: "pointer", color: "var(--ink-600)" }}>Limpiar</button>
            )}
          </div>
        </div>

        <div style={{ padding: "24px" }}>
          {loading ? (
            <p>Consultando a la base de datos...</p>
          ) : incidentes.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px", color: "var(--ink-500)", border: "1px dashed var(--line)", borderRadius: "8px" }}>
              <Icon name="search" size={24} style={{ marginBottom: "8px", color: "var(--ink-300)" }} />
              <p style={{ margin: 0 }}>No se encontraron incidentes que coincidan con la búsqueda en el backend.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {incidentes.map((inc) => (
                <div 
                  key={inc.id_i} 
                  onClick={() => abrirDetalles(inc)} 
                  style={{ padding: "16px", border: "1px solid var(--line)", borderRadius: "8px", background: "#fff", cursor: "pointer", transition: "border-color 0.2s" }}
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
                      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Icon name="calendar" size={14} /> {formatearFecha(inc.fecha_i)}</span>
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
              <div style={{ width: "100%" }}>
                <span style={{ fontSize: "12px", background: "var(--teal-700)", color: "#fff", padding: "2px 6px", borderRadius: "4px", fontWeight: "bold" }}>
                  FOLIO {incidenteDetalle.id_i}
                </span>
                
                {!modoEdicion ? (
                  <h3 style={{ marginTop: "6px", marginBottom: 0, fontSize: "20px", color: "var(--ink-900)" }}>{incidenteDetalle.titulo_i}</h3>
                ) : (
                  <div style={{ marginTop: "8px" }}>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "var(--teal-800)" }}>Título del Incidente</label>
                    <input 
                      type="text"
                      value={editTitulo}
                      onChange={(e) => setEditTitulo(e.target.value)}
                      style={{ width: "100%", padding: "6px 10px", borderRadius: "4px", border: "1px solid var(--teal-600)", fontSize: "16px", fontWeight: "bold", outline: "none" }}
                    />
                  </div>
                )}
              </div>
              <button type="button" onClick={() => setIncidenteDetalle(null)} style={{ background: "transparent", border: "none", fontSize: "22px", cursor: "pointer", color: "var(--ink-400)", marginLeft: "12px" }}>×</button>
            </div>

            <div style={{ display: "flex", gap: "20px", fontSize: "13px", color: "var(--ink-600)", background: "var(--bg)", padding: "10px 14px", borderRadius: "6px", marginBottom: "20px", flexWrap: "wrap" }}>
              <div><strong>Fecha/Hora:</strong> {formatearFecha(incidenteDetalle.fecha_i)}</div>
              <div><strong>Lugar:</strong> {incidenteDetalle.lugar || "No especificado"}</div>
              <div style={{ textTransform: "capitalize" }}><strong>Gravedad:</strong> {incidenteDetalle.gravedad || "No especificada"}</div>
              <div><strong>Reportado por:</strong> {incidenteDetalle.reportado_por || "No registrado"}</div>
              <div><strong>Estado:</strong> <span style={{ fontWeight: "bold", color: incidenteDetalle.estado_i === "Formalizado" ? "var(--teal-700)" : "inherit" }}>{incidenteDetalle.estado_i}</span></div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <h4 style={{ margin: "0 0 6px 0", fontSize: "14px", color: "var(--ink-900)", fontWeight: "600" }}>Relato Detallado de los Hechos</h4>
              
              {!modoEdicion ? (
                <div style={{ fontSize: "14px", color: "var(--ink-700)", background: "#f9f9f9", padding: "12px", borderRadius: "6px", border: "1px solid var(--line-2)", whiteSpace: "pre-line" }}>
                  {incidenteDetalle.descripcion_i}
                </div>
              ) : (
                <textarea 
                  style={{ width: "100%", height: "100px", padding: "10px", borderRadius: "4px", border: "1px solid var(--line)", resize: "none", fontFamily: "inherit", fontSize: "14px" }}
                  value={editDescripcion}
                  onChange={(e) => setEditDescripcion(e.target.value)}
                />
              )}
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

            <div style={{ marginBottom: "24px" }}>
              <h4 style={{ margin: "0 0 6px 0", fontSize: "14px", color: "var(--ink-900)" }}>Categorías</h4>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {incidenteDetalle.categorias && incidenteDetalle.categorias.length > 0 ? (
                  incidenteDetalle.categorias.map((cat, idx) => (
                    <span key={idx} style={{ background: "#e0f2fe", border: "1px solid #bae6fd", padding: "4px 10px", borderRadius: "16px", fontSize: "13px", color: "#0369a1", fontWeight: "500" }}>
                      # {cat}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: "13px", color: "var(--ink-500)", fontStyle: "italic" }}>Sin categorías registradas</span>
                )}
              </div>
            </div>

            {incidenteDetalle.estado_i !== "Formalizado" ? (
              <div style={{ background: "#fef8f5", border: "1px solid #f3d9cb", padding: "16px", borderRadius: "8px", textAlign: "center", color: "#8a2a14", fontSize: "14px" }}>
                El caso debe ser <strong>Formalizado</strong> antes de poder diseñar el plan de acción y las soluciones definitivas.
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
                        {incidenteDetalle.solucion_i || "No se ha registrado la resolución definitiva adoptada."}
                      </p>
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      <button 
                        type="button" 
                        onClick={() => setModoEdicion(true)}
                        style={{ padding: "8px 16px", background: "var(--teal-700)", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}
                      >
                        Editar Caso Completo
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ background: "var(--bg)", padding: "16px", borderRadius: "8px", border: "1px solid var(--line)" }}>
                    <h4 style={{ marginTop: 0, marginBottom: "12px", color: "var(--teal-800)", fontSize: "15px" }}>Actualizar Seguimiento y Datos Base</h4>
                    
                    <div style={{ marginBottom: "12px" }}>
                      <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>Plan de Acción (Pasos a seguir)</label>
                      <textarea 
                        style={{ width: "100%", height: "65px", padding: "8px", borderRadius: "4px", border: "1px solid var(--line)", resize: "none", fontFamily: "inherit" }}
                        value={editPlan}
                        onChange={(e) => setEditPlan(e.target.value)}
                        placeholder="Pasos de seguimiento..."
                      />
                    </div>

                    <div style={{ marginBottom: "16px" }}>
                      <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>Solución Asignada (Resolución final)</label>
                      <textarea 
                        style={{ width: "100%", height: "65px", padding: "8px", borderRadius: "4px", border: "1px solid var(--line)", resize: "none", fontFamily: "inherit" }}
                        value={editSolucion}
                        onChange={(e) => setEditSolucion(e.target.value)}
                        placeholder="Resolución final..."
                      />
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                      <button type="button" onClick={() => { setModoEdicion(false); setErrorValidacion(""); }} style={{ padding: "6px 12px", background: "transparent", border: "none", cursor: "pointer", color: "var(--ink-600)" }}>Cancelar</button>
                      <button type="button" onClick={handleGuardarCambios} style={{ padding: "6px 14px", background: "var(--teal-700)", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "600" }}>Guardar Cambios</button>
                    </div>
                  </div>
                )}

              </div>
            )}

          </div>
        </div>
      )}
      
      {toast.mostrar && (
        <div style={{
          position: "fixed", bottom: "24px", right: "24px",
          backgroundColor: toast.tipo === "error" ? "#fef2f2" : "#f0fdf4",
          color: toast.tipo === "error" ? "#991b1b" : "#166534",
          border: `1px solid ${toast.tipo === "error" ? "#f87171" : "#4ade80"}`,
          padding: "16px 24px", borderRadius: "8px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
          display: "flex", alignItems: "center", gap: "12px",
          zIndex: 999999, fontWeight: "600", fontSize: "14px",
          transition: "all 0.3s ease-in-out"
        }}>
          {toast.mensaje}
        </div>
      )}
      
    </div>
  );
}

export default PanelControl;