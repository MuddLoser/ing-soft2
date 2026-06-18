const API_URL = "http://localhost:8000";

export async function registrarIncidente(data) {
  const response = await fetch(`${API_URL}/incidentes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Error al registrar el incidente");
  }

  return response.json();
}

export async function obtenerIncidentes() {
  const response = await fetch(`${API_URL}/incidentes`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Error al obtener incidentes");
  }

  return response.json();
}

export async function formalizarIncidente(id) {
  const response = await fetch(`${API_URL}/incidentes/${id}/formalizar`, {
    method: "PUT",
  });
  if (!response.ok) throw new Error("Error al formalizar");
  return response.json();
}

export async function asignarSolucion(id, planAccion, solucion) {
  const response = await fetch(`${API_URL}/incidentes/${id}/solucion`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ 
      plan_accion: planAccion, 
      solucion: solucion 
    }),
  });
  
  if (!response.ok) {
    throw new Error("Error al registrar las medidas de resolución.");
  }
  
  return response.json();
}

export async function getEstudiantes() {
  const response = await fetch(`${API_URL}/estudiantes`);
  if (!response.ok) {
    throw new Error("Error al obtener la lista de estudiantes");
  }
  return response.json();
}

export async function buscarIncidentesEnBackend(termino) {
  const url = termino 
    ? `${API_URL}/incidentes/buscar?termino=${encodeURIComponent(termino)}`
    : `${API_URL}/incidentes/buscar`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Error al obtener los datos filtrados del servidor.");
  }
  return response.json();
}