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

export async function buscarIncidentesEnBackend(termino, fecha, gravedad) {
  const params = new URLSearchParams();

  if (termino) params.append("termino", termino);
  if (fecha) params.append("fecha", fecha);
  if (gravedad && gravedad !== "todas") {
    params.append("gravedad", gravedad);
  }

  const url = `${API_URL}/incidentes/buscar?${params.toString()}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Error al obtener los datos filtrados");
  }

  return response.json();
}

export async function editarIncidenteCompleto(id, datosEditados) {
  const response = await fetch(`${API_URL}/incidentes/${id}/editar`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      titulo: datosEditados.titulo,
      descripcion: datosEditados.descripcion,
      estudiantes: datosEditados.estudiantes,
      solucion: datosEditados.solucion,
      plan_accion: datosEditados.plan_accion 
    }),
  });

  if (!response.ok) {
    throw new Error("Error al actualizar los datos del incidente.");
  }

  return response.json();
}

export async function crearReincidencia(data) {
  const response = await fetch(`${API_URL}/reincidencias`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const detail = errorData?.detail || "No se pudo crear la reincidencia";

    throw new Error(detail);
  }

  return response.json();
}

export async function obtenerReincidencias() {
  const response = await fetch(`${API_URL}/reincidencias`);

  if (!response.ok) {
    throw new Error("No se pudieron obtener las reincidencias");
  }

  return response.json();
}
