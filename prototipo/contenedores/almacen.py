"""
Contenedor: Registro de incidentes (almacen)
C4: "Almacenamiento de datos, conflictos, e incidentes."

Persiste instancias de las clases del modelo conceptual:
  Incidente, Solucion, Conflicto, Historial
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from modelos.incidente import Incidente
from modelos.solucion import Solucion
from modelos.conflicto import Conflicto
from modelos.historial import Historial


class RegistroIncidentes:
    def __init__(self):
        self.incidentes: dict[int, Incidente] = {}
        self.soluciones: dict[int, Solucion] = {}
        self.conflictos: dict[int, Conflicto] = {}
        self.historiales: dict[str, Historial] = {}  # rut -> Historial
        self.evidencias: dict[str, dict] = {}
        self._next_incidente_id = 1
        self._next_solucion_id = 1
        self._next_conflicto_id = 1

    # ------------------------------------------------------------------
    # Incidentes
    # ------------------------------------------------------------------

    def guardar_incidente(self, incidente: Incidente) -> int:
        id_asignado = self._next_incidente_id
        incidente.id_i = id_asignado
        self.incidentes[id_asignado] = incidente
        self._next_incidente_id += 1
        print(f"    [Almacen] Incidente #{id_asignado} '{incidente.titulo_i}' guardado.")
        return id_asignado

    def obtener_incidente(self, incidente_id: int) -> Incidente | None:
        resultado = self.incidentes.get(incidente_id)
        if resultado:
            print(f"    [Almacen] Incidente #{incidente_id} recuperado.")
        else:
            print(f"    [Almacen] Incidente #{incidente_id} no encontrado.")
        return resultado

    def listar_incidentes(self, filtros: dict | None = None) -> list[dict]:
        resultados = list(self.incidentes.values())
        if filtros:
            if "estudiante_rut" in filtros:
                rut = filtros["estudiante_rut"]
                resultados = [i for i in resultados if rut in i.estudiantes_ruts]
            if "estado_i" in filtros:
                resultados = [i for i in resultados if i.estado_i == filtros["estado_i"]]
        print(f"    [Almacen] Consulta: {len(resultados)} incidente(s) encontrado(s).")
        return [i.to_dict() for i in resultados]

    # ------------------------------------------------------------------
    # Historial (relacion Estudiante 1..* Incidentes)
    # ------------------------------------------------------------------

    def registrar_incidente_en_historial(self, rut_estudiante: str, incidente_id: int) -> None:
        if rut_estudiante not in self.historiales:
            self.historiales[rut_estudiante] = Historial(rut_estudiante)
        self.historiales[rut_estudiante].agregar_incidente(incidente_id)
        print(f"    [Almacen] Incidente #{incidente_id} registrado en historial de {rut_estudiante}.")

    def obtener_historial_estudiante(self, rut_estudiante: str) -> Historial:
        if rut_estudiante not in self.historiales:
            return Historial(rut_estudiante)
        return self.historiales[rut_estudiante]

    # ------------------------------------------------------------------
    # Soluciones
    # ------------------------------------------------------------------

    def guardar_solucion(self, solucion: Solucion) -> int:
        id_asignado = self._next_solucion_id
        solucion.id = id_asignado
        self.soluciones[id_asignado] = solucion
        self._next_solucion_id += 1
        print(f"    [Almacen] Solucion #{id_asignado} guardada para incidente #{solucion.incidente_id}.")
        return id_asignado

    def obtener_solucion(self, solucion_id: int) -> Solucion | None:
        return self.soluciones.get(solucion_id)

    # ------------------------------------------------------------------
    # Conflictos
    # ------------------------------------------------------------------

    def guardar_conflicto(self, conflicto: Conflicto) -> int:
        id_asignado = self._next_conflicto_id
        conflicto.id_c = id_asignado
        self.conflictos[id_asignado] = conflicto
        self._next_conflicto_id += 1
        print(f"    [Almacen] Conflicto #{id_asignado} '{conflicto.titulo_c}' guardado con {len(conflicto.incidentes_ids)} incidentes.")
        return id_asignado

    def obtener_conflicto(self, conflicto_id: int) -> Conflicto | None:
        return self.conflictos.get(conflicto_id)

    # ------------------------------------------------------------------
    # Evidencias
    # ------------------------------------------------------------------

    def guardar_evidencia(self, incidente_id: int, nombre_archivo: str) -> str:
        ref = f"EV-{incidente_id}-{nombre_archivo}"
        self.evidencias[ref] = {"incidente_id": incidente_id, "archivo": nombre_archivo}
        print(f"    [Almacen] Evidencia '{nombre_archivo}' asociada al incidente #{incidente_id}.")
        return ref
