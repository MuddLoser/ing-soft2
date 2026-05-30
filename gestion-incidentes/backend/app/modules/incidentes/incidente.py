import json
import os
from datetime import datetime   

ARCHIVO_DATOS = os.path.join(os.path.dirname(__file__), 'incidentes.json')

class Incidente:
    def __init__(self, id_i, titulo_i, descripcion_i, fecha_i, estado_i, estudiantes_asociados, reportado_por, solucion_i="", plan_accion_i=""):
        self.id_i = id_i
        self.titulo_i = titulo_i
        self.descripcion_i = descripcion_i
        self.fecha_i = fecha_i
        self.estado_i = estado_i
        self.estudiantes_asociados = estudiantes_asociados
        self.reportado_por = reportado_por
        self.solucion_i = solucion_i
        self.plan_accion_i = plan_accion_i

    def to_dict(self):
        return {
            "id_i": self.id_i,
            "titulo_i": self.titulo_i,
            "descripcion_i": self.descripcion_i,
            "fecha_i": self.fecha_i,
            "estado_i": self.estado_i,
            "estudiantes_asociados": self.estudiantes_asociados,
            "reportado_por": self.reportado_por,
            "solucion_i": self.solucion_i,
            "plan_accion_i": self.plan_accion_i
        }

    @classmethod
    def from_dict(cls, data):
        return cls(
            data["id_i"],
            data["titulo_i"],
            data["descripcion_i"],
            data["fecha_i"],
            data["estado_i"],
            data.get("estudiantes_asociados", []),
            data.get("reportado_por", "Desconocido"),
            data.get("solucion_i", ""),
            data.get("plan_accion_i", "")
        )

    def imprimir_informacion(self):
        print("\n")
        print(f"DETALLE DEL INCIDENTE [Folio: {self.id_i}]")
        print(f"TÍTULO       : {self.titulo_i}")
        print(f"FECHA        : {self.fecha_i}")
        print(f"ESTADO       : {self.estado_i}")
        print(f"REPORTADO POR: {self.reportado_por}")
        print(f"ESTUDIANTES  : {', '.join(self.estudiantes_asociados) if self.estudiantes_asociados else 'Ninguno'}")
        print(f"DESCRIPCIÓN  :\n{self.descripcion_i}")
        print(f"SOLUCIÓN     : {self.solucion_i if self.solucion_i else 'Sin solución registrada'}")


class IncidenteRepository:
    def cargar_todos(self):
        if not os.path.exists(ARCHIVO_DATOS):
            return []
        try:
            with open(ARCHIVO_DATOS, 'r', encoding='utf-8') as archivo:
                datos = json.load(archivo)
                return [Incidente.from_dict(d) for d in datos]
        except json.JSONDecodeError:
            return []

    def guardar_todos(self, lista_incidentes):
        with open(ARCHIVO_DATOS, 'w', encoding='utf-8') as archivo:
            datos = [inc.to_dict() for inc in lista_incidentes]
            json.dump(datos, archivo, indent=4, ensure_ascii=False)


class GestorCasos:
    def __init__(self, repositorio):
        self.repo = repositorio
        self.incidentes = self.repo.cargar_todos()

    def reportar_incidente(self, titulo, descripcion, estudiantes, nombre_docente):
        if not nombre_docente or not nombre_docente.strip():
            raise ValueError("El nombre del adulto responsable es obligatorio.")
        if not titulo or not titulo.strip():
            raise ValueError("El incidente debe tener un titulo.")
        if not descripcion or not descripcion.strip():
            raise ValueError("Debe ingresar una descripcion.")

        nuevo_id = max([inc.id_i for inc in self.incidentes], default=0) + 1
        fecha_actual = datetime.now().strftime("%d/%m/%Y   %H:%M")
        estado_inicial = "Reportado"

        nuevo_incidente = Incidente(
            id_i=nuevo_id,
            titulo_i=titulo,
            descripcion_i=descripcion,
            fecha_i=fecha_actual,
            estado_i=estado_inicial,
            estudiantes_asociados=estudiantes,
            reportado_por=nombre_docente
        )
        
        self.incidentes.append(nuevo_incidente)
        self.repo.guardar_todos(self.incidentes)
        return nuevo_incidente

    def buscar_por_id(self, id_incidente):
        for incidente in self.incidentes:
            if str(incidente.id_i) == str(id_incidente):
                return incidente
        return None

    def obtener_todos(self):
        return self.incidentes
    
    def formalizar_incidente(self, id_incidente):
        incidente = self.buscar_por_id(id_incidente)
        if not incidente:
            raise ValueError("Incidente no encontrado.")
        if incidente.estado_i == "Formalizado":
            raise ValueError("El incidente ya está formalizado.")
        incidente.estado_i = "Formalizado"
        self.repo.guardar_todos(self.incidentes)
        return incidente
    
    def asignar_solucion(self, id_incidente, plan_accion, solucion):
        incidente = self.buscar_por_id(id_incidente)
        if not incidente:
            raise ValueError("Incidente no encontrado.")
        if incidente.estado_i != "Formalizado":
            raise ValueError("El incidente debe estar formalizado.")
        if not solucion.strip():
            raise ValueError("Debe ingresar una solución.")
        
        incidente.plan_accion_i = plan_accion
        incidente.solucion_i = solucion
        self.repo.guardar_todos(self.incidentes)
        return incidente
    
    def editar_incidente(
    self,
    id_incidente,
    nuevo_titulo=None,
    nueva_descripcion=None,
    nuevos_estudiantes=None,
    nueva_solucion=None):
        incidente = self.buscar_por_id(id_incidente)
        if not incidente:
            raise ValueError("Incidente no encontrado.")
        if nuevo_titulo is not None and nuevo_titulo.strip():
            incidente.titulo_i = nuevo_titulo
        if nueva_descripcion is not None and nueva_descripcion.strip():
            incidente.descripcion_i = nueva_descripcion
        if nuevos_estudiantes is not None:
            incidente.estudiantes_asociados = nuevos_estudiantes
        if nueva_solucion is not None and nueva_solucion.strip():
            incidente.solucion_i = nueva_solucion
        self.repo.guardar_todos(self.incidentes)
        return incidente


def main():
    repositorio = IncidenteRepository()
    gestor = GestorCasos(repositorio)
    
    while True:
        print("\n" )
        print("SISTEMA DE CONVIVENCIA ESCOLAR")
        print("1. Reportar un nuevo incidente")
        print("2. Abrir un incidente existente")
        print("3. Formalizar incidente")
        print("4. Asignar solución")
        print("5. Salir")

        opcion = input("Seleccione una opción (1-5): ").strip()
        
        if opcion == '1':
            print("\n-- REPORTAR NUEVO INCIDENTE --")
            nombre_docente = input("Su nombre y cargo (Ej. Juan Pérez - Profesor): ").strip()
            titulo = input("Ingrese un título: ").strip()
            descripcion = input("Ingrese una descripción: ").strip()
            
            estudiantes_input = input("Estudiantes involucrados (separados por coma): ")
            estudiantes = [e.strip() for e in estudiantes_input.split(',') if e.strip()]
            
            nuevo_inc = gestor.reportar_incidente(titulo, descripcion, estudiantes, nombre_docente)
            print("\nIncidente guardado con éxito.")
            nuevo_inc.imprimir_informacion()
            
        elif opcion == '2':
            print("\n-- INCIDENTES REGISTRADOS --")
            todos = gestor.obtener_todos()
            if not todos:
                print("No hay incidentes registrados.")
                continue
                
            for inc in todos:
                print(f"ID: {inc.id_i} | Fecha: {inc.fecha_i} | Título: {inc.titulo_i}")
                
            try:
                id_buscar = int(input("\nIngrese el ID del incidente que desea abrir: "))
                incidente_encontrado = gestor.buscar_por_id(id_buscar)
                
                if incidente_encontrado:
                    incidente_encontrado.imprimir_informacion()
                else:
                    print("\nNo se encontró ningún incidente con ese ID.")
            except ValueError:
                print("\nDebe ingresar un número entero.")
                
        elif opcion == '3':
            print("\n-- FORMALIZAR INCIDENTE --")
            try:
                id_formalizar = int(input("Ingrese el ID del incidente: "))
                incidente = gestor.formalizar_incidente(id_formalizar)
                print("\nIncidente formalizado correctamente.")
                incidente.imprimir_informacion()
            except ValueError as e:
                print(f"\nError: {e}")
        elif opcion == '4':
            print("\n-- ASIGNAR SOLUCIÓN --")
            try:
                id_incidente = int(input("Ingrese el ID del incidente: "))
                solucion = input("Ingrese el plan de acción: ").strip()
                incidente = gestor.asignar_solucion(id_incidente, solucion)
                print("\nSolución registrada correctamente.")
                incidente.imprimir_informacion()
            except ValueError as e:
                print(f"\nError: {e}")
        elif opcion == '5':
            print("\n-- EDITAR INCIDENTE --")
            try:
                id_incidente = int(
                    input("Ingrese el ID del incidente: ")
                )

                incidente_actual = gestor.buscar_por_id(
                    id_incidente
                )

                if not incidente_actual:
                    print("Incidente no encontrado.")
                    continue

                print("\nDeje vacío para no modificar.")

                nuevo_titulo = input(
                    f"Título [{incidente_actual.titulo_i}]: "
                ).strip()

                nueva_descripcion = input(
                    f"Descripción [{incidente_actual.descripcion_i}]: "
                ).strip()

                estudiantes_input = input(
                    "Estudiantes separados por coma: "
                ).strip()

                nueva_solucion = input(
                    f"Solución [{incidente_actual.solucion_i}]: "
                ).strip()

                nuevos_estudiantes = (
                    [e.strip() for e in estudiantes_input.split(',')]
                    if estudiantes_input
                    else incidente_actual.estudiantes_asociados
                )

                incidente = gestor.editar_incidente(
                    id_incidente,
                    nuevo_titulo or None,
                    nueva_descripcion or None,
                    nuevos_estudiantes,
                    nueva_solucion if nueva_solucion != "" else incidente_actual.solucion_i
                )

                print("\nIncidente actualizado correctamente.")

                incidente.imprimir_informacion()

            except ValueError as e:
                print(f"\nError: {e}")

if __name__ == "__main__":
    main()