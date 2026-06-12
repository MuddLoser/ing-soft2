import Icon from "../../../shared/icons/Icon";
import { useEffect, useState } from "react";
import { getEstudiantes } from "../../../api/incidentesApi";

function DirectorioEstudiantil() {
  const [estudiantes, setEstudiantes] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="page">
      <div className="breadcrumb">
        <span className="current">Directorio Estudiantil</span>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Alumnos Matriculados</h2>
          <p>Directorio general de estudiantes del establecimiento.</p>
        </div>

        <div style={{ padding: "24px" }}>
          <div className="grid-2">
            {estudiantes.map((est) => (
              <div key={est.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px", border: "1px solid var(--line)", borderRadius: "8px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "var(--teal-700)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
                  {est.initials}
                </div>
                <div>
                  <div style={{ fontWeight: "600", fontSize: "15px" }}>{est.name}</div>
                  <div style={{ fontSize: "13px", color: "var(--ink-500)" }}>Curso: {est.grade} | RUT: {est.rut}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DirectorioEstudiantil;