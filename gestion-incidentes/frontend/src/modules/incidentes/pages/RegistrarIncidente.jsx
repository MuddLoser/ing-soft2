import { useRef, useState } from "react";
import Icon from "../../../shared/icons/Icon";
import { registrarIncidente } from "../../../api/incidentesApi";


const initialStudents = [
  { id: 1, name: "Martina Vargas", grade: "2°A", initials: "MV" },
  { id: 2, name: "Joaquín López", grade: "2°A", initials: "JL" },
];

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

function RegistrarIncidente() {
  const [titulo, setTitulo] = useState("");
  const [severity, setSeverity] = useState("moderado");
  const [students, setStudents] = useState(initialStudents);
  const [searchTerm, setSearchTerm] = useState("");
  const [description, setDescription] = useState("");
  const [adultoResponsable, setAdultoResponsable] = useState("");
  const [selectedCats, setSelectedCats] = useState(
    new Set(["Conducta disruptiva en aula"])
  );
  const [files, setFiles] = useState([
    { name: "fotografía-pasillo.jpg", size: "1.2 MB" },
  ]);

  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const removeStudent = (id) => {
    setStudents(students.filter((s) => s.id !== id));
  };

  const toggleCat = (category) => {
    const next = new Set(selectedCats);

    if (next.has(category)) {
      next.delete(category);
    } else {
      next.add(category);
    }

    setSelectedCats(next);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, idx) => idx !== index));
  };

  const validarFormulario = () => {
    if (!titulo.trim()) {
      return "Debe ingresar un título para el incidente.";
    }

    if (!description.trim()) {
      return "Debe ingresar una descripción del incidente.";
    }

    if (!adultoResponsable.trim()) {
      return "Debe seleccionar un adulto responsable.";
    }

    if (students.length === 0) {
      return "Debe asociar al menos un estudiante.";
    }

    if (!fechaHora.trim()) {
        return "Debe seleccionar la fecha y hora en que ocurrió el incidente.";
    }

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
    };

    try {
      setLoading(true);

      const incidenteCreado = await registrarIncidente(payload);

      setMensaje(
        `Incidente registrado correctamente. Folio: ${incidenteCreado.id_i}`
      );

      setTitulo("");
      setDescription("");
      setAdultoResponsable("");
      setStudents([]);
    } catch (err) {
      console.error(err);
      setError("No se pudo registrar el incidente. Revise la conexión con el backend.");
    } finally {
      setLoading(false);
    }
  };

  const charCount = description.length;
  const fechaHoraRef = useRef(null);
  const fechaActual = new Date();
  fechaActual.setMinutes(fechaActual.getMinutes() - fechaActual.getTimezoneOffset());

  const [fechaHora, setFechaHora] = useState(
  fechaActual.toISOString().slice(0, 16));

  const abrirSelectorFechaHora = () => {
  const input = fechaHoraRef.current;

  if (input && typeof input.showPicker === "function") {
    try {
      input.showPicker();
    } catch {
      // Si el navegador no permite abrir el selector, el input sigue funcionando manualmente.
        }
    }
  };

  return (
    <div className="page">
      <div className="breadcrumb">
        <a href="#">Registro de Incidentes</a>
        <span className="sep">
          <Icon name="chev" size={13} />
        </span>
        <span className="current">Nuevo Registro</span>
      </div>

      {mensaje && (
        <div className="info-banner">
          <span className="ico">
            <Icon name="check" size={16} />
          </span>
          <div>{mensaje}</div>
        </div>
      )}

      {error && (
        <div className="info-banner" style={{ borderColor: "#e2b6a4", background: "#fbeee8", color: "#8a2a14" }}>
          <span className="ico">
            <Icon name="triangle" size={16} />
          </span>
          <div>{error}</div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h2>Detalle del Incidente</h2>
          <p>
            Complete la información requerida para registrar un nuevo suceso de convivencia.
          </p>
        </div>

        <section className="section">
          <h3 className="section-title">
            <span className="ico">
              <Icon name="calendar" size={16} />
            </span>
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

                <span className="hint">
                </span>
            </div>

            <div className="field">
              <label>Lugar del Incidente</label>
              <select defaultValue="">
                <option value="" disabled>
                  Seleccione ubicación
                </option>
                <option>Sala de clases — 2°A</option>
                <option>Patio principal</option>
                <option>Comedor</option>
                <option>Pasillo segundo piso</option>
                <option>Cancha deportiva</option>
                <option>Biblioteca</option>
                <option>Baños</option>
                <option>Fuera del establecimiento</option>
              </select>
              <span className="hint">
                Campo visual preparado para próximas iteraciones.
              </span>
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
                  className={severity === item.key ? `active ${item.key}` : ""}
                  onClick={() => setSeverity(item.key)}
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
            <span className="ico">
              <Icon name="users" size={16} />
            </span>
            Personas Involucradas
          </h3>

          <div className="field">
            <label>Estudiantes</label>

            <div className="search-input">
              <Icon name="search" size={16} />
              <input
                type="text"
                placeholder="Escriba el nombre o RUT del estudiante..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>

            <div className="chips">
              {students.map((student) => (
                <span className="chip" key={student.id}>
                  <span className="avatar-sm">{student.initials}</span>
                  <span className="name">
                    {student.name} ({student.grade})
                  </span>
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
              <option value="" disabled>
                Seleccione docente o inspector
              </option>
              <option value="Profesora Carla Mendoza — Lenguaje">
                Profesora Carla Mendoza — Lenguaje
              </option>
              <option value="Profesor Rodrigo Salazar — Matemáticas">
                Profesor Rodrigo Salazar — Matemáticas
              </option>
              <option value="Inspectora Andrea Pinto">
                Inspectora Andrea Pinto
              </option>
              <option value="Inspector general Luis Cárcamo">
                Inspector general Luis Cárcamo
              </option>
              <option value="Encargada de Convivencia — Paula Soto">
                Encargada de Convivencia — Paula Soto
              </option>
            </select>
          </div>
        </section>

        <section className="section">
          <h3 className="section-title">
            <span className="ico">
              <Icon name="doc" size={16} />
            </span>
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
              placeholder="Describa de manera objetiva los hechos observados, evitando juicios de valor. Incluya acciones previas, el suceso central y las acciones inmediatas tomadas."
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
            <span className="ico">
              <Icon name="tag" size={16} />
            </span>
            Categorización
          </h3>

          <p
            style={{
              marginTop: -10,
              marginBottom: 14,
              color: "var(--ink-500)",
              fontSize: 13.5,
            }}
          >
            Seleccione una o más categorías que mejor describan el suceso.
          </p>

          <div className="tag-grid">
            {categories.map((category) => {
              const selected = selectedCats.has(category);

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

        <section className="section">
          <h3 className="section-title">
            <span className="ico">
              <Icon name="shield" size={16} />
            </span>
            Acciones Inmediatas Tomadas
          </h3>

          <div className="grid-2">
            <div className="field">
              <label>Medida aplicada</label>
              <select defaultValue="">
                <option value="" disabled>
                  Seleccione medida
                </option>
                <option>Diálogo formativo con los involucrados</option>
                <option>Derivación a Encargado de Convivencia</option>
                <option>Citación a apoderado</option>
                <option>Suspensión preventiva</option>
                <option>Mediación entre pares</option>
                <option>Anotación en libro de clases</option>
                <option>Ninguna por el momento</option>
              </select>
            </div>

            <div className="field">
              <label>Notificación al apoderado</label>
              <select defaultValue="pendiente">
                <option value="pendiente">Pendiente</option>
                <option value="realizada">Realizada presencial</option>
                <option value="telef">Realizada telefónica</option>
                <option value="email">Realizada por correo electrónico</option>
                <option value="no">No corresponde</option>
              </select>
            </div>
          </div>
        </section>

        <section className="section">
          <h3 className="section-title">
            <span className="ico">
              <Icon name="paper" size={16} />
            </span>
            Evidencia y Adjuntos
          </h3>

          <div className="upload">
            <div className="up-icon">
              <Icon name="paper" size={18} />
            </div>
            <div>
              <strong>Haga clic para cargar</strong> o arrastre archivos aquí
            </div>
            <div style={{ fontSize: 12.5, marginTop: 4 }}>
              PDF, JPG, PNG o MP4 · Máximo 25 MB por archivo
            </div>
          </div>

          {files.length > 0 && (
            <div className="file-list">
              {files.map((file, index) => (
                <div className="file-row" key={index}>
                  <div className="file-thumb">
                    <Icon name="paper" size={15} />
                  </div>
                  <div className="name">{file.name}</div>
                  <div className="meta">{file.size}</div>
                  <button className="x" onClick={() => removeFile(index)}>
                    <Icon name="x" size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="form-actions">
          <div className="draft-status">
            <span className="dot"></span>
            Borrador guardado automáticamente · simulación
          </div>

          <div className="actions-right">
            <button type="button" className="btn-ghost">
              Cancelar
            </button>

            <button type="button" className="btn-ghost">
              Guardar borrador
            </button>

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
    </div>
  );
}

export default RegistrarIncidente;