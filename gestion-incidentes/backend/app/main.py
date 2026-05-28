from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

# Importación de tu lógica nativa en incidente.py
from modules.incidentes.incidente import IncidenteRepository, GestorCasos

app = FastAPI(title="API de Convivencia Escolar")

# Configuración de CORS para permitir la comunicación con el prototipo frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"],
)

# Inicializamos el repositorio y gestor
repositorio = IncidenteRepository()
gestor = GestorCasos(repositorio)

# ----------------------------------------------------------------
# MODELO CORREGIDO: Coincide exactamente con el JSON del prototipo
# ----------------------------------------------------------------
class IncidentePayload(BaseModel):
    titulo: str
    descripcion: str
    fecha: str
    estudiantes: List[str]
    nombre_docente: str

@app.post("/incidentes")
async def crear_incidente(payload: IncidentePayload):
    try:
        # 1. Pasamos los datos del prototipo a tu función original de Python
        nuevo_incidente = gestor.reportar_incidente(
            titulo=payload.titulo,
            descripcion=payload.descripcion,
            estudiantes=payload.estudiantes,
            nombre_docente=payload.nombre_docente
        )
        
        # 2. Sincronizamos la fecha que viene desde la interfaz web
        nuevo_incidente.fecha_i = payload.fecha
        
        # 3. Guardamos en el archivo incidentes.json
        gestor.repo.guardar_todos(gestor.incidentes)
        
        # 4. Devolvemos el diccionario. Incluye id_i que el frontend necesita para el banner.
        return nuevo_incidente.to_dict()

    except ValueError as err:
        raise HTTPException(status_code=400, detail=str(err))
    except Exception as e:
        print(f"Error interno: {e}")
        raise HTTPException(status_code=500, detail="Error interno en el servidor.")

@app.get("/incidentes")
async def obtener_todos():
    return [inc.to_dict() for inc in gestor.obtener_todos()]