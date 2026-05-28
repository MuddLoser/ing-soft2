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
