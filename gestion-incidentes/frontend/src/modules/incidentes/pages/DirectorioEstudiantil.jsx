import { useEffect, useState } from "react";
import Icon from "../../../shared/icons/Icon";
import { getEstudiantes, obtenerIncidentes } from "../../../api/incidentesApi"; 

function DirectorioEstudiantil() {
  const [estudiantes, setEstudiantes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para el Modal del Perfil del Alumno
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null);
  const [incidentesAlumno, setIncidentesAlumno] = useState([]);
  const [loadingIncidentes, setLoadingIncidentes] = useState(false);

  useEffect(() => {
    getEstudiantes()
      .then((data) => {
        setEstudiantes(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const abrirPerfil = async (alumno) => {
    setAlumnoSeleccionado(alumno);
    setLoadingIncidentes(true);
    setIncidentesAlumno([]); // Limpiamos incidentes anteriores

    try {
      const todosLosIncidentes = await obtenerIncidentes();
      
      // Filtramos solo los incidentes donde este alumno esté involucrado
      const historial = todosLosIncidentes.filter(inc => 
        inc.estudiantes_asociados && inc.estudiantes_asociados.includes(alumno.name)
      );
      
      setIncidentesAlumno(historial);
    } catch (error) {
      console.error("Error cargando historial del alumno:", error);
    } finally {
      setLoadingIncidentes(false);
    }
  };

  return (
    <div className="page">

      <div className="card">
        <div className="card-header">
          <h2>Alumnos Matriculados</h2>
          <p>Directorio general. Haga clic en un estudiante para ver su historial de convivencia.</p>
        </div>

        <div style={{ padding: "24px" }}>
          {loading ? (
            <p>Cargando directorio...</p>
          ) : (
            <div className="grid-2">
              {estudiantes.map((est) => (
                <div 
                  key={est.id} 
                  onClick={() => abrirPerfil(est)} // Hacemos la tarjeta clickeable
                  style={{ 
                    display: "flex", alignItems: "center", gap: "12px", padding: "16px", 
                    border: "1px solid var(--line)", borderRadius: "8px", background: "#fff",
                    cursor: "pointer", transition: "border-color 0.2s" 
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--teal-600)"}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--line)"}
                >
                  <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "var(--teal-700)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
                    {est.initials}
                  </div>
                  <div>
                    <div style={{ fontWeight: "600", fontSize: "15px", color: "var(--ink-900)" }}>{est.name}</div>
                    <div style={{ fontSize: "13px", color: "var(--ink-500)" }}>Curso: {est.grade} | RUT: {est.rut}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================
          MODAL DE PERFIL Y HOJA DE VIDA DEL ALUMNO
          ======================================================== */}
      {alumnoSeleccionado && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000 }}>
          <div style={{ background: "#fff", padding: "28px", borderRadius: "12px", width: "600px", maxWidth: "92%", maxHeight: "88vh", overflowY: "auto", boxShadow: "0 20px 40px rgba(0,0,0,0.25)" }}>
            
            {/* Cabecera del Perfil */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", borderBottom: "1px solid var(--line)", paddingBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "var(--teal-700)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: "bold" }}>
                  {alumnoSeleccionado.initials}
                </div>
                <div>
                  <h3 style={{ margin: "0 0 4px 0", fontSize: "20px", color: "var(--ink-900)" }}>{alumnoSeleccionado.name}</h3>
                  <div style={{ fontSize: "14px", color: "var(--ink-600)" }}>
                    {alumnoSeleccionado.grade} • RUT: {alumnoSeleccionado.rut}
                  </div>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setAlumnoSeleccionado(null)} 
                style={{ background: "transparent", border: "none", fontSize: "22px", cursor: "pointer", color: "var(--ink-400)" }}
              >
                ×
              </button>
            </div>

            {/* Hoja de Vida / Historial */}
            <div>
              <h4 style={{ margin: "0 0 16px 0", color: "var(--ink-900)", display: "flex", alignItems: "center", gap: "8px" }}>
                <Icon name="doc" size={18} /> Historial de Incidentes
              </h4>

              {loadingIncidentes ? (
                <p style={{ fontSize: "14px", color: "var(--ink-500)", textAlign: "center", padding: "20px 0" }}>Cargando registros...</p>
              ) : incidentesAlumno.length === 0 ? (
                <div style={{ background: "var(--bg-2)", padding: "20px", borderRadius: "8px", textAlign: "center", color: "var(--ink-600)", border: "1px dashed var(--line)" }}>
                  <Icon name="check" size={24} color="var(--teal-600)" />
                  <p style={{ margin: "8px 0 0 0", fontSize: "14px" }}>El estudiante no registra incidentes de convivencia en su hoja de vida.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {incidentesAlumno.map((inc) => (
                    <div key={inc.id_i} style={{ border: "1px solid var(--line-2)", borderRadius: "6px", padding: "12px", background: "#fcfcfc" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                        <strong style={{ fontSize: "14px", color: "var(--teal-800)" }}>{inc.titulo_i}</strong>
                        <span style={{ fontSize: "12px", background: "var(--bg-2)", padding: "2px 6px", borderRadius: "4px", color: "var(--ink-600)" }}>
                          Folio {inc.id_i}
                        </span>
                      </div>
                      
                      <p style={{ margin: "0 0 8px 0", fontSize: "13px", color: "var(--ink-700)" }}>
                        {inc.descripcion_i.length > 100 ? `${inc.descripcion_i.substring(0, 100)}...` : inc.descripcion_i}
                      </p>
                      
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px" }}>
                        <span style={{ color: "var(--ink-500)", display: "flex", alignItems: "center", gap: "4px" }}>
                          <Icon name="calendar" size={12} /> {inc.fecha_i}
                        </span>
                        <span style={{ 
                          padding: "2px 8px", borderRadius: "12px", fontWeight: "600",
                          background: inc.estado_i === "Formalizado" ? "#e6f4f1" : "var(--bg-2)",
                          color: inc.estado_i === "Formalizado" ? "var(--teal-700)" : "var(--ink-600)"
                        }}>
                          {inc.estado_i}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}
      
    </div>
  );
}

export default DirectorioEstudiantil;