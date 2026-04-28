"""
Modelo: Conflicto
Descripcion: Situacion problematica derivada de un patron de incidentes,
             requiriendo de una solucion mas compleja y monitoreada.

Atributos del modelo conceptual: id_c, titulo_c, descripcion_c, fecha_c, estado_c
Relacion: agrupa 2..* Incidentes; puede estar vinculado a 0..1 Solucion
"""

from datetime import datetime

ESTADOS_VALIDOS = ("abierto", "en_seguimiento", "cerrado")


class Conflicto:
    def __init__(
        self,
        titulo_c: str,
        descripcion_c: str,
        incidentes_ids: list[int],
        solucion_id: int | None = None,
    ):
        self.id_c: int | None = None  # asignado al persistir
        self.titulo_c = titulo_c
        self.descripcion_c = descripcion_c
        self.fecha_c = datetime.now().isoformat()
        self.estado_c = "abierto"
        # Atributos de implementacion
        self.incidentes_ids = list(incidentes_ids)
        self.solucion_id = solucion_id

    def to_dict(self) -> dict:
        return {
            "id_c": self.id_c,
            "titulo_c": self.titulo_c,
            "descripcion_c": self.descripcion_c,
            "fecha_c": self.fecha_c,
            "estado_c": self.estado_c,
            "incidentes_ids": self.incidentes_ids,
            "solucion_id": self.solucion_id,
        }
