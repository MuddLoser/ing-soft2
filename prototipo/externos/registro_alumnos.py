"""
Sistema externo: Registro de alumnos (basealu)
C4: "Un listado de los alumnos de los cursos del establecimiento."

Usa los modelos Estudiante y Apoderado del modelo conceptual.
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from modelos.estudiante import Estudiante
from modelos.apoderado import Apoderado


class RegistroAlumnos:
    def __init__(self):
        # Crear estudiantes con todos los atributos del modelo conceptual
        mateo = Estudiante(
            nombre="Mateo López",
            rut="21.345.678-9",
            contacto="mateo.lopez@correo.cl",
            direccion="Av. Principal 123, Santiago",
            curso="3ro A",
        )
        mateo.agregar_apoderado(Apoderado(
            nombre="Jorge López",
            rut="15.234.567-8",
            contacto="jorge.lopez@correo.cl",
            direccion="Av. Principal 123, Santiago",
        ))

        santiago = Estudiante(
            nombre="Santiago Ruiz",
            rut="21.876.543-2",
            contacto="santiago.ruiz@correo.cl",
            direccion="Calle Las Flores 456, Santiago",
            curso="3ro B",
        )
        santiago.agregar_apoderado(Apoderado(
            nombre="Carmen Ruiz",
            rut="14.321.654-3",
            contacto="carmen.ruiz@correo.cl",
            direccion="Calle Las Flores 456, Santiago",
        ))

        valentina = Estudiante(
            nombre="Valentina Torres",
            rut="22.111.222-3",
            contacto="valentina.torres@correo.cl",
            direccion="Pasaje Los Aromos 789, Santiago",
            curso="2do A",
        )
        valentina.agregar_apoderado(Apoderado(
            nombre="Roberto Torres",
            rut="13.456.789-0",
            contacto="roberto.torres@correo.cl",
            direccion="Pasaje Los Aromos 789, Santiago",
        ))

        self.alumnos: dict[str, Estudiante] = {
            mateo.rut: mateo,
            santiago.rut: santiago,
            valentina.rut: valentina,
        }

    def consultar_alumno(self, rut: str) -> dict | None:
        alumno = self.alumnos.get(rut)
        if alumno:
            print(f"    [Ext. Alumnos] Alumno encontrado: {alumno.nombre} - {alumno.curso}.")
            return alumno.to_dict()
        print(f"    [Ext. Alumnos] Alumno con RUT {rut} no encontrado en el registro.")
        return None

    def buscar_alumnos(self, query: str) -> list[dict]:
        resultados = [
            a.to_dict() for a in self.alumnos.values()
            if query.lower() in a.nombre.lower()
        ]
        print(f"    [Ext. Alumnos] Búsqueda '{query}': {len(resultados)} resultado(s).")
        return resultados
