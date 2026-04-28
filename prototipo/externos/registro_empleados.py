"""
Sistema externo: Registro de empleados (baseemp)
C4: "Un listado de los empleados del establecimiento."

Usa los modelos Docente y EncargadoConvivencia del modelo conceptual.
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from modelos.docente import Docente
from modelos.encargado_convivencia import EncargadoConvivencia


class RegistroEmpleados:
    def __init__(self):
        self.empleados: dict[str, Docente | EncargadoConvivencia] = {
            "maria.gonzalez@colegio.cl": Docente(
                nombre="María González",
                rut="12.345.678-9",
                contacto="maria.gonzalez@colegio.cl",
                direccion="Calle Los Pinos 456, Providencia",
            ),
            "carlos.munoz@colegio.cl": Docente(
                nombre="Carlos Muñoz",
                rut="11.222.333-4",
                contacto="carlos.munoz@colegio.cl",
                direccion="Av. Irarrázaval 890, Ñuñoa",
            ),
            "ana.sepulveda@colegio.cl": EncargadoConvivencia(
                nombre="Ana Sepúlveda",
                rut="10.555.666-7",
                contacto="ana.sepulveda@colegio.cl",
                direccion="Paseo Los Leones 321, Las Condes",
            ),
        }
        # Registrar vigencia por separado para no contamintar el modelo
        self._vigentes = {email: True for email in self.empleados}

    def verificar_vigencia(self, email: str) -> bool:
        if self._vigentes.get(email):
            emp = self.empleados[email]
            print(f"    [Ext. Empleados] Empleado vigente: {emp.nombre} ({emp.rol}).")
            return True
        print(f"    [Ext. Empleados] Empleado no vigente o no encontrado: {email}.")
        return False

    def consultar_empleado(self, email: str) -> dict | None:
        emp = self.empleados.get(email)
        return emp.to_dict() if emp else None
