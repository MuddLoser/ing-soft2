"""
Contenedor: Base de datos de usuarios (data)
C4: "Información de usuario, historial de accesos, etc."

Simula la base de datos relacional con usuarios, sesiones y alertas.
"""


class BaseDatosUsuarios:
    def __init__(self):
        # Usuarios pre-cargados para la simulación
        self.usuarios = {
            1: {
                "id": 1,
                "nombre": "María González",
                "email": "maria.gonzalez@colegio.cl",
                "rol": "docente",
                "password_hash": "hash_simulado_123",
            },
            2: {
                "id": 2,
                "nombre": "Carlos Muñoz",
                "email": "carlos.munoz@colegio.cl",
                "rol": "inspector",
                "password_hash": "hash_simulado_456",
            },
            3: {
                "id": 3,
                "nombre": "Ana Sepúlveda",
                "email": "ana.sepulveda@colegio.cl",
                "rol": "encargado_convivencia",
                "password_hash": "hash_simulado_789",
            },
        }
        self.sesiones = {}  # token -> user_id
        self.alertas = []
        self._next_token = 100

    def buscar_usuario_por_email(self, email: str) -> dict | None:
        for u in self.usuarios.values():
            if u["email"] == email:
                print(f"    [BD Usuarios] Usuario encontrado: {u['nombre']} ({u['rol']}).")
                return u
        print(f"    [BD Usuarios] No se encontró usuario con email '{email}'.")
        return None

    def obtener_usuario(self, user_id: int) -> dict | None:
        return self.usuarios.get(user_id)

    def crear_sesion(self, user_id: int) -> str:
        token = f"TOKEN-{self._next_token}"
        self.sesiones[token] = user_id
        self._next_token += 1
        print(f"    [BD Usuarios] Sesión creada: {token} para usuario #{user_id}.")
        return token

    def validar_sesion(self, token: str) -> dict | None:
        user_id = self.sesiones.get(token)
        if user_id:
            usuario = self.usuarios[user_id]
            print(f"    [BD Usuarios] Sesión válida: {usuario['nombre']} ({usuario['rol']}).")
            return usuario
        print(f"    [BD Usuarios] Sesión inválida o expirada: {token}.")
        return None

    def eliminar_sesion(self, token: str) -> bool:
        if token in self.sesiones:
            del self.sesiones[token]
            print(f"    [BD Usuarios] Sesión {token} eliminada.")
            return True
        return False

    def guardar_alerta(self, alerta: dict) -> None:
        self.alertas.append(alerta)
        print(f"    [BD Usuarios] Alerta persistida: '{alerta.get('mensaje', '')}'.")

    def obtener_alertas_pendientes(self) -> list[dict]:
        pendientes = [a for a in self.alertas if not a.get("leida", False)]
        print(f"    [BD Usuarios] {len(pendientes)} alerta(s) pendiente(s) recuperada(s).")
        return pendientes
