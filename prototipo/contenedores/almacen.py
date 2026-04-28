"""
Contenedor: Registro de incidentes (almacen)
C4: "Almacenamiento de datos, conflictos, e incidentes."

Entidades del modelo conceptual:
  - Incidente: id_i, titulo_i, descripcion_i, fecha_i, estado_i
  - Conflicto:  id_c, titulo_c, descripcion_c, fecha_c, estado_c
  - Solucion:   estado_s, descripcion_s, resultados
  - Historial:  agrupa Incidentes de un Estudiante (relacion 1..*)
"""


class RegistroIncidentes:
    def __init__(self):
        self.incidentes: dict[int, dict] = {}
        self.conflictos: dict[int, dict] = {}
        self.soluciones: dict[int, dict] = {}
        self.historiales: dict[str, dict] = {}  # rut_estudiante -> historial
        self.evidencias: dict[str, dict] = {}
        self._next_id = 1
        self._next_conflicto_id = 1
        self._next_solucion_id = 1

    # ------------------------------------------------------------------
    # Incidentes (atributos del modelo conceptual: id_i, titulo_i,
    #             descripcion_i, fecha_i, estado_i)
    # ------------------------------------------------------------------

    def guardar_incidente(self, incidente: dict) -> int:
        id_asignado = self._next_id
        incidente["id_i"] = id_asignado
        self.incidentes[id_asignado] = incidente
        self._next_id += 1
        print(f"    [Almacén] Incidente #{id_asignado} '{incidente.get('titulo_i', '')}' guardado.")
        return id_asignado

    def obtener_incidente(self, incidente_id: int) -> dict | None:
        resultado = self.incidentes.get(incidente_id)
        if resultado:
            print(f"    [Almacén] Incidente #{incidente_id} recuperado del almacenamiento.")
        else:
            print(f"    [Almacén] Incidente #{incidente_id} no encontrado.")
        return resultado

    def actualizar_incidente(self, incidente_id: int, campos: dict) -> dict | None:
        if incidente_id in self.incidentes:
            self.incidentes[incidente_id].update(campos)
            print(f"    [Almacén] Incidente #{incidente_id} actualizado.")
            return self.incidentes[incidente_id]
        return None

    def listar_incidentes(self, filtros: dict | None = None) -> list[dict]:
        resultados = list(self.incidentes.values())
        if filtros:
            if "estudiante_rut" in filtros:
                rut = filtros["estudiante_rut"]
                resultados = [i for i in resultados if rut in i.get("estudiantes_ruts", [])]
            if "estado_i" in filtros:
                resultados = [i for i in resultados if i.get("estado_i") == filtros["estado_i"]]
        print(f"    [Almacén] Consulta ejecutada: {len(resultados)} incidente(s) encontrado(s).")
        return resultados

    # ------------------------------------------------------------------
    # Historial (relacion: un Estudiante tiene 1..* Incidentes agrupados)
    # ------------------------------------------------------------------

    def obtener_o_crear_historial(self, rut_estudiante: str) -> dict:
        if rut_estudiante not in self.historiales:
            self.historiales[rut_estudiante] = {
                "rut_estudiante": rut_estudiante,
                "incidentes_ids": [],
            }
        return self.historiales[rut_estudiante]

    def registrar_incidente_en_historial(self, rut_estudiante: str, incidente_id: int) -> None:
        historial = self.obtener_o_crear_historial(rut_estudiante)
        if incidente_id not in historial["incidentes_ids"]:
            historial["incidentes_ids"].append(incidente_id)
        print(f"    [Almacén] Incidente #{incidente_id} registrado en historial de {rut_estudiante}.")

    def obtener_historial_estudiante(self, rut_estudiante: str) -> dict:
        return self.historiales.get(rut_estudiante, {
            "rut_estudiante": rut_estudiante,
            "incidentes_ids": [],
        })

    # ------------------------------------------------------------------
    # Soluciones (atributos del modelo conceptual: estado_s,
    #             descripcion_s, resultados)
    # ------------------------------------------------------------------

    def guardar_solucion(self, solucion: dict) -> int:
        id_asignado = self._next_solucion_id
        solucion["id"] = id_asignado
        self.soluciones[id_asignado] = solucion
        self._next_solucion_id += 1
        print(f"    [Almacén] Solución #{id_asignado} guardada para incidente #{solucion.get('incidente_id')}.")
        return id_asignado

    def obtener_solucion(self, solucion_id: int) -> dict | None:
        return self.soluciones.get(solucion_id)

    def actualizar_solucion(self, solucion_id: int, campos: dict) -> dict | None:
        if solucion_id in self.soluciones:
            self.soluciones[solucion_id].update(campos)
            print(f"    [Almacén] Solución #{solucion_id} actualizada.")
            return self.soluciones[solucion_id]
        return None

    # ------------------------------------------------------------------
    # Conflictos (atributos del modelo conceptual: id_c, titulo_c,
    #             descripcion_c, fecha_c, estado_c)
    # ------------------------------------------------------------------

    def guardar_conflicto(self, conflicto: dict) -> int:
        id_asignado = self._next_conflicto_id
        conflicto["id_c"] = id_asignado
        self.conflictos[id_asignado] = conflicto
        self._next_conflicto_id += 1
        print(f"    [Almacén] Conflicto #{id_asignado} '{conflicto.get('titulo_c', '')}' guardado.")
        return id_asignado

    def obtener_conflicto(self, conflicto_id: int) -> dict | None:
        return self.conflictos.get(conflicto_id)

    # ------------------------------------------------------------------
    # Evidencias
    # ------------------------------------------------------------------

    def guardar_evidencia(self, incidente_id: int, nombre_archivo: str) -> str:
        ref = f"EV-{incidente_id}-{nombre_archivo}"
        self.evidencias[ref] = {"incidente_id": incidente_id, "archivo": nombre_archivo}
        print(f"    [Almacén] Evidencia '{nombre_archivo}' asociada al incidente #{incidente_id}.")
        return ref
