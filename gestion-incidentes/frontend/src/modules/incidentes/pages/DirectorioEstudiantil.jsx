import Icon from "../../../shared/icons/Icon";

const TODOS_LOS_ESTUDIANTES = [
  { id: 1, name: "Martina Vargas", grade: "2°A", initials: "MV", rut: "21.345.678-9" },
  { id: 2, name: "Joaquín López", grade: "2°A", initials: "JL", rut: "21.112.233-4" },
  { id: 3, name: "Benjamín Muñoz", grade: "3°B", initials: "BM", rut: "20.987.654-3" },
  { id: 4, name: "Sofía Henriquez", grade: "1°C", initials: "SH", rut: "22.456.789-0" },
  { id: 5, name: "Mateo Sanhueza", grade: "4°A", initials: "MS", rut: "19.876.543-2" },
  { id: 6, name: "Miguel Jackson", grade: "2°B", initials: "MJ", rut: "21.555.666-7" },
];

function DirectorioEstudiantil() {
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
            {TODOS_LOS_ESTUDIANTES.map((est) => (
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