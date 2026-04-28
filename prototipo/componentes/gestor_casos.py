"""
Componente: Gestor de Casos (caseManager)
C4: "Permite crear y editar incidentes individuales."

Instancia las clases del modelo conceptual: Incidente, Solucion.
Gestiona el Historial de cada Estudiante involucrado.
Cubre los casos de uso: CU4 (reportar), CU5 (formalizar), CU6 (modificar), CU7 (actualizar estado).
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from modelos.incidente import Incidente, TRANSICIONES
from modelos.solucion import Solucion


class GestorCasos:
    def __init__(self, almacen, data, registro_alumnos, registro_empleados):
        self.almacen = almacen
        self.data = data
        self.registro_alumnos = registro_alumnos
        self.registro_empleados = registro_empleados

    def reportar_incidente(self, usuario: dict, titulo: str, fecha_i: str,
                           lugar: str, descripcion_i: str, gravedad: str,
                           tipo: str, estudiantes_ruts: list[str]) -> dict:
        """CU4: Reportar incidente — disponible para docentes e inspectores."""
        print("  [Gestor Casos] Procesando reporte de nuevo incidente...")

        estudiantes_validos = []
        for rut in estudiantes_ruts:
            alumno = self.registro_alumnos.consultar_alumno(rut)
            if alumno:
                estudiantes_validos.append(rut)
            else:
                print(f"  [Gestor Casos] ADVERTENCIA: alumno {rut} no existe, se omite.")

        if not estudiantes_validos:
            print("  [Gestor Casos] ERROR: no hay estudiantes validos asociados.")
            return {"ok": False, "error": "Debe asociar al menos un estudiante valido"}

        incidente = Incidente(
            titulo_i=titulo,
            descripcion_i=descripcion_i,
            fecha_i=fecha_i,
            lugar=lugar,
            gravedad=gravedad,
            tipo=tipo,
            reportado_por_id=usuario["id"],
            reportado_por_nombre=usuario["nombre"],
            estudiantes_ruts=estudiantes_validos,
        )

        incidente_id = self.almacen.guardar_incidente(incidente)

        for rut in estudiantes_validos:
            self.almacen.registrar_incidente_en_historial(rut, incidente_id)

        print(f"  [Gestor Casos] Incidente #{incidente_id} creado en estado 'reportado'.")
        return {"ok": True, "incidente": incidente.to_dict()}

    def formalizar_incidente(self, usuario: dict, incidente_id: int) -> dict:
        """CU5: Formalizar incidente — solo encargado de convivencia."""
        print(f"  [Gestor Casos] Formalizando incidente #{incidente_id}...")

        incidente = self.almacen.obtener_incidente(incidente_id)
        if not incidente:
            return {"ok": False, "error": "Incidente no encontrado"}

        if incidente.estado_i != "reportado":
            print(f"  [Gestor Casos] ERROR: estado actual '{incidente.estado_i}' no permite formalizacion.")
            return {"ok": False, "error": f"Estado '{incidente.estado_i}' no permite formalizacion"}

        incidente.estado_i = "formalizado"
        incidente.formalizado_por = usuario["id"]
        incidente.formalizado_por_nombre = usuario["nombre"]
        print(f"  [Gestor Casos] Incidente #{incidente_id} formalizado por {usuario['nombre']}.")
        return {"ok": True, "incidente": incidente.to_dict()}

    def modificar_incidente(self, incidente_id: int, campos: dict) -> dict:
        """CU6: Modificar incidente — solo encargado de convivencia."""
        print(f"  [Gestor Casos] Modificando incidente #{incidente_id}...")

        incidente = self.almacen.obtener_incidente(incidente_id)
        if not incidente:
            return {"ok": False, "error": "Incidente no encontrado"}

        campos_permitidos = {"titulo_i", "descripcion_i", "gravedad", "tipo", "lugar"}
        for campo, valor in campos.items():
            if campo in campos_permitidos:
                setattr(incidente, campo, valor)
        print(f"  [Gestor Casos] Campos actualizados: {[k for k in campos if k in campos_permitidos]}.")
        return {"ok": True, "incidente": incidente.to_dict()}

    def cambiar_estado(self, incidente_id: int, nuevo_estado: str) -> dict:
        """CU7: Actualizar estado de un incidente."""
        print(f"  [Gestor Casos] Cambiando estado del incidente #{incidente_id} a '{nuevo_estado}'...")

        incidente = self.almacen.obtener_incidente(incidente_id)
        if not incidente:
            return {"ok": False, "error": "Incidente no encontrado"}

        if not incidente.puede_transicionar_a(nuevo_estado):
            permitidos = TRANSICIONES.get(incidente.estado_i, [])
            print(f"  [Gestor Casos] ERROR: transicion '{incidente.estado_i}' -> '{nuevo_estado}' no permitida.")
            return {"ok": False, "error": f"Desde '{incidente.estado_i}' solo se permite: {permitidos}"}

        estado_anterior = incidente.estado_i
        incidente.estado_i = nuevo_estado
        print(f"  [Gestor Casos] Estado actualizado: '{estado_anterior}' -> '{nuevo_estado}'.")
        return {"ok": True, "incidente": incidente.to_dict()}

    def registrar_solucion(self, usuario: dict, incidente_id: int,
                           descripcion_s: str, resultados: str) -> dict:
        """Registrar una Solucion para un Incidente (modelo conceptual: Incidente 0..1 -> Solucion)."""
        print(f"  [Gestor Casos] Registrando solucion para incidente #{incidente_id}...")

        incidente = self.almacen.obtener_incidente(incidente_id)
        if not incidente:
            return {"ok": False, "error": "Incidente no encontrado"}

        if incidente.solucion_id is not None:
            return {"ok": False, "error": f"El incidente #{incidente_id} ya tiene una solucion registrada"}

        solucion = Solucion(
            descripcion_s=descripcion_s,
            resultados=resultados,
            incidente_id=incidente_id,
            registrado_por_id=usuario["id"],
            registrado_por_nombre=usuario["nombre"],
        )

        solucion_id = self.almacen.guardar_solucion(solucion)
        incidente.solucion_id = solucion_id

        print(f"  [Gestor Casos] Solucion #{solucion_id} registrada. Estado: 'pendiente'.")
        return {"ok": True, "solucion": solucion.to_dict()}
