import { useEffect, useState } from "react";
import Icon from "../../../shared/icons/Icon";
import { obtenerIncidentes } from "../../../api/incidentesApi";

function ListarIncidentes(props) {
  const [incidentes, setIncidentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedIncidente, setSelectedIncidente] = useState(null);

  useEffect(() => {
    cargarIncidentes();
  }, []);

  const cargarIncidentes = async () => {
    try {
      setLoading(true);
      const datos = await obtenerIncidentes();
      setIncidentes(datos);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los incidentes.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="breadcrumb">
        <a href="#">Registro de Incidentes</a>
        <span className="sep">
          <Icon name="chev" size={13} />
        </span>
        <span className="current">Listado</span>
      </div>

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
          <h2>Incidentes Registrados</h2>
          <p>Lista de todos los incidentes guardados en el sistema.</p>
          <button
            onClick={() => props.onSwitch && props.onSwitch()}
            style={{
              marginTop: "10px",
              background: "#0d5c50",
              color: "white",
              border: "none",
              padding: "8px 16px",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Registrar Nuevo Incidente
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "20px" }}>Cargando incidentes...</div>
        ) : incidentes.length === 0 ? (
          <div style={{ textAlign: "center", padding: "20px", color: "#666" }}>
            No hay incidentes registrados aún.
          </div>
        ) : (
          <div className="incidentes-list">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #ddd" }}>
                  <th style={{ textAlign: "left", padding: "10px" }}>ID</th>
                  <th style={{ textAlign: "left", padding: "10px" }}>Título</th>
                  <th style={{ textAlign: "left", padding: "10px" }}>Fecha</th>
                  <th style={{ textAlign: "left", padding: "10px" }}>Estado</th>
                  <th style={{ textAlign: "left", padding: "10px" }}>Reportado por</th>
                  <th style={{ textAlign: "center", padding: "10px" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {incidentes.map((inc) => (
                  <tr key={inc.id_i} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "10px" }}>{inc.id_i}</td>
                    <td style={{ padding: "10px" }}>{inc.titulo_i}</td>
                    <td style={{ padding: "10px" }}>{inc.fecha_i}</td>
                    <td style={{ padding: "10px" }}>{inc.estado_i}</td>
                    <td style={{ padding: "10px" }}>{inc.reportado_por}</td>
                    <td style={{ textAlign: "center", padding: "10px" }}>
                      <button
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#0d5c50",
                        }}
                        onClick={() => setSelectedIncidente(inc)}
                      >
                        <Icon name="doc" size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedIncidente && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}>
          <div style={{
            background: "white",
            borderRadius: "8px",
            padding: "24px",
            maxWidth: "600px",
            width: "90%",
            maxHeight: "80vh",
            overflowY: "auto",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2>Detalle del Incidente</h2>
              <button
                onClick={() => setSelectedIncidente(null)}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "24px" }}
              >
                ×
              </button>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <strong>ID:</strong> {selectedIncidente.id_i}
            </div>
            <div style={{ marginBottom: "12px" }}>
              <strong>Título:</strong> {selectedIncidente.titulo_i}
            </div>
            <div style={{ marginBottom: "12px" }}>
              <strong>Fecha:</strong> {selectedIncidente.fecha_i}
            </div>
            <div style={{ marginBottom: "12px" }}>
              <strong>Estado:</strong> {selectedIncidente.estado_i}
            </div>
            <div style={{ marginBottom: "12px" }}>
              <strong>Reportado por:</strong> {selectedIncidente.reportado_por}
            </div>
            <div style={{ marginBottom: "12px" }}>
              <strong>Estudiantes involucrados:</strong> {selectedIncidente.estudiantes_asociados.join(", ") || "Ninguno"}
            </div>
            <div style={{ marginBottom: "12px" }}>
              <strong>Descripción:</strong>
              <p style={{ background: "#f5f5f5", padding: "10px", borderRadius: "4px", marginTop: "8px" }}>
                {selectedIncidente.descripcion_i}
              </p>
            </div>

            <button
              onClick={() => setSelectedIncidente(null)}
              style={{
                background: "#0d5c50",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ListarIncidentes;
