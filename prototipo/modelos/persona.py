"""
Modelo: Persona (clase base abstracta)
Atributos del modelo conceptual: nombre, rut, contacto, direccion
"""


class Persona:
    def __init__(self, nombre: str, rut: str, contacto: str, direccion: str):
        self.nombre = nombre
        self.rut = rut
        self.contacto = contacto
        self.direccion = direccion

    def to_dict(self) -> dict:
        return {
            "nombre": self.nombre,
            "rut": self.rut,
            "contacto": self.contacto,
            "direccion": self.direccion,
        }
