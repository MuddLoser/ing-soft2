"""
Modelo: Apoderado (extiende Persona)
Atributos del modelo conceptual: (heredado: nombre, rut, contacto, direccion)
"""

from modelos.persona import Persona


class Apoderado(Persona):
    def __init__(self, nombre: str, rut: str, contacto: str, direccion: str):
        super().__init__(nombre, rut, contacto, direccion)
