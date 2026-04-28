"""
main.py — Prototipo del Sistema de registro de incidentes de convivencia escolar.

Ensambla los contenedores, sistemas externos y componentes del backend
siguiendo la estructura del modelo C4 y el modelo conceptual.

Modelo conceptual implementado:
  Persona (nombre, rut, contacto, direccion)
    ├── Personal (rol)
    │     ├── Docente
    │     └── EncargadoConvivencia
    ├── Estudiante (curso) — tiene 1..* Apoderado
    └── Apoderado

  Incidente (id_i, titulo_i, descripcion_i, fecha_i, estado_i)
    └── Historial (agrupa incidentes de un Estudiante, relacion 1..*)
    └── Solucion (estado_s, descripcion_s, resultados) [0..1]
          └── Conflicto (id_c, titulo_c, descripcion_c, fecha_c, estado_c) [0..1]

Mapping con el modelo C4:
  Elemento C4                     → Clase Python
  ──────────────────────────────── ─────────────────────────────────────
  Registro de alumnos (basealu)   → RegistroAlumnos
  Registro de empleados (baseemp) → RegistroEmpleados
  Registro de incidentes (almacen)→ RegistroIncidentes
  Base de datos de usuarios (data)→ BaseDatosUsuarios
  Componente de seguridad         → ComponenteSeguridad
  Servicio de notificaciones      → ServicioNotificaciones
  Gestor de casos                 → GestorCasos
  Gestor de conflictos            → GestorConflictos
  Motor de reportes               → MotorReportes
  API de autenticacion (signAPI)  → APIAutenticacion
  API de incidentes (incidentAPI) → APIIncidentes
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from externos.registro_alumnos import RegistroAlumnos
from externos.registro_empleados import RegistroEmpleados
from contenedores.almacen import RegistroIncidentes
from contenedores.data import BaseDatosUsuarios
from componentes.seguridad import ComponenteSeguridad
from componentes.notificaciones import ServicioNotificaciones
from componentes.gestor_casos import GestorCasos
from componentes.gestor_conflictos import GestorConflictos
from componentes.motor_reportes import MotorReportes
from componentes.api_autenticacion import APIAutenticacion
from componentes.api_incidentes import APIIncidentes


def separador(titulo: str):
    print(f"\n{'='*70}")
    print(f"  {titulo}")
    print(f"{'='*70}\n")


def main():
    print("╔══════════════════════════════════════════════════════════════════════╗")
    print("║   PROTOTIPO - Sistema de registro de incidentes de convivencia     ║")
    print("║   Simulacion basada en modelo C4 + modelo conceptual               ║")
    print("╚══════════════════════════════════════════════════════════════════════╝")

    # ================================================================
    # FASE 0: Ensamblaje de componentes
    # ================================================================
    separador("FASE 0: Ensamblaje de componentes segun modelo C4")

    registro_alumnos = RegistroAlumnos()
    registro_empleados = RegistroEmpleados()
    print("[Setup] Sistemas externos conectados: Registro de alumnos, Registro de empleados.")

    almacen = RegistroIncidentes()
    data = BaseDatosUsuarios()
    print("[Setup] Contenedores inicializados: Almacen de incidentes, Base de datos de usuarios.")

    seguridad = ComponenteSeguridad(data, registro_empleados)
    notificaciones = ServicioNotificaciones(data)
    gestor_casos = GestorCasos(almacen, data, registro_alumnos, registro_empleados)
    gestor_conflictos = GestorConflictos(almacen, data, notificaciones)
    motor_reportes = MotorReportes(almacen, data)
    print("[Setup] Componentes del backend instanciados.")

    api_auth = APIAutenticacion(seguridad)
    api_incidentes = APIIncidentes(seguridad, gestor_casos, gestor_conflictos, motor_reportes)
    print("[Setup] APIs expuestas: signAPI, incidentAPI.")

    # ================================================================
    # Mostrar datos del modelo conceptual cargados en el sistema
    # ================================================================
    separador("Modelo conceptual: Verificacion de Estudiantes y sus Apoderados")
    for rut in ["21.345.678-9", "21.876.543-2", "22.111.222-3"]:
        alumno = registro_alumnos.consultar_alumno(rut)
        if alumno:
            apoderados = alumno.get("apoderados", [])
            print(f"  Estudiante: {alumno['nombre']} | Curso: {alumno['curso']}")
            print(f"    contacto: {alumno['contacto']} | direccion: {alumno['direccion']}")
            for ap in apoderados:
                print(f"    Apoderado: {ap['nombre']} | contacto: {ap['contacto']}")

    separador("Modelo conceptual: Verificacion de Personal (Docentes y Encargado)")
    for email in ["maria.gonzalez@colegio.cl", "carlos.munoz@colegio.cl", "ana.sepulveda@colegio.cl"]:
        emp = registro_empleados.consultar_empleado(email)
        if emp:
            print(f"  {emp['rol'].upper()}: {emp['nombre']}")
            print(f"    rut: {emp['rut']} | contacto: {emp['contacto']} | direccion: {emp['direccion']}")

    # ================================================================
    # SIMULACION DE CASOS DE USO
    # ================================================================

    # ------ CU1: Iniciar sesion ------
    separador("CU1: Iniciar sesion — Docente Maria Gonzalez")
    resultado_login_docente = api_auth.login("maria.gonzalez@colegio.cl", "123")
    token_docente = resultado_login_docente.get("token")

    separador("CU1: Iniciar sesion — Encargada Ana Sepulveda")
    resultado_login_encargada = api_auth.login("ana.sepulveda@colegio.cl", "789")
    token_encargada = resultado_login_encargada.get("token")

    # ------ CU4: Reportar incidente ------
    separador("CU4: Reportar incidente — Docente reporta altercado en cafeteria")
    api_incidentes.reportar_incidente(token_docente, {
        "titulo_i": "Altercado en cafeteria",
        "fecha_i": "2026-04-25",
        "lugar": "Cafeteria Principal",
        "descripcion_i": "Altercado verbal y empujones entre dos estudiantes de 3ro durante el recreo.",
        "gravedad": "media",
        "tipo": "agresion_fisica",
        "estudiantes_ruts": ["21.345.678-9", "21.876.543-2"],
    })

    separador("CU4: Reportar segundo incidente — Reincidencia al dia siguiente")
    api_incidentes.reportar_incidente(token_docente, {
        "titulo_i": "Reincidencia en patio central",
        "fecha_i": "2026-04-26",
        "lugar": "Patio Central",
        "descripcion_i": "Reincidencia: los mismos estudiantes se enfrentaron verbalmente durante la formacion.",
        "gravedad": "alta",
        "tipo": "agresion_verbal",
        "estudiantes_ruts": ["21.345.678-9", "21.876.543-2"],
    })

    # ------ CU2: Consultar incidentes ------
    separador("CU2: Consultar incidentes — Encargada consulta todos los incidentes")
    api_incidentes.consultar_incidentes(token_encargada)

    # ------ CU3: Consultar historial (usa entidad Historial del modelo conceptual) ------
    separador("CU3: Consultar Historial — Encargada revisa historial de Mateo Lopez")
    resultado_historial = api_incidentes.historial_estudiante(token_encargada, "21.345.678-9")
    historial = resultado_historial.get("historial", {})
    print(f"  Historial del estudiante: {historial.get('rut_estudiante')}")
    print(f"  Incidentes registrados: {historial.get('incidentes_ids')}")

    # ------ CU5: Formalizar incidente ------
    separador("CU5: Formalizar incidente — Encargada formaliza el primer incidente")
    api_incidentes.formalizar_incidente(token_encargada, 1)

    # ------ CU6: Modificar incidente ------
    separador("CU6: Modificar incidente — Encargada corrige gravedad del incidente #1")
    api_incidentes.modificar_incidente(token_encargada, 1, {"gravedad": "alta"})

    # ------ CU7: Actualizar estado ------
    separador("CU7: Actualizar estado — Incidente #1 pasa a 'en_proceso'")
    api_incidentes.cambiar_estado(token_encargada, 1, "en_proceso")

    # ------ Solucion: Registrar solucion para incidente #1 ------
    # (modelo conceptual: Incidente 0..1 → Solucion)
    separador("Solucion: Encargada registra solucion para incidente #1")
    api_incidentes.registrar_solucion(token_encargada, 1, {
        "descripcion_s": "Mediacion entre Mateo Lopez y Santiago Ruiz con apoyo del orientador.",
        "resultados": "Acuerdo de convivencia firmado por ambas partes y sus apoderados.",
    })

    # ------ CU8: Agrupar en conflicto con solucion vinculada ------
    # (modelo conceptual: Solucion 0..1 → Conflicto)
    separador("CU8: Agrupar en conflicto — Encargada crea conflicto formal (RF5 + RF6)")
    api_incidentes.agrupar_conflicto(token_encargada, {
        "incidentes_ids": [1, 2],
        "titulo_c": "Conflicto reiterado Mateo-Santiago",
        "descripcion_c": "Patron de agresion escalada entre Mateo Lopez y Santiago Ruiz.",
        "solucion_id": 1,
    })

    # ------ Verificar alertas ------
    separador("Verificacion: Alertas pendientes en el panel principal")
    alertas = notificaciones.obtener_alertas()
    for alerta in alertas:
        print(f"  → {alerta['mensaje']}")

    # ------ CU1: Cerrar sesion ------
    separador("CU1: Cerrar sesion — Docente y Encargada cierran sesion")
    api_auth.logout(token_docente)
    api_auth.logout(token_encargada)

    # ------ Control de acceso ------
    separador("Verificacion: Control de acceso — Docente intenta formalizar (debe fallar)")
    resultado_login_docente2 = api_auth.login("maria.gonzalez@colegio.cl", "123")
    token_docente2 = resultado_login_docente2.get("token")
    resultado = api_incidentes.formalizar_incidente(token_docente2, 2)
    print(f"  Resultado: {resultado}")

    # ================================================================
    print(f"\n{'='*70}")
    print("  Simulacion completada. Todos los casos de uso fueron ejecutados.")
    print(f"{'='*70}\n")


if __name__ == "__main__":
    main()
