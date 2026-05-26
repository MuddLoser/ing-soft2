import json
import os
from datetime import datetime

ARCHIVO_DATOS = 'incidentes.json'

class Incidente:
    def __init__(self, id_i, titulo_i, descripcion_i, fecha_i, estado_i, estudiantes_asociados, reportado_por):
        self.id_i = id_i
        self.titulo_i = titulo_i
        self.descripcion_i = descripcion_i
        self.fecha_i = fecha_i
        self.estado_i = estado_i
        self.estudiantes_asociados = estudiantes_asociados
        self.reportado_por = reportado_por

    def to_dict(self):
        return {
            "id_i": self.id_i,
            "titulo_i": self.titulo_i,
            "descripcion_i": self.descripcion_i,
            "fecha_i": self.fecha_i,
            "estado_i": self.estado_i,
            "estudiantes_asociados": self.estudiantes_asociados,
            "reportado_por": self.reportado_por
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
            data.get("reportado_por", "Desconocido")
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
        nuevo_id = max([inc.id_i for inc in self.incidentes], default=0) + 1
        fecha_actual = datetime.now().strftime("%d/%m/%Y %H:%M")
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

    def buscar_por_id(self, id_buscar):
        return next((inc for inc in self.incidentes if inc.id_i == id_buscar), None)

    def obtener_todos(self):
        return self.incidentes


def main():
    repositorio = IncidenteRepository()
    gestor = GestorCasos(repositorio)
    
    while True:
        print("\n" )
        print("SISTEMA DE CONVIVENCIA ESCOLAR")
        print("1. Reportar un nuevo incidente")
        print("2. Abrir un incidente existente")
        print("3. Salir")
        
        opcion = input("Seleccione una opción (1-3): ").strip()
        
        if opcion == '1':
            print("\n-- REPORTAR NUEVO INCIDENTE --")
            nombre_docente = input("Su nombre y cargo (Ej. Juan Pérez - Profesor): ").strip()
            titulo = input("Ingrese un título: ").strip()
            descripcion = input("Ingrese una descripción: ").strip()
            
            estudiantes_input = input("Estudiantes involucrados (separados por coma): ")
            estudiantes = [e.strip() for e in estudiantes_input.split(',') if e.strip()]
            
            # La UI le entrega los datos crudos al Gestor para que haga el trabajo
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
            print("Saliendo del sistema...")
            break
        else:
            print("Opción no válida.")

if __name__ == "__main__":
    main()