"""
Componente: Componente de seguridad (secucomp)
C4: "Aplica control de acceso por roles y encriptación de credenciales."

Dependencias según C4:
  - secucomp -> data: "Consulta credenciales y roles en"
  
Invocado por:
  - signAPI: "Delega validación de credenciales a"
  - incidentAPI: "Valida tokens de sesión con"
"""


class ComponenteSeguridad:
    def __init__(self, data, registro_empleados):
        self.data = data
        self.registro_empleados = registro_empleados

    def autenticar(self, email: str, password: str) -> dict:
        """Valida credenciales y crea sesión. Usado por signAPI en CU1."""
        print("  [Seguridad] Iniciando autenticación...")

        # 1. Buscar usuario en la base de datos
        usuario = self.data.buscar_usuario_por_email(email)
        if not usuario:
            print("  [Seguridad] FALLO: usuario no encontrado.")
            return {"ok": False, "error": "Credenciales inválidas"}

        # 2. Verificar vigencia en sistema externo de empleados
        vigente = self.registro_empleados.verificar_vigencia(email)
        if not vigente:
            print("  [Seguridad] FALLO: empleado no vigente.")
            return {"ok": False, "error": "Empleado no vigente en el establecimiento"}

        # 3. Validar password (simulado)
        if usuario["password_hash"] != f"hash_simulado_{password}":
            print("  [Seguridad] FALLO: contraseña incorrecta.")
            return {"ok": False, "error": "Credenciales inválidas"}

        # 4. Crear sesión
        token = self.data.crear_sesion(usuario["id"])
        print(f"  [Seguridad] Autenticación exitosa para {usuario['nombre']}.")
        return {"ok": True, "token": token, "rol": usuario["rol"], "usuario": usuario}

    def validar_sesion(self, token: str) -> dict | None:
        """Valida un token activo. Usado por incidentAPI antes de cada operación."""
        print("  [Seguridad] Validando token de sesión...")
        usuario = self.data.validar_sesion(token)
        if not usuario:
            print("  [Seguridad] FALLO: sesión inválida o expirada.")
        return usuario

    def verificar_rol(self, token: str, roles_permitidos: list[str]) -> dict | None:
        """Valida sesión + verifica que el rol esté en la lista permitida."""
        usuario = self.validar_sesion(token)
        if not usuario:
            return None
        if usuario["rol"] not in roles_permitidos:
            print(f"  [Seguridad] FALLO: rol '{usuario['rol']}' no tiene permiso. Se requiere: {roles_permitidos}.")
            return None
        print(f"  [Seguridad] Rol '{usuario['rol']}' autorizado.")
        return usuario

    def cerrar_sesion(self, token: str) -> bool:
        """Revoca el token. Usado por signAPI en logout."""
        print("  [Seguridad] Cerrando sesión...")
        return self.data.eliminar_sesion(token)
