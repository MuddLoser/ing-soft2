"""
Componente: Servicio de Notificaciones (notificationService)
C4: "Construye y despacha alertas a la página principal."

Dependencias según C4:
  - notificationService -> data (implícita): persiste alertas

Invocado por:
  - conflictManager: "Dispara alertas usando"
"""


class ServicioNotificaciones:
    def __init__(self, data):
        self.data = data

    def notificar_conflicto_creado(self, conflicto_id: int, descripcion: str, cantidad_incidentes: int) -> None:
        """Crea una alerta cuando se agrupa un nuevo conflicto (RF6)."""
        print("  [Notificaciones] Generando alerta de nuevo conflicto...")

        alerta = {
            "tipo": "nuevo_conflicto",
            "conflicto_id": conflicto_id,
            "mensaje": f"¡Alerta! Nuevo conflicto #{conflicto_id} creado con {cantidad_incidentes} incidentes: {descripcion}",
            "leida": False,
        }
        self.data.guardar_alerta(alerta)
        print(f"  [Notificaciones] Alerta despachada para conflicto #{conflicto_id}.")

    def obtener_alertas(self) -> list[dict]:
        """Recupera alertas pendientes para mostrar en la página principal."""
        print("  [Notificaciones] Consultando alertas pendientes...")
        return self.data.obtener_alertas_pendientes()
