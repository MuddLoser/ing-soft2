import { useEffect, useState } from "react";
import Icon from "../../../shared/icons/Icon";
import { getIncidentes, formalizarIncidente, asignarSolucion } from "../../../api/incidentesApi";

function PanelControl() {
  const [incidentes, setIncidentes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [incidenteSeleccionado, setIncidenteSeleccionado] = useState(null);
  const [textoSolucion, setTextoSolucion] = useState("");

  const cargarDatos = () => {
    getIncidentes()
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

  const handleFormalizar = async (id) => {
    try {
      await formalizarIncidente(id);
      cargarDatos(); 
    } catch (error) {
      console.error("Error al formalizar", error);
      alert("Hubo un error al intentar formalizar el incidente.");
    }
  };

  // Abre la ventana y limpia el texto
  const abrirModalSolucion = (id) => {
    setIncidenteSeleccionado(id);
    setTextoSolucion("");
  };

  // Envía el texto a Python
  const handleGuardarSolucion = async () => {
    if (!textoSolucion.trim()) {
      alert("Debe escribir una solución.");
      return;
    }
    
    try {
      await asignarSolucion(incidenteSeleccionado, textoSolucion);
      setIncidenteSeleccionado(null); // Cierra la ventana
      cargarDatos(); // Recarga la lista para mostrar el texto nuevo
    } catch (error) {
      console.error(error);
      alert("Error al guardar la solución");
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
          <p>Listado de todos los sucesos de convivencia registrados en el sistema.</p>
        </div>

        <div style={{ padding: "24px" }}>
          {loading ? (
            <p>Cargando incidentes desde Python...</p>
          ) : !Array.isArray(incidentes) || incidentes.length === 0 ? (
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
                  
                  <p style={{ margin: "0 0 12px 0", fontSize: "14px", color: "var(--ink-700)" }}>{inc.descripcion_i}</p>
                  
                  <div style={{ display: "flex", gap: "16px", fontSize: "13px", color: "var(--ink-500)" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Icon name="calendar" size={14} /> {inc.fecha_i}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Icon name="users" size={14} /> {inc.estudiantes_asociados?.join(", ")}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px", color: inc.estado_i === "Formalizado" ? "var(--teal-700)" : "inherit", fontWeight: inc.estado_i === "Formalizado" ? "bold" : "normal" }}>
                      <Icon name="shield" size={14} /> {inc.estado_i}
                    </span>
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

      {/* --- VENTANA EMERGENTE (MODAL) PARA LA SOLUCIÓN --- */}
      {incidenteSeleccionado && (
        <div style={{ 
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", 
          backgroundColor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", 
          justifyContent: "center", zIndex: 10000 
        }}>
          <div style={{ background: "#fff", padding: "24px", borderRadius: "8px", width: "450px", maxWidth: "90%", boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}>
            <h3 style={{ marginTop: 0, marginBottom: "8px", color: "var(--ink-900)" }}>
              Asignar Solución
            </h3>
            <p style={{ fontSize: "14px", color: "var(--ink-500)", marginBottom: "16px" }}>
              Describa el plan de acción o la medida definitiva tomada para el incidente folio {incidenteSeleccionado}.
            </p>
            
            <textarea
              style={{ width: "100%", height: "120px", marginBottom: "16px", padding: "12px", border: "1px solid var(--line-2)", borderRadius: "6px", fontFamily: "inherit", resize: "none" }}
              placeholder="Ej: Se realizó mediación entre pares, los estudiantes firmaron carta de compromiso y se notificó formalmente a los apoderados."
              value={textoSolucion}
              onChange={(e) => setTextoSolucion(e.target.value)}
            />
            
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button 
                type="button" 
                onClick={() => setIncidenteSeleccionado(null)}
                style={{ padding: "8px 16px", background: "transparent", border: "none", color: "var(--ink-500)", cursor: "pointer", fontWeight: "600" }}
              >
                Cancelar
              </button>
              <button 
                type="button" 
                onClick={handleGuardarSolucion}
                style={{ padding: "8px 16px", background: "var(--teal-700)", border: "none", color: "#fff", borderRadius: "4px", cursor: "pointer", fontWeight: "600" }}
              >
                Guardar Solución
              </button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}

export default PanelControl;