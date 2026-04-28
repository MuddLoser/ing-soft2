"""
Modelo: Personal (extiende Persona)
Atributos del modelo conceptual: rol (heredado: nombre, rut, contacto, direccion)
"""

from modelos.persona import Persona


class Personal(Persona):
    def __init__(self, nombre: str, rut: str, contacto: str, direccion: str, rol: str):
        super().__init__(nombre, rut, contacto, direccion)
        self.rol = rol

    def to_dict(self) -> dict:
        d = super().to_dict()
        d["rol"] = self.rol
        return d
