"""
Modelo: Estudiante (extiende Persona)
Atributos del modelo conceptual: curso (heredado: nombre, rut, contacto, direccion)
Relacion: tiene 1..* Apoderado
"""

from modelos.persona import Persona
from modelos.apoderado import Apoderado


class Estudiante(Persona):
    def __init__(self, nombre: str, rut: str, contacto: str, direccion: str, curso: str):
        super().__init__(nombre, rut, contacto, direccion)
        self.curso = curso
        self.apoderados: list[Apoderado] = []

    def agregar_apoderado(self, apoderado: Apoderado) -> None:
        self.apoderados.append(apoderado)

    def to_dict(self) -> dict:
        d = super().to_dict()
        d["curso"] = self.curso
        d["apoderados"] = [a.to_dict() for a in self.apoderados]
        return d
