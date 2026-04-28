"""
Componente: API de incidentes (incidentAPI)
C4: "Recibe peticiones de acceder a incidentes o conflictos y las enruta a la capa logica."

Dependencias segun C4:
  - incidentAPI -> caseManager: "Enruta peticiones de casos a"
  - incidentAPI -> conflictManager: "Enruta peticiones de conflictos a"
  - incidentAPI -> reportEngine: "Enruta consultas de lectura a"
  - incidentAPI -> secucomp: "Valida tokens de sesion con"
"""


class APIIncidentes:
    def __init__(self, seguridad, gestor_casos, gestor_conflictos, motor_reportes):
        self.seguridad = seguridad
        self.gestor_casos = gestor_casos
        self.gestor_conflictos = gestor_conflictos
        self.motor_reportes = motor_reportes

    # ---- CU4: Reportar incidente ----
    def reportar_incidente(self, token: str, payload: dict) -> dict:
        """POST /incidentes — disponible para docentes e inspectores."""
        print("[incidentAPI] Recibida peticion: reportar incidente.")
        usuario = self.seguridad.verificar_rol(token, ["docente", "inspector"])
        if not usuario:
            return {"ok": False, "error": "No autorizado"}

        return self.gestor_casos.reportar_incidente(
            usuario=usuario,
            titulo=payload["titulo_i"],
            fecha_i=payload["fecha_i"],
            lugar=payload["lugar"],
            descripcion_i=payload["descripcion_i"],
            gravedad=payload["gravedad"],
            tipo=payload["tipo"],
            estudiantes_ruts=payload["estudiantes_ruts"],
        )

    # ---- CU5: Formalizar incidente ----
    def formalizar_incidente(self, token: str, incidente_id: int) -> dict:
        """POST /incidentes/{id}/formalizar — solo encargado de convivencia."""
        print(f"[incidentAPI] Recibida peticion: formalizar incidente #{incidente_id}.")
        usuario = self.seguridad.verificar_rol(token, ["encargado_convivencia"])
        if not usuario:
            return {"ok": False, "error": "No autorizado"}

        return self.gestor_casos.formalizar_incidente(usuario, incidente_id)

    # ---- CU6: Modificar incidente ----
    def modificar_incidente(self, token: str, incidente_id: int, campos: dict) -> dict:
        """PATCH /incidentes/{id} — solo encargado de convivencia."""
        print(f"[incidentAPI] Recibida peticion: modificar incidente #{incidente_id}.")
        usuario = self.seguridad.verificar_rol(token, ["encargado_convivencia"])
        if not usuario:
            return {"ok": False, "error": "No autorizado"}

        return self.gestor_casos.modificar_incidente(incidente_id, campos)

    # ---- CU7: Actualizar estado ----
    def cambiar_estado(self, token: str, incidente_id: int, nuevo_estado: str) -> dict:
        """POST /incidentes/{id}/estado — solo encargado de convivencia."""
        print(f"[incidentAPI] Recibida peticion: cambiar estado de incidente #{incidente_id}.")
        usuario = self.seguridad.verificar_rol(token, ["encargado_convivencia"])
        if not usuario:
            return {"ok": False, "error": "No autorizado"}

        return self.gestor_casos.cambiar_estado(incidente_id, nuevo_estado)

    # ---- CU2: Consultar incidentes ----
    def consultar_incidentes(self, token: str, filtros: dict | None = None) -> dict:
        """GET /incidentes — disponible para todos los roles."""
        print("[incidentAPI] Recibida peticion: consultar incidentes.")
        usuario = self.seguridad.validar_sesion(token)
        if not usuario:
            return {"ok": False, "error": "Sesion invalida"}

        return self.motor_reportes.consultar_incidentes(filtros)

    # ---- CU3: Consultar historial de estudiante ----
    def historial_estudiante(self, token: str, rut: str) -> dict:
        """GET /estudiantes/{rut}/historial — disponible para todos los roles."""
        print(f"[incidentAPI] Recibida peticion: historial del estudiante {rut}.")
        usuario = self.seguridad.validar_sesion(token)
        if not usuario:
            return {"ok": False, "error": "Sesion invalida"}

        return self.motor_reportes.historial_estudiante(rut)

    # ---- Solucion: Registrar solucion para un incidente ----
    def registrar_solucion(self, token: str, incidente_id: int, payload: dict) -> dict:
        """POST /incidentes/{id}/solucion — solo encargado de convivencia.

        Crea una Solucion vinculada al Incidente (modelo conceptual: Incidente 0..1 -> Solucion).
        Payload: { descripcion_s, resultados }
        """
        print(f"[incidentAPI] Recibida peticion: registrar solucion para incidente #{incidente_id}.")
        usuario = self.seguridad.verificar_rol(token, ["encargado_convivencia"])
        if not usuario:
            return {"ok": False, "error": "No autorizado"}

        return self.gestor_casos.registrar_solucion(
            usuario=usuario,
            incidente_id=incidente_id,
            descripcion_s=payload["descripcion_s"],
            resultados=payload["resultados"],
        )

    # ---- CU8: Agrupar en conflicto ----
    def agrupar_conflicto(self, token: str, payload: dict) -> dict:
        """POST /conflictos — solo encargado de convivencia.

        Payload: { incidentes_ids, titulo_c, descripcion_c, solucion_id (opcional) }
        """
        print("[incidentAPI] Recibida peticion: agrupar incidentes en conflicto.")
        usuario = self.seguridad.verificar_rol(token, ["encargado_convivencia"])
        if not usuario:
            return {"ok": False, "error": "No autorizado"}

        return self.gestor_conflictos.agrupar_en_conflicto(
            incidentes_ids=payload["incidentes_ids"],
            titulo_c=payload["titulo_c"],
            descripcion_c=payload["descripcion_c"],
            solucion_id=payload.get("solucion_id"),
        )
