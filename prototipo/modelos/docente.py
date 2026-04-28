"""
Modelo: Docente (extiende Personal)
Atributos del modelo conceptual: (heredado: nombre, rut, contacto, direccion, rol)
"""

from modelos.personal import Personal


class Docente(Personal):
    def __init__(self, nombre: str, rut: str, contacto: str, direccion: str):
        super().__init__(nombre, rut, contacto, direccion, rol="docente")
