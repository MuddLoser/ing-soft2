"""
main.py — Prototipo del Sistema de registro de incidentes de convivencia escolar.

Ensambla los contenedores, sistemas externos y componentes del backend
siguiendo la estructura del modelo C4 y las clases del modelo conceptual.

Clases relevantes del modelo conceptual (seccion 4.3):
  Persona              — base de todo individuo registrado
  Personal             — personal del establecimiento
  Docente              — personal excepto encargados (profesores, inspectores, auxiliares)
  EncargadoConvivencia — maneja incidentes y conflictos
  Estudiante           — alumno del establecimiento
  Apoderado            — apoderado asociado a un estudiante
  Incidente            — suceso reportado que amerita atencion y solucion
  Conflicto            — situacion derivada de un patron de incidentes
  Solucion             — medidas tomadas ante un incidente o conflicto
  Historial            — registro de incidentes pasados de un estudiante

Mapping C4:
  Registro de alumnos (basealu)    -> RegistroAlumnos   (usa Estudiante, Apoderado)
  Registro de empleados (baseemp)  -> RegistroEmpleados (usa Docente, EncargadoConvivencia)
  Registro de incidentes (almacen) -> RegistroIncidentes (persiste Incidente, Solucion, Conflicto, Historial)
  Base de datos de usuarios (data) -> BaseDatosUsuarios
  Componente de seguridad          -> ComponenteSeguridad
  Servicio de notificaciones       -> ServicioNotificaciones
  Gestor de casos                  -> GestorCasos        (instancia Incidente, Solucion)
  Gestor de conflictos             -> GestorConflictos   (instancia Conflicto)
  Motor de reportes                -> MotorReportes      (lee Historial)
  API de autenticacion (signAPI)   -> APIAutenticacion
  API de incidentes (incidentAPI)  -> APIIncidentes
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
    print("║   Modelo C4 + Clases relevantes del modelo conceptual (sec. 4.3)  ║")
    print("╚══════════════════════════════════════════════════════════════════════╝")

    # ================================================================
    # FASE 0: Ensamblaje de componentes
    # ================================================================
    separador("FASE 0: Ensamblaje de componentes segun modelo C4")

    registro_alumnos = RegistroAlumnos()   # usa Estudiante + Apoderado
    registro_empleados = RegistroEmpleados()  # usa Docente + EncargadoConvivencia
    print("[Setup] Sistemas externos: RegistroAlumnos, RegistroEmpleados.")

    almacen = RegistroIncidentes()   # persiste Incidente, Solucion, Conflicto, Historial
    data = BaseDatosUsuarios()
    print("[Setup] Contenedores: RegistroIncidentes, BaseDatosUsuarios.")

    seguridad = ComponenteSeguridad(data, registro_empleados)
    notificaciones = ServicioNotificaciones(data)
    gestor_casos = GestorCasos(almacen, data, registro_alumnos, registro_empleados)
    gestor_conflictos = GestorConflictos(almacen, data, notificaciones)
    motor_reportes = MotorReportes(almacen, data)
    api_auth = APIAutenticacion(seguridad)
    api_incidentes = APIIncidentes(seguridad, gestor_casos, gestor_conflictos, motor_reportes)
    print("[Setup] Componentes y APIs ensamblados correctamente.\n")

    # ================================================================
    # Verificacion: instancias del modelo conceptual en los registros
    # ================================================================
    separador("Modelo conceptual: Estudiantes y sus Apoderados (clase Persona)")
    for rut in ["21.345.678-9", "21.876.543-2", "22.111.222-3"]:
        alumno = registro_alumnos.consultar_alumno(rut)
        if alumno:
            print(f"  [Estudiante] {alumno['nombre']} | curso: {alumno['curso']}")
            print(f"               rut: {alumno['rut']} | contacto: {alumno['contacto']}")
            print(f"               direccion: {alumno['direccion']}")
            for ap in alumno.get("apoderados", []):
                print(f"    [Apoderado] {ap['nombre']} | contacto: {ap['contacto']}")

    separador("Modelo conceptual: Personal del establecimiento (Docente y EncargadoConvivencia)")
    for email in ["maria.gonzalez@colegio.cl", "carlos.munoz@colegio.cl", "ana.sepulveda@colegio.cl"]:
        emp = registro_empleados.consultar_empleado(email)
        if emp:
            clase = "EncargadoConvivencia" if emp["rol"] == "encargado_convivencia" else "Docente"
            print(f"  [{clase}] {emp['nombre']} | rol: {emp['rol']}")
            print(f"             rut: {emp['rut']} | contacto: {emp['contacto']}")
            print(f"             direccion: {emp['direccion']}")

    # ================================================================
    # CU1: Autenticacion
    # ================================================================
    separador("CU1: Iniciar sesion — Docente Maria Gonzalez")
    res_docente = api_auth.login("maria.gonzalez@colegio.cl", "123")
    token_docente = res_docente.get("token")

    separador("CU1: Iniciar sesion — Encargada de Convivencia Ana Sepulveda")
    res_encargada = api_auth.login("ana.sepulveda@colegio.cl", "789")
    token_encargada = res_encargada.get("token")

    # ================================================================
    # CU4: Reportar incidentes (se crean instancias de Incidente)
    # ================================================================
    separador("CU4: Reportar Incidente #1 — altercado en cafeteria")
    api_incidentes.reportar_incidente(token_docente, {
        "titulo_i": "Altercado en cafeteria",
        "fecha_i": "2026-04-25",
        "lugar": "Cafeteria Principal",
        "descripcion_i": "Altercado verbal y empujones entre dos estudiantes de 3ro durante el recreo.",
        "gravedad": "media",
        "tipo": "agresion_fisica",
        "estudiantes_ruts": ["21.345.678-9", "21.876.543-2"],
    })

    separador("CU4: Reportar Incidente #2 — reincidencia al dia siguiente")
    api_incidentes.reportar_incidente(token_docente, {
        "titulo_i": "Reincidencia en patio central",
        "fecha_i": "2026-04-26",
        "lugar": "Patio Central",
        "descripcion_i": "Los mismos estudiantes se enfrentaron verbalmente durante la formacion.",
        "gravedad": "alta",
        "tipo": "agresion_verbal",
        "estudiantes_ruts": ["21.345.678-9", "21.876.543-2"],
    })

    # ================================================================
    # CU2: Consultar incidentes
    # ================================================================
    separador("CU2: Consultar incidentes — lista todos los Incidentes del sistema")
    api_incidentes.consultar_incidentes(token_encargada)

    # ================================================================
    # CU3: Consultar Historial (instancia de Historial del estudiante)
    # ================================================================
    separador("CU3: Consultar Historial — Mateo Lopez (21.345.678-9)")
    resultado = api_incidentes.historial_estudiante(token_encargada, "21.345.678-9")
    historial = resultado.get("historial", {})
    print(f"  [Historial] Estudiante: {historial.get('rut_estudiante')}")
    print(f"  [Historial] Incidentes registrados: {historial.get('incidentes_ids')}")

    # ================================================================
    # CU5: Formalizar incidente
    # ================================================================
    separador("CU5: Formalizar Incidente #1")
    api_incidentes.formalizar_incidente(token_encargada, 1)

    # ================================================================
    # CU6: Modificar incidente
    # ================================================================
    separador("CU6: Modificar Incidente #1 — corregir gravedad a 'alta'")
    api_incidentes.modificar_incidente(token_encargada, 1, {"gravedad": "alta"})

    # ================================================================
    # CU7: Cambiar estado
    # ================================================================
    separador("CU7: Cambiar estado Incidente #1 a 'en_proceso'")
    api_incidentes.cambiar_estado(token_encargada, 1, "en_proceso")

    # ================================================================
    # Solucion: registrar medidas para el Incidente #1
    # (modelo conceptual: Incidente 0..1 -> Solucion)
    # ================================================================
    separador("Solucion: Registrar medidas para Incidente #1")
    res_sol = api_incidentes.registrar_solucion(token_encargada, 1, {
        "descripcion_s": "Mediacion entre Mateo Lopez y Santiago Ruiz con orientador.",
        "resultados": "Acuerdo de convivencia firmado por ambas partes y apoderados.",
    })
    solucion = res_sol.get("solucion", {})
    print(f"  [Solucion] id: {solucion.get('id')} | estado_s: {solucion.get('estado_s')}")
    print(f"  [Solucion] descripcion_s: {solucion.get('descripcion_s')}")
    print(f"  [Solucion] resultados: {solucion.get('resultados')}")

    # ================================================================
    # CU8: Agrupar en Conflicto vinculado a la Solucion
    # (modelo conceptual: Solucion 0..1 -> Conflicto)
    # ================================================================
    separador("CU8: Crear Conflicto a partir de los dos Incidentes (RF5 + RF6)")
    res_conf = api_incidentes.agrupar_conflicto(token_encargada, {
        "incidentes_ids": [1, 2],
        "titulo_c": "Conflicto reiterado Mateo-Santiago",
        "descripcion_c": "Patron de agresion escalada entre Mateo Lopez y Santiago Ruiz.",
        "solucion_id": 1,
    })
    conflicto = res_conf.get("conflicto", {})
    print(f"  [Conflicto] id_c: {conflicto.get('id_c')} | titulo_c: {conflicto.get('titulo_c')}")
    print(f"  [Conflicto] estado_c: {conflicto.get('estado_c')} | fecha_c: {conflicto.get('fecha_c')[:10]}")
    print(f"  [Conflicto] descripcion_c: {conflicto.get('descripcion_c')}")
    print(f"  [Conflicto] solucion_id vinculada: {conflicto.get('solucion_id')}")

    # ================================================================
    # Alertas generadas
    # ================================================================
    separador("Verificacion: Alertas pendientes (notificacion de Conflicto)")
    alertas = notificaciones.obtener_alertas()
    for alerta in alertas:
        print(f"  -> {alerta['mensaje']}")

    # ================================================================
    # CU1: Cerrar sesion
    # ================================================================
    separador("CU1: Cerrar sesion")
    api_auth.logout(token_docente)
    api_auth.logout(token_encargada)

    # ================================================================
    # Control de acceso: Docente no puede formalizar
    # ================================================================
    separador("Verificacion: Control de acceso — Docente intenta formalizar (debe fallar)")
    res2 = api_auth.login("maria.gonzalez@colegio.cl", "123")
    token_docente2 = res2.get("token")
    resultado = api_incidentes.formalizar_incidente(token_docente2, 2)
    print(f"  Resultado: {resultado}")

    print(f"\n{'='*70}")
    print("  Simulacion completada. Todas las clases relevantes fueron ejercitadas.")
    print(f"{'='*70}\n")


if __name__ == "__main__":
    main()
