"""
Componente: Gestor de Conflictos (conflictManager)
C4: "Agrupa incidentes y analiza sus relaciones."

Instancia la clase del modelo conceptual: Conflicto.
El Conflicto agrupa 2+ Incidentes y puede vincularse a una Solucion existente
(relacion del modelo conceptual: Solucion 0..1 -> Conflicto).
Cubre el caso de uso: CU8 (agrupar en conflicto).
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from modelos.conflicto import Conflicto


class GestorConflictos:
    def __init__(self, almacen, data, notificaciones):
        self.almacen = almacen
        self.data = data
        self.notificaciones = notificaciones

    def agrupar_en_conflicto(self, incidentes_ids: list[int], titulo_c: str,
                             descripcion_c: str, solucion_id: int | None = None) -> dict:
        """CU8: Agrupa 2+ incidentes en un Conflicto y dispara alerta (RF6).

        Si se provee solucion_id, el conflicto queda vinculado a esa Solucion
        (relacion Solucion 0..1 -> Conflicto del modelo conceptual).
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

        if solucion_id is not None:
            sol = self.almacen.obtener_solucion(solucion_id)
            if not sol:
                return {"ok": False, "error": f"Solucion #{solucion_id} no existe"}
            if sol.conflicto_id is not None:
                return {"ok": False, "error": f"La solucion #{solucion_id} ya esta vinculada a un conflicto"}

        conflicto = Conflicto(
            titulo_c=titulo_c,
            descripcion_c=descripcion_c,
            incidentes_ids=incidentes_ids,
            solucion_id=solucion_id,
        )

        conflicto_id = self.almacen.guardar_conflicto(conflicto)

        # Vincular cada incidente al conflicto
        for iid in incidentes_ids:
            inc = self.almacen.obtener_incidente(iid)
            if inc:
                inc.conflicto_id = conflicto_id

        # Vincular la solucion al conflicto e implementarla
        if solucion_id is not None:
            sol = self.almacen.obtener_solucion(solucion_id)
            if sol:
                sol.conflicto_id = conflicto_id
                sol.estado_s = "implementada"

        self.notificaciones.notificar_conflicto_creado(
            conflicto_id=conflicto_id,
            descripcion=descripcion_c,
            cantidad_incidentes=len(incidentes_ids),
        )

        print(f"  [Gestor Conflictos] Conflicto #{conflicto_id} creado exitosamente.")
        return {"ok": True, "conflicto": conflicto.to_dict()}
