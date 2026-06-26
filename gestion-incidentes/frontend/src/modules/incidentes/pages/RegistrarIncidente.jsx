import { useRef, useState, useEffect} from "react";
import Icon from "../../../shared/icons/Icon";
import { registrarIncidente , getEstudiantes} from "../../../api/incidentesApi";

const categories = [
  "Agresión verbal",
  "Agresión física",
  "Daño a la propiedad",
  "Uso indebido de dispositivos",
  "Falta de respeto",
  "Conducta disruptiva en aula",
  "Ausentismo / Atrasos",
  "Conflicto entre pares",
  "Otro",
];

function RegistrarIncidente(props) {

  const [listaAlumnos, setListaAlumnos] = useState([]);

  useEffect(() => {
    getEstudiantes()
      .then((data) => setListaAlumnos(data))
      .catch(console.error);
  }, []);

  const fechaActual = new Date();
  fechaActual.setMinutes(fechaActual.getMinutes() - fechaActual.getTimezoneOffset());
  const fechaActualFormato = fechaActual.toISOString().slice(0, 16);

  const [titulo, setTitulo] = useState("");
  const [gravedad, setGravedad] = useState("moderado");
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [description, setDescription] = useState("");
  const [adultoResponsable, setAdultoResponsable] = useState("");
  const [lugar, setLugar] = useState("");
  const [categorias, setCategorias] = useState(new Set(["Conducta disruptiva en aula"]));
  const [files, setFiles] = useState([{ name: "fotografía-pasillo.jpg", size: "1.2 MB" }]);
  const [fechaHora, setFechaHora] = useState(fechaActualFormato);

  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const [toast, setToast] = useState({ mostrar: false, mensaje: "" });
  const mostrarNotificacion = (mensaje) => { setToast({ mostrar: true, mensaje });};

  const estudiantesFiltrados = searchTerm.trim() === "" 
    ? [] 
    : listaAlumnos.filter(estudiante => 
        estudiante.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !students.some(agregado => agregado.id === estudiante.id)
      );

  const handleAddStudent = (estudiante) => {
    setStudents([...students, estudiante]);
    setSearchTerm("");
  };

  const removeStudent = (id) => {
    setStudents(students.filter((s) => s.id !== id));
  };

  const toggleCat = (category) => {
    const next = new Set(categorias);
    if (next.has(category)) {
      next.delete(category);
    } else {
      next.add(category);
    }
    setCategorias(next);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, idx) => idx !== index));
  };

  const validarFormulario = () => {
    if (!titulo.trim()) return "Debe ingresar un título para el incidente.";
    if (!description.trim()) return "Debe ingresar una descripción del incidente.";
    if (!adultoResponsable.trim()) return "Debe seleccionar un adulto responsable.";
    if (students.length === 0) return "Debe asociar al menos un estudiante.";
    if (!fechaHora.trim()) return "Debe seleccionar la fecha y hora en que ocurrió el incidente.";
    if (!lugar) return "Debe seleccionar el lugar del incidente.";
    if (categorias.size === 0) return "Debe seleccionar al menos una categoría.";
    return null;
  };

  const handleSubmit = async () => {
    setMensaje("");
    setError("");

    const validationError = validarFormulario();
    if (validationError) {
      setError(validationError);
      return;
    }

    const payload = {
        titulo,
        descripcion: description,
        fecha: fechaHora,
        estudiantes: students.map((student) => student.name),
        nombre_docente: adultoResponsable,
        gravedad: gravedad,
        lugar: lugar,
        categorias: Array.from(categorias)
        
    };

    try {
      setLoading(true);
      const incidenteCreado = await registrarIncidente(payload);

      mostrarNotificacion(`Incidente registrado correctamente. Folio: ${incidenteCreado.id_i}`);

      setTitulo("");
      setDescription("");
      setAdultoResponsable("");
      setStudents([]);
      
      if (props.onSwitch) {
        setTimeout(() => {
          props.onSwitch();
        }, 2500);
      }

    } catch (err) {
      console.error(err);
      setError("No se pudo registrar el incidente. Revise la conexión con el backend.");
    } finally {
      setLoading(false);
    }
  };

  const charCount = description.length;
  const fechaHoraRef = useRef(null);

  const abrirSelectorFechaHora = () => {
    const input = fechaHoraRef.current;
    if (input && typeof input.showPicker === "function") {
      try {
        input.showPicker();
      } catch {

      }
    }
  };

  return (
    <div className="page">
      <div className="breadcrumb">
        <a href="#">Registro de Incidentes</a>
        <span className="sep"><Icon name="chev" size={13} /></span>
        <span className="current">Nuevo Registro</span>
      </div>

      {mensaje && (
        <div className="info-banner">
          <span className="ico"><Icon name="check" size={16} /></span>
          <div>{mensaje}</div>
        </div>
      )}

      {error && (
        <div 
          className="info-banner" 
          style={{ 
            position: "fixed",
            bottom: "28px",
            right: "36px",
            width: "380px",
            maxWidth: "90vw",
            borderColor: "#e2b6a4", 
            background: "#fbeee8", 
            color: "#8a2a14",
            boxShadow: "0 8px 24px rgba(138, 42, 20, 0.15)",
            zIndex: 9999,
            margin: 0,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
            <span className="ico" style={{ color: "#8a2a14", marginTop: "2px" }}>
              <Icon name="triangle" size={16} />
            </span>
            <div>{error}</div>
          </div>
          <button 
            type="button"
            onClick={() => setError("")}
            style={{
              background: "transparent",
              border: 0,
              color: "#8a2a14",
              fontSize: "18px",
              fontWeight: "bold",
              lineHeight: 1,
              padding: "0 4px",
              cursor: "pointer"
            }}
            aria-label="Cerrar alerta"
          >
            ×
          </button>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h2>Detalle del Incidente</h2>
          <p>Complete la información requerida para registrar un nuevo suceso de Convivencia Escolar.</p>
        </div>

        <section className="section">
          <h3 className="section-title">
            <span className="ico"><Icon name="calendar" size={16} /></span>
            Contexto del Suceso
          </h3>

          <div className="grid-2">
            <div className="field">
              <label>Fecha y Hora</label>
              <div className="datetime-control">
                <input
                    ref={fechaHoraRef}
                    type="datetime-local"
                    value={fechaHora}
                    onChange={(event) => setFechaHora(event.target.value)}
                />
                <button
                    type="button"
                    className="datetime-picker-button"
                    onClick={abrirSelectorFechaHora}
                    aria-label="Abrir selector de fecha y hora"
                >
                    <Icon name="calendar" size={16} />
                </button>
              </div>
            </div>

            <div className="field">
              <label>Lugar del Incidente</label>
              <select value={lugar} onChange={(e) => setLugar(e.target.value)}>
                <option value="" disabled>Seleccione ubicación</option>
                <option>Sala de clases</option>
                <option>Patio principal</option>
                <option>Comedor</option>
                <option>Pasillo segundo piso</option>
                <option>Cancha deportiva</option>
                <option>Biblioteca</option>
                <option>Baños</option>
                <option>Fuera del establecimiento</option>
              </select>
            </div>
          </div>

          <div className="field" style={{ marginTop: 18 }}>
            <label>Gravedad Percibida</label>
            <div className="seg">
              {[
                { key: "leve", label: "Leve" },
                { key: "moderado", label: "Moderado" },
                { key: "grave", label: "Grave / Crítico" },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  className={gravedad === item.key ? `active ${item.key}` : ""}
                  onClick={() => setGravedad(item.key)}
                >
                  <span className="pill-dot"></span>
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <h3 className="section-title">
            <span className="ico"><Icon name="users" size={16} /></span>
            Personas Involucradas
          </h3>

          <div className="field">
            <label>Estudiantes</label>
            <div className="search-input" style={{ position: "relative" }}>
              <Icon name="search" size={16} />
              <input
                type="text"
                placeholder="Escriba el nombre del estudiante (Ej: Benjamín)..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
              
              {estudiantesFiltrados.length > 0 && (
                <div style={{
                  position: "absolute", top: "100%", left: 0, width: "100%",
                  backgroundColor: "#fff", border: "1px solid var(--line)",
                  borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  zIndex: 10, maxHeight: "200px", overflowY: "auto", marginTop: "4px"
                }}>
                  {estudiantesFiltrados.map((estudiante) => (
                    <div
                      key={estudiante.id}
                      onClick={() => handleAddStudent(estudiante)}
                      style={{
                        padding: "10px 14px", cursor: "pointer",
                        borderBottom: "1px solid var(--line-2)",
                        display: "flex", justifyContent: "space-between",
                        backgroundColor: "#fff", color: "var(--ink-900)", textAlign: "left"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--bg)"}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#fff"}
                    >
                      <strong>{estudiante.name}</strong>
                      <span style={{ color: "var(--ink-500)", fontSize: "12px" }}>{estudiante.grade}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="chips">
              {students.map((student) => (
                <span className="chip" key={student.id}>
                  <span className="avatar-sm">{student.initials}</span>
                  <span className="name">{student.name} ({student.grade})</span>
                  <button
                    type="button"
                    className="x"
                    onClick={() => removeStudent(student.id)}
                    aria-label="Eliminar estudiante"
                  >
                    <Icon name="x" size={12} stroke={2.5} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="field" style={{ marginTop: 18 }}>
            <label>Adulto Responsable al momento del incidente</label>
            <select
              value={adultoResponsable}
              onChange={(event) => setAdultoResponsable(event.target.value)}
            >
              <option value="" disabled>Seleccione docente o inspector</option>
              <option value="Profesora de Lenguaje - Carla Mendoza">Profesora de Lenguaje - Carla Mendoza</option>
              <option value="Profesor de Matemáticas - Rodrigo Salazar">Profesor de Matemáticas - Rodrigo Salazar</option>
              <option value="Inspectora - Andrea Pinto">Inspectora - Andrea Pinto</option>
              <option value="Inspector general - Luis Cárcamo">Inspector general - Luis Cárcamo</option>
              <option value="Encargada de Convivencia - Paula Soto">Encargada de Convivencia - Paula Soto</option>
            </select>
          </div>
        </section>

        <section className="section">
          <h3 className="section-title">
            <span className="ico"><Icon name="doc" size={16} /></span>
            Relato de los Hechos
          </h3>

          <div className="field" style={{ marginBottom: 18 }}>
            <label>Título del incidente</label>
            <input
              type="text"
              placeholder="Ej: Discusión entre estudiantes en sala de clases"
              value={titulo}
              onChange={(event) => setTitulo(event.target.value)}
            />
          </div>

          <div className="field">
            <label>Descripción detallada</label>
            <textarea
              placeholder="Describa de manera objetiva los hechos observados, evitando juicios de valor."
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            ></textarea>
            <div className="char-count">
              {charCount < 50
                ? `Mínimo 50 caracteres recomendados. (${charCount}/50)`
                : `${charCount} caracteres`}
            </div>
          </div>
        </section>

        <section className="section">
          <h3 className="section-title">
            <span className="ico"><Icon name="tag" size={16} /></span>
            Categorización
          </h3>
          <p style={{ marginTop: -10, marginBottom: 14, color: "var(--ink-500)", fontSize: 13.5 }}>
            Seleccione una o más categorías que mejor describan el suceso.
          </p>

          <div className="tag-grid">
            {categories.map((category) => {
              const selected = categorias.has(category);
              return (
                <div
                  key={category}
                  className={`tag-check ${selected ? "checked" : ""}`}
                  onClick={() => toggleCat(category)}
                >
                  <span className="box">
                    {selected && <Icon name="check" size={11} />}
                  </span>
                  <span>{category}</span>
                </div>
              );
            })}
          </div>
        </section>

        <div className="form-actions">
          <div className="draft-status">
            
          </div>

          <div className="actions-right">
            
            <button
              type="button"
              className="btn-solid"
              onClick={handleSubmit}
              disabled={loading}
            >
              <Icon name="check" size={15} stroke={2.5} />
              {loading ? "Registrando..." : "Registrar Incidente"}
            </button>
          </div>
        </div>
      </div>

      {toast.mostrar && (
        <div style={{
          position: "fixed", bottom: "24px", right: "24px",
          backgroundColor: "#f0fdf4",
          color: "#166534",
          border: "1px solid #4ade80",
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

export default RegistrarIncidente;