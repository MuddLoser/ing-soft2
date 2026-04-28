"""
Componente: Gestor de Conflictos (conflictManager)
C4: "Agrupa incidentes y analiza sus relaciones."

Usa los atributos del modelo conceptual para Conflicto:
  id_c, titulo_c, descripcion_c, fecha_c, estado_c

El Conflicto se crea a partir de una Solucion existente (relacion del modelo conceptual:
Solucion 0..1 → Conflicto 1..1), y tambien puede agrupar multiples incidentes (CU8).
Cubre el caso de uso: CU8 (agrupar en conflicto).
"""

from datetime import datetime


class GestorConflictos:
    def __init__(self, almacen, data, notificaciones):
        self.almacen = almacen
        self.data = data
        self.notificaciones = notificaciones

    def agrupar_en_conflicto(self, incidentes_ids: list[int], titulo_c: str,
                             descripcion_c: str, solucion_id: int | None = None) -> dict:
        """CU8: Agrupa 2+ incidentes en un Conflicto y dispara alerta (RF6).

        Si se provee solucion_id, el conflicto queda vinculado a esa Solucion
        (relacion Solucion 0..1 → Conflicto del modelo conceptual).
        """
        print(f"  [Gestor Conflictos] Agrupando incidentes {incidentes_ids} en conflicto '{titulo_c}'...")

        if len(incidentes_ids) < 2:
            print("  [Gestor Conflictos] ERROR: se requieren al menos 2 incidentes.")
            return {"ok": False, "error": "Se requieren al menos 2 incidentes para crear un conflicto"}

        for iid in incidentes_ids:
            inc = self.almacen.obtener_incidente(iid)
            if not inc:
                print(f"  [Gestor Conflictos] ERROR: incidente #{iid} no encontrado.")
                return {"ok": False, "error": f"Incidente #{iid} no existe"}

        # Validar solucion si se provee
        if solucion_id is not None:
            sol = self.almacen.obtener_solucion(solucion_id)
            if not sol:
                return {"ok": False, "error": f"Solución #{solucion_id} no existe"}
            if sol.get("conflicto_id"):
                return {"ok": False, "error": f"La solución #{solucion_id} ya está vinculada a un conflicto"}

        conflicto = {
            # Atributos del modelo conceptual
            "titulo_c": titulo_c,
            "descripcion_c": descripcion_c,
            "fecha_c": datetime.now().isoformat(),
            "estado_c": "abierto",
            # Atributos de implementacion
            "incidentes_ids": incidentes_ids,
            "solucion_id": solucion_id,
        }

        conflicto_id = self.almacen.guardar_conflicto(conflicto)

        # Vincular incidentes al conflicto
        for iid in incidentes_ids:
            self.almacen.actualizar_incidente(iid, {"conflicto_id": conflicto_id})

        # Vincular solucion al conflicto si existe
        if solucion_id is not None:
            self.almacen.actualizar_solucion(solucion_id, {
                "conflicto_id": conflicto_id,
                "estado_s": "implementada",
            })

        self.notificaciones.notificar_conflicto_creado(
            conflicto_id=conflicto_id,
            descripcion=descripcion_c,
            cantidad_incidentes=len(incidentes_ids),
        )

        print(f"  [Gestor Conflictos] Conflicto #{conflicto_id} creado exitosamente.")
        return {"ok": True, "conflicto": conflicto}
