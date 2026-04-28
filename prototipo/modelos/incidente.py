"""
Modelo: Incidente
Descripcion: Un suceso reportado que amerita atencion y una solucion.

Atributos del modelo conceptual: id_i, titulo_i, descripcion_i, fecha_i, estado_i
Estados validos: reportado -> formalizado -> en_proceso -> resuelto -> archivado
"""

from datetime import datetime

ESTADOS_VALIDOS = ("reportado", "formalizado", "en_proceso", "resuelto", "archivado")

TRANSICIONES = {
    "reportado":   ["formalizado"],
    "formalizado": ["en_proceso"],
    "en_proceso":  ["resuelto"],
    "resuelto":    ["archivado"],
}


class Incidente:
    def __init__(
        self,
        titulo_i: str,
        descripcion_i: str,
        fecha_i: str,
        lugar: str,
        gravedad: str,
        tipo: str,
        reportado_por_id: int,
        reportado_por_nombre: str,
        estudiantes_ruts: list[str],
    ):
        self.id_i: int | None = None  # asignado al persistir
        self.titulo_i = titulo_i
        self.descripcion_i = descripcion_i
        self.fecha_i = fecha_i
        self.estado_i = "reportado"
        # Atributos de implementacion
        self.lugar = lugar
        self.gravedad = gravedad
        self.tipo = tipo
        self.reportado_por = reportado_por_id
        self.reportado_por_nombre = reportado_por_nombre
        self.estudiantes_ruts = estudiantes_ruts
        self.formalizado_por: int | None = None
        self.formalizado_por_nombre: str | None = None
        self.solucion_id: int | None = None
        self.conflicto_id: int | None = None
        self.created_at = datetime.now().isoformat()

    def puede_transicionar_a(self, nuevo_estado: str) -> bool:
        return nuevo_estado in TRANSICIONES.get(self.estado_i, [])

    def to_dict(self) -> dict:
        return {
            "id_i": self.id_i,
            "titulo_i": self.titulo_i,
            "descripcion_i": self.descripcion_i,
            "fecha_i": self.fecha_i,
            "estado_i": self.estado_i,
            "lugar": self.lugar,
            "gravedad": self.gravedad,
            "tipo": self.tipo,
            "reportado_por": self.reportado_por,
            "reportado_por_nombre": self.reportado_por_nombre,
            "estudiantes_ruts": self.estudiantes_ruts,
            "formalizado_por": self.formalizado_por,
            "formalizado_por_nombre": self.formalizado_por_nombre,
            "solucion_id": self.solucion_id,
            "conflicto_id": self.conflicto_id,
            "created_at": self.created_at,
        }
