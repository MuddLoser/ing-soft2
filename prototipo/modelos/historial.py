"""
Modelo: Historial
Descripcion: Registro de incidentes pasados de un estudiante.

Relacion: agrupa 1..* Incidentes asociados a un Estudiante (por rut)
"""

from datetime import datetime


class Historial:
    def __init__(self, rut_estudiante: str):
        self.rut_estudiante = rut_estudiante
        self.incidentes_ids: list[int] = []
        self.created_at = datetime.now().isoformat()

    def agregar_incidente(self, incidente_id: int) -> None:
        if incidente_id not in self.incidentes_ids:
            self.incidentes_ids.append(incidente_id)

    def to_dict(self) -> dict:
        return {
            "rut_estudiante": self.rut_estudiante,
            "incidentes_ids": list(self.incidentes_ids),
            "created_at": self.created_at,
        }
