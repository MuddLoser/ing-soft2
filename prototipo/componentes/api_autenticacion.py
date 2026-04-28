"""
Componente: API de autenticación (signAPI)
C4: "Gestiona el acceso emitiendo tokens de sesión para el frontend."

Dependencias según C4:
  - signAPI -> secucomp: "Delega validación de credenciales a"

Invocado por:
  - frontend: "Solicita autenticación vía"
"""


class APIAutenticacion:
    def __init__(self, seguridad):
        self.seguridad = seguridad

    def login(self, email: str, password: str) -> dict:
        """POST /auth/login — CU1: Iniciar sesión."""
        print("[signAPI] Recibida petición de login...")
        resultado = self.seguridad.autenticar(email, password)
        if resultado["ok"]:
            print(f"[signAPI] Login exitoso. Token emitido: {resultado['token']}.")
        else:
            print(f"[signAPI] Login fallido: {resultado['error']}.")
        return resultado

    def logout(self, token: str) -> dict:
        """POST /auth/logout — Cerrar sesión."""
        print("[signAPI] Recibida petición de logout...")
        exito = self.seguridad.cerrar_sesion(token)
        if exito:
            print("[signAPI] Sesión cerrada correctamente.")
        return {"ok": exito}
