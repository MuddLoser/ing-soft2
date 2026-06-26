import { useEffect, useMemo, useState } from "react";
import Icon from "../../../shared/icons/Icon";
import {
  getEstudiantes,
  obtenerIncidentes,
  crearReincidencia,
} from "../../../api/incidentesApi";

const OBJECTIVES = [
  "Reducir la frecuencia de incidentes",
  "Acompañamiento psicosocial",
  "Mediación entre pares",
  "Compromiso conductual",
  "Seguimiento con apoderado",
  "Derivación a redes externas",
];

function getInitials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

function getLocalDateInputValue(daysToAdd = 0) {
  const date = new Date();
  date.setDate(date.getDate() + daysToAdd);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function normalizarEstudiante(student) {
  const name = student.name || student.nombre || student.nombre_completo || "Sin nombre";

  return {
    id: student.id || student.id_estudiante || student.rut || name,
    name,
    grade: student.grade || student.curso || "Sin curso",
    rut: student.rut || "RUT no registrado",
    initials: student.initials || getInitials(name),
  };
}

function normalizarIncidente(inc) {
  const estudiantes = inc.estudiantes_asociados || inc.estudiantes || [];

  return {
    ...inc,
    id: inc.id_i,
    folio: `INC-${inc.id_i}`,
    title: inc.titulo_i || inc.titulo || "Incidente sin título",
    description: inc.descripcion_i || inc.descripcion || "Sin descripción.",
    date: inc.fecha_i || inc.fecha || "Fecha no disponible",
    students: estudiantes,
    responsible: inc.reportado_por || inc.nombre_docente || "Sin responsable",
    severity:
      inc.gravedad ||
      inc.severity ||
      (inc.estado_i === "Formalizado" ? "grave" : "moderado"),
    cat: inc.categoria || inc.titulo_i || "Incidente",
    place: inc.lugar || "-",
    status: inc.estado_i || "Sin estado",
  };
}

function CrearReincidencia({ onSwitch }) {
  const [incidentes, setIncidentes] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);

  const [loadingIncidentes, setLoadingIncidentes] = useState(true);
  const [loadingEstudiantes, setLoadingEstudiantes] = useState(true);

  const [query, setQuery] = useState("");
  const [sevFilter, setSevFilter] = useState("todas");
  const [selectedIds, setSelectedIds] = useState(new Set());

  const [focusPersons, setFocusPersons] = useState([]);
  const [focusSearch, setFocusSearch] = useState("");
  const [focusEdited, setFocusEdited] = useState(false);

  const [objetivos, setObjetivos] = useState(
    new Set([OBJECTIVES[0], OBJECTIVES[4]])
  );
  const [responsable, setResponsable] = useState("");
  const [revisionDate, setRevisionDate] = useState(getLocalDateInputValue(14));
  const [analysis, setAnalysis] = useState("");

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    obtenerIncidentes()
      .then((data) => setIncidentes(data || []))
      .catch((error) => {
        console.error(error);
        setErrorMessage("No se pudieron cargar los incidentes.");
      })
      .finally(() => setLoadingIncidentes(false));
  }, []);

  useEffect(() => {
    getEstudiantes()
      .then((data) => setEstudiantes((data || []).map(normalizarEstudiante)))
      .catch((error) => {
        console.error(error);
      })
      .finally(() => setLoadingEstudiantes(false));
  }, []);

  const incidentesConMeta = useMemo(() => {
    return incidentes.map(normalizarIncidente);
  }, [incidentes]);

  const incidentesFiltrados = useMemo(() => {
    const q = query.trim().toLowerCase();

    return incidentesConMeta.filter((inc) => {
      const texto = [
        inc.id,
        inc.folio,
        inc.title,
        inc.description,
        inc.responsible,
        inc.students.join(" "),
      ]
        .join(" ")
        .toLowerCase();

      const okQ = !q || texto.includes(q);
      const okS = sevFilter === "todas" || inc.severity?.toLowerCase() === sevFilter;

      return okQ && okS;
    });
  }, [incidentesConMeta, query, sevFilter]);

  const selectedIncidents = useMemo(() => {
    return incidentesConMeta.filter((inc) => selectedIds.has(inc.id));
  }, [incidentesConMeta, selectedIds]);

  const personasFocoSugeridas = useMemo(() => {
    const conteo = new Map();

    selectedIncidents.forEach((incidente) => {
      incidente.students.forEach((studentName) => {
        const actual = conteo.get(studentName) || 0;
        conteo.set(studentName, actual + 1);
      });
    });

    const repetidos = Array.from(conteo.entries())
      .filter(([, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1]);

    return repetidos.map(([name, count]) => {
      const estudianteCompleto = estudiantes.find(
        (student) => student.name === name
      );

      return {
        id: estudianteCompleto?.id || name,
        name,
        count,
        initials: estudianteCompleto?.initials || getInitials(name),
        grade: estudianteCompleto?.grade || "Curso no registrado",
        rut: estudianteCompleto?.rut || "RUT no registrado",
      };
    });
  }, [selectedIncidents, estudiantes]);

  useEffect(() => {
    if (!focusEdited) {
      setFocusPersons(personasFocoSugeridas);
    }
  }, [personasFocoSugeridas, focusEdited]);

  const focusSearchResults = useMemo(() => {
    const q = focusSearch.trim().toLowerCase();

    if (!q) return [];

    return estudiantes.filter((student) => {
      const alreadyAdded = focusPersons.some(
        (person) => person.name === student.name
      );

      return student.name.toLowerCase().includes(q) && !alreadyAdded;
    });
  }, [focusSearch, estudiantes, focusPersons]);

  const personasInvolucradasSecundarias = useMemo(() => {
    const focusNames = new Set(focusPersons.map((person) => person.name));
    const involucradas = new Set();

    selectedIncidents.forEach((incidente) => {
      incidente.students.forEach((studentName) => {
        if (!focusNames.has(studentName)) {
          involucradas.add(studentName);
        }
      });
    });

    return Array.from(involucradas);
  }, [selectedIncidents, focusPersons]);

  const toggleIncident = (id) => {
    const next = new Set(selectedIds);

    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }

    setSelectedIds(next);
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
    setFocusEdited(false);
  };

  const addFocusPerson = (person) => {
    setFocusPersons([...focusPersons, person]);
    setFocusSearch("");
    setFocusEdited(true);
  };

  const removeFocusPerson = (id) => {
    setFocusPersons(focusPersons.filter((person) => person.id !== id));
    setFocusEdited(true);
  };

  const applyAutomaticFocusSuggestion = () => {
    setFocusPersons(personasFocoSugeridas);
    setFocusEdited(false);
  };

  const toggleObjective = (objective) => {
    const next = new Set(objetivos);

    if (next.has(objective)) {
      next.delete(objective);
    } else {
      next.add(objective);
    }

    setObjetivos(next);
  };

  const validarFormulario = () => {
    if (selectedIncidents.length < 2) {
      return "Seleccione al menos 2 incidentes para agrupar en la reincidencia.";
    }

    if (focusPersons.length === 0) {
      return "Debe confirmar al menos una persona foco para crear la reincidencia.";
    }

    if (!responsable.trim()) {
      return "Debe seleccionar un responsable de seguimiento.";
    }

    if (!revisionDate.trim()) {
      return "Debe seleccionar una fecha de revisión.";
    }

    if (objetivos.size === 0) {
      return "Debe seleccionar al menos un objetivo de seguimiento.";
    }

    if (!analysis.trim()) {
      return "Debe detallar el análisis y las medidas a implementar.";
    }

    return null;
  };

  const handleSubmit = async () => {
    setSuccessMessage("");
    setErrorMessage("");

    const error = validarFormulario();

    if (error) {
      setErrorMessage(error);
      return;
    }

    const payload = {
      personas_foco: focusPersons.map((person) => person.name),
      personas_involucradas: personasInvolucradasSecundarias,
      incidentes_asociados: selectedIncidents.map((inc) => Number(inc.id)),
      encargado_seguimiento: responsable,
      fecha_revision: revisionDate,
      objetivos: Array.from(objetivos),
      analisis: analysis,
    };

    try {
      setSaving(true);

      const reincidenciaCreada = await crearReincidencia(payload);

      setSuccessMessage(
        `Reincidencia registrada correctamente. Folio: ${reincidenciaCreada.id_r}`
      );

      setSelectedIds(new Set());
      setFocusPersons([]);
      setFocusSearch("");
      setFocusEdited(false);
      setResponsable("");
      setRevisionDate(getLocalDateInputValue(14));
      setObjetivos(new Set([OBJECTIVES[0], OBJECTIVES[4]]));
      setAnalysis("");

      if (onSwitch) {
        setTimeout(() => {
          onSwitch();
        }, 1500);
      }
    } catch (error) {
      console.error(error);
      setErrorMessage(
        error.message ||
          "No se pudo registrar la reincidencia. Revise la conexión con el backend."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page reincidencia-page">

      {successMessage && (
        <div
          className="info-banner"
          style={{
            borderColor: "#cfe4df",
            background: "#eef5f1",
            color: "#1f5a37",
          }}
        >
          <span className="ico">
            <Icon name="check" size={16} />
          </span>
          <div>{successMessage}</div>
        </div>
      )}


      <div className="reincidencia-layout">
        <div className="card reincidencia-card">
          <div className="card-header reincidencia-card-header">
            <div className="reincidencia-header-content">
              <h2>Registrar Reincidencia</h2>
              <p>
                Agrupa incidentes relacionados para detectar un patrón de conducta,
                organizar el seguimiento y definir medidas de intervención.
              </p>
            </div>
          </div>
          {errorMessage && (
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
                alignItems: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  alignItems: "flex-start",
                }}
              >
                <span
                  className="ico"
                  style={{
                    color: "#8a2a14",
                    marginTop: "2px",
                  }}
                >
                  <Icon name="triangle" size={16} />
                </span>

                <div>{errorMessage}</div>
              </div>

              <button
                type="button"
                onClick={() => setErrorMessage("")}
                style={{
                  background: "transparent",
                  border: 0,
                  color: "#8a2a14",
                  fontSize: "18px",
                  fontWeight: "bold",
                  lineHeight: 1,
                  padding: "0 4px",
                  cursor: "pointer",
                }}
                aria-label="Cerrar alerta"
              >
                ×
              </button>
            </div>
          )}

      

          <section className="section">
            <h3 className="section-title">
              <span className="ico">
                <Icon name="link" size={16} />
              </span>
              Incidentes a Agrupar
            </h3>

            <p className="section-sub">
              Seleccione los incidentes previos que conforman esta situación reiterada.
            </p>

            {selectedIds.size > 0 && (
              <div className="selcount-bar">
                <span>
                  <strong>{selectedIds.size}</strong> incidente
                  {selectedIds.size !== 1 ? "s" : ""} seleccionado
                  {selectedIds.size !== 1 ? "s" : ""}
                </span>

                <button type="button" className="clear" onClick={clearSelection}>
                  Limpiar selección
                </button>
              </div>
            )}

            <div className="pick-toolbar">
              <div className="search-input">
                <Icon name="search" size={16} />
                <input
                  type="text"
                  placeholder="Buscar por folio, título o estudiante..."
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </div>

              <select
                className="filter-select"
                value={sevFilter}
                onChange={(event) => setSevFilter(event.target.value)}
              >
                <option value="todas">Toda gravedad</option>
                <option value="leve">Leve</option>
                <option value="moderado">Moderado</option>
                <option value="grave">Grave</option>
              </select>
            </div>

            {loadingIncidentes ? (
              <div className="empty-state">Cargando incidentes...</div>
            ) : incidentesFiltrados.length === 0 ? (
              <div className="empty-state">
                No se encontraron incidentes con esos criterios.
              </div>
            ) : (
              incidentesFiltrados.map((inc) => {
                const selected = selectedIds.has(inc.id);

                return (
                  <div
                    key={inc.id}
                    className={`inc-row ${selected ? "sel" : ""}`}
                    onClick={() => toggleIncident(inc.id)}
                  >
                    <div className="inc-check">
                      {selected && <Icon name="check" size={13} />}
                    </div>

                    <div className="inc-body">
                      <div className="inc-top">
                        <span className="inc-folio">Folio {inc.id}</span>

                        <span className={`sev-badge ${inc.severity}`}>
                          {inc.severity?.slice(0, 1).toUpperCase() +
                            inc.severity?.slice(1)}
                        </span>

                        <span className="inc-date">{inc.date}</span>
                      </div>

                      <div className="inc-summary">
                        <strong>{inc.title}</strong>
                        <br />
                        {inc.description}
                      </div>

                      <div className="inc-foot">
                        <span className="meta-item">
                          <Icon name="triangle" size={13} /> {inc.cat}
                        </span>

                        <span className="meta-item">
                          <Icon name="pin" size={13} /> {inc.place}
                        </span>

                        <span className="meta-item">
                          <Icon name="users" size={13} />{" "}
                          {inc.students.length > 0 ? inc.students.join(", ") : "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </section>

          <section className="section">
            <h3 className="section-title">
              <span className="ico">
                <Icon name="users" size={16} />
              </span>
              Personas foco del patrón
            </h3>

            <p className="section-sub">
              El sistema sugiere estudiantes que aparecen repetidamente en los incidentes
              seleccionados. Puede confirmar, quitar o agregar personas foco manualmente.
            </p>

            {personasFocoSugeridas.length > 0 && (
              <div className="info-banner" style={{ marginBottom: 14 }}>
                <span className="ico">
                  <Icon name="check" size={16} />
                </span>

                <div>
                  Sugerencia automática: {" "}
                  <strong>
                    {personasFocoSugeridas.map((person) => person.name).join(", ")}
                  </strong>
                  .
                  {focusEdited && (
                    <button
                      type="button"
                      className="clear"
                      onClick={applyAutomaticFocusSuggestion}
                      style={{ marginLeft: 10 }}
                    >
                      Usar sugerencia
                    </button>
                  )}
                </div>
              </div>
            )}

            {focusPersons.length > 0 ? (
              <div className="chips" style={{ marginBottom: 14 }}>
                {focusPersons.map((person) => (
                  <span key={person.id} className="chip">
                    <span className="avatar-sm">{person.initials}</span>
                    <span className="name">
                      {person.name}
                      {person.count ? ` · ${person.count} incidentes` : ""}
                    </span>

                    <button
                      type="button"
                      className="x"
                      onClick={() => removeFocusPerson(person.id)}
                      aria-label="Quitar persona foco"
                    >
                      <Icon name="x" size={12} stroke={2.5} />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <div className="empty-state" style={{ marginBottom: 14 }}>
                No hay personas foco confirmadas. Seleccione incidentes con estudiantes
                repetidos o agregue una persona manualmente.
              </div>
            )}

            <div className="field">
              <label>Agregar persona foco manualmente</label>

              <div className="search-input">
                <Icon name="search" size={16} />
                <input
                  type="text"
                  placeholder="Buscar estudiante por nombre..."
                  value={focusSearch}
                  onChange={(event) => setFocusSearch(event.target.value)}
                />
              </div>

              {loadingEstudiantes && focusSearch && (
                <div className="empty-state" style={{ marginTop: 10 }}>
                  Cargando estudiantes...
                </div>
              )}

              {focusSearchResults.length > 0 && (
                <div className="search-results">
                  {focusSearchResults.map((student) => (
                    <button
                      key={student.id}
                      type="button"
                      className="result-item"
                      onClick={() => addFocusPerson(student)}
                    >
                      <span>{student.name}</span>
                      <span>{student.grade}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {personasInvolucradasSecundarias.length > 0 && (
              <p className="section-sub" style={{ marginTop: 14, marginBottom: 0 }}>
                Personas involucradas secundarias: {personasInvolucradasSecundarias.join(", ")}.
              </p>
            )}
          </section>

          <section className="section">
            <h3 className="section-title">
              <span className="ico">
                <Icon name="target" size={16} />
              </span>
              Plan de Seguimiento
            </h3>

            <p className="section-sub">
              Defina responsables, objetivos y la próxima instancia de revisión del caso.
            </p>

            <div className="grid-2">
              <div className="field">
                <label>Encargado de seguimiento</label>

                <select
                  value={responsable}
                  onChange={(event) => setResponsable(event.target.value)}
                >
                  <option value="" disabled>
                    Seleccione responsable
                  </option>
                  <option>Encargada de Convivencia — Paula Soto</option>
                  <option>Inspectora General — Andrea Pinto</option>
                  <option>Orientadora — Felipe Naranjo</option>
                  <option>Dupla psicosocial</option>
                </select>
              </div>

              <div className="field">
                <label>Fecha de revisión</label>

                <input
                  type="date"
                  value={revisionDate}
                  onChange={(event) => setRevisionDate(event.target.value)}
                />
              </div>
            </div>

            <div className="field" style={{ marginTop: 16 }}>
              <label>Objetivos del seguimiento</label>

              <div className="chips">
                {OBJECTIVES.map((objective) => (
                  <button
                    key={objective}
                    type="button"
                    className={`obj-chip ${objetivos.has(objective) ? "on" : ""}`}
                    onClick={() => toggleObjective(objective)}
                  >
                    {objetivos.has(objective) && (
                      <Icon name="check" size={12} stroke={3} />
                    )}
                    {objective}
                  </button>
                ))}
              </div>
            </div>

            <div className="field" style={{ marginTop: 16 }}>
              <label>Análisis y medidas a implementar</label>

              <textarea
                placeholder="Describa el patrón observado, las hipótesis sobre sus causas y las acciones concretas que se tomarán para interrumpir la reiteración."
                value={analysis}
                onChange={(event) => setAnalysis(event.target.value)}
              />
            </div>
          </section>

          <div className="form-actions">
            <div className="draft-status">
              Complete los campos requeridos para crear la reincidencia
            </div>

            <div className="actions-right">
              <button
                type="button"
                className="btn-ghost"
                onClick={() => onSwitch?.()}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="btn-solid"
                disabled={saving}
                onClick={handleSubmit}
              >
                <Icon name="link" size={15} stroke={2.5} />
                {saving ? "Creando..." : "Crear Reincidencia"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CrearReincidencia;
