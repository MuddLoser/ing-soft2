"""
Modelo: Solucion
Descripcion: Las medidas que se toman como consecuencia de un incidente o conflicto.

Atributos del modelo conceptual: estado_s, descripcion_s, resultados
Relacion: pertenece a 1..1 Incidente; puede derivar en 0..1 Conflicto
"""

from datetime import datetime

ESTADOS_VALIDOS = ("pendiente", "implementada", "cerrada")


class Solucion:
    def __init__(
        self,
        descripcion_s: str,
        resultados: str,
        incidente_id: int,
        registrado_por_id: int,
        registrado_por_nombre: str,
    ):
        self.id: int | None = None  # asignado al persistir
        self.estado_s = "pendiente"
        self.descripcion_s = descripcion_s
        self.resultados = resultados
        # Atributos de implementacion
        self.incidente_id = incidente_id
        self.conflicto_id: int | None = None
        self.registrado_por = registrado_por_id
        self.registrado_por_nombre = registrado_por_nombre
        self.created_at = datetime.now().isoformat()

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "estado_s": self.estado_s,
            "descripcion_s": self.descripcion_s,
            "resultados": self.resultados,
            "incidente_id": self.incidente_id,
            "conflicto_id": self.conflicto_id,
            "registrado_por": self.registrado_por,
            "registrado_por_nombre": self.registrado_por_nombre,
            "created_at": self.created_at,
        }
