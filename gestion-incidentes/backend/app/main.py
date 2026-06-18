from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

from modules.incidentes.incidente import IncidenteRepository, GestorCasos
from modules.estudiantes.models import EstudianteRepository 

repo_estudiantes = EstudianteRepository()
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
    plan_accion: str
    solucion: str

@app.put("/incidentes/{id_incidente}/solucion")
async def asignar_solucion(id_incidente: int, payload: SolucionPayload):
    try:
        incidente = gestor.asignar_solucion(
            id_incidente=id_incidente,
            plan_accion=payload.plan_accion,
            solucion=payload.solucion
        )
        return incidente.to_dict()
    except ValueError as err:
        raise HTTPException(status_code=400, detail=str(err))
    
@app.get("/incidentes/buscar")
async def buscar_incidentes(termino: str = None):
    try:
        if not termino or not termino.strip():
            resultados = gestor.obtener_historial()
        else:
            resultados = gestor.filtrar_por_estudiante(termino)
            
        return [inc.to_dict() for inc in resultados]
    except Exception as e:
        print(f"Error en la búsqueda de la base de datos: {e}")
        raise HTTPException(status_code=500, detail="Error interno al procesar el filtro.")
    
@app.get("/estudiantes")
async def obtener_estudiantes():
    try:
        estudiantes = repo_estudiantes.obtener_todos()
        return estudiantes
    except Exception as e:
        raise HTTPException(status_code=500, detail="No se pudo cargar la lista de alumnos.")