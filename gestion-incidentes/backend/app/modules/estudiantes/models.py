import json
import os

ARCHIVO_ESTUDIANTES = os.path.join(os.path.dirname(__file__), 'estudiantes.json')

class EstudianteRepository:
    def obtener_todos(self):
        try:
            if not os.path.exists(ARCHIVO_ESTUDIANTES):
                return []
            
            with open(ARCHIVO_ESTUDIANTES, 'r', encoding='utf-8') as f:
                datos = json.load(f)
            return datos
        except Exception as e:
            print(f"Error leyendo estudiantes: {e}")
            return []