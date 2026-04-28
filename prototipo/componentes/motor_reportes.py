"""
Componente: Motor de Reportes (reportEngine)
C4: "Procesa busquedas, filtra historicos y genera estadisticas de solo lectura."

Usa los atributos del modelo conceptual para Incidente (estado_i, titulo_i, etc.)
y el Historial del Estudiante (relacion 1..*).
Cubre los casos de uso: CU2 (consultar incidentes), CU3 (consultar historial).
"""


class MotorReportes:
    def __init__(self, almacen, data):
        self.almacen = almacen
        self.data = data

    def consultar_incidentes(self, filtros: dict | None = None) -> dict:
        """CU2: Consultar incidentes con filtros (RF7)."""
        print("  [Motor Reportes] Procesando consulta de incidentes...")
        resultados = self.almacen.listar_incidentes(filtros)
        print(f"  [Motor Reportes] Consulta completada: {len(resultados)} resultado(s).")
        return {"ok": True, "total": len(resultados), "incidentes": resultados}

    def historial_estudiante(self, rut: str) -> dict:
        """CU3: Consultar Historial de un Estudiante (modelo conceptual: Historial 1..* Incidente)."""
        print(f"  [Motor Reportes] Consultando historial del estudiante {rut}...")

        historial = self.almacen.obtener_historial_estudiante(rut)
        incidentes_ids = historial.get("incidentes_ids", [])
        incidentes = [
            self.almacen.obtener_incidente(iid)
            for iid in incidentes_ids
            if self.almacen.obtener_incidente(iid)
        ]

        print(f"  [Motor Reportes] Historial: {len(incidentes)} incidente(s) encontrado(s) para {rut}.")
        return {
            "ok": True,
            "rut": rut,
            "historial": historial,
            "total": len(incidentes),
            "incidentes": incidentes,
        }

    def estadisticas_generales(self) -> dict:
        """Genera estadisticas para el panel de control."""
        print("  [Motor Reportes] Generando estadisticas generales...")

        todos = self.almacen.listar_incidentes()
        por_estado = {}
        por_gravedad = {}
        for inc in todos:
            estado = inc.get("estado_i", "desconocido")
            gravedad = inc.get("gravedad", "desconocida")
            por_estado[estado] = por_estado.get(estado, 0) + 1
            por_gravedad[gravedad] = por_gravedad.get(gravedad, 0) + 1

        print(f"  [Motor Reportes] Estadisticas: {len(todos)} incidentes totales.")
        return {
            "ok": True,
            "total_incidentes": len(todos),
            "por_estado": por_estado,
            "por_gravedad": por_gravedad,
        }
