from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

from modules.incidentes.incidente import IncidenteRepository, GestorCasos

app = FastAPI(title="API de Convivencia Escolar")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"],
)

repositorio = IncidenteRepository()
gestor = GestorCasos(repositorio)

class IncidentePayload(BaseModel):
    titulo: str
    descripcion: str
    fecha: str
    estudiantes: List[str]
    nombre_docente: str

@app.post("/incidentes")
async def crear_incidente(payload: IncidentePayload):
    try:
        nuevo_incidente = gestor.reportar_incidente(
            titulo=payload.titulo,
            descripcion=payload.descripcion,
            estudiantes=payload.estudiantes,
            nombre_docente=payload.nombre_docente
        )
        
        nuevo_incidente.fecha_i = payload.fecha
        
        gestor.repo.guardar_todos(gestor.incidentes)
        
        return nuevo_incidente.to_dict()

    except ValueError as err:
        raise HTTPException(status_code=400, detail=str(err))
    except Exception as e:
        print(f"Error interno: {e}")
        raise HTTPException(status_code=500, detail="Error interno en el servidor.")

@app.get("/incidentes")
async def obtener_todos():
    return [inc.to_dict() for inc in gestor.obtener_todos()]

@app.put("/incidentes/{id_incidente}/formalizar")
async def formalizar(id_incidente: int):
    try:
        incidente = gestor.formalizar_incidente(id_incidente)
        return incidente.to_dict()
    except ValueError as err:
        raise HTTPException(status_code=400, detail=str(err))

class SolucionPayload(BaseModel):
    solucion: str

@app.put("/incidentes/{id_incidente}/solucion")
async def asignar_solucion(id_incidente: int, payload: SolucionPayload):
    try:
        incidente = gestor.asignar_solucion(id_incidente, payload.solucion)
        return incidente.to_dict()
    except ValueError as err:
        raise HTTPException(status_code=400, detail=str(err))