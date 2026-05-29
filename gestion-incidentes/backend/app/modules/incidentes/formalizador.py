from datetime import datetime

class Formalizador:
    def __init__(self, gestor):
        self.gestor = gestor

    def _parsear_fecha(self, fecha_str):
        formatos = [
            "%d/%m/%Y %H:%M",
            "%Y-%m-%dT%H:%M",
            "%Y-%m-%d"
        ]
        for fmt in formatos:
            try:
                return datetime.strptime(fecha_str, fmt)
            except ValueError:
                continue
        return datetime.min

    def listar_incidentes(self):
        incidentes = [
            inc for inc in self.gestor.obtener_todos()
            if inc.estado_i == "Reportado"
        ]

        incidentes.sort(
            key=lambda x: self._parsear_fecha(x.fecha_i)
        )

        return incidentes

    def iniciar(self):
        while True:
            print("\n--- FORMALIZAR INCIDENTE ---")

            incidentes = self.listar_incidentes()

            if not incidentes:
                print("No hay incidentes reportados.")
                return

            for inc in incidentes:
                print(
                    f"ID: {inc.id_i} | "
                    f"Fecha: {inc.fecha_i} | "
                    f"Título: {inc.titulo_i}"
                )

            try:
                id_sel = int(
                    input("\nSeleccione ID del incidente (0 para salir): ")
                )

            except ValueError:
                print("Debe ingresar un número válido.")
                continue

            if id_sel == 0:
                return

            incidente = self.gestor.buscar_por_id(id_sel)

            if not incidente or incidente.estado_i != "Reportado":
                print("Incidente inválido.")
                continue

            self.menu_incidente(incidente)

    def menu_incidente(self, incidente):
        incidente.imprimir_informacion()

        print("\nOpciones:")
        print("1. Cancelar")
        print("2. Confirmar")

        opcion = input("Seleccione opción: ").strip()

        if opcion == "1":
            print("Proceso cancelado.")
            return

        elif opcion == "2":
            self.formalizar_incidente(incidente)

        else:
            print("Opción inválida.")

    def formalizar_incidente(self, incidente):
        confirmar = input(
            "\n¿Confirmar? (s/n): "
        ).lower()

        if confirmar != "s":
            print("Proceso cancelado.")
            return

        incidente.estado_i = "Formalizado"

        self.gestor.repo.guardar_todos(self.gestor.incidentes)

        print("\nIncidente formalizado correctamente.")

        opcion_solucion = input(
            "¿Desea añadir una solución? (s/n): "
        ).lower()

        if opcion_solucion == "s":
            print("Aun no se implementa eso jaja")
        else:
            print("Igual no se podia aun jaja")

        print("Proceso finalizado.")
