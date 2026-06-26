from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

# Importación de tu lógica nativa en incidente.py
from modules.incidentes.incidente import IncidenteRepository, GestorCasos
from modules.estudiantes.models import EstudianteRepository 

repo_estudiantes = EstudianteRepository()

app = FastAPI(title="API de Convivencia Escolar")

# Importación de lógica nativa en reincidencias.py
from modules.reincidencias import (
    ReincidenciaRepository,
    GestorReincidencias
)

# Configuración de CORS para permitir la comunicación con el prototipo frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"],
)

# Inicializamos el repositorio y gestor de incidentes
repositorio = IncidenteRepository()
gestor = GestorCasos(repositorio)

# Inicializamos el repositorio y gestor de reincidencias
repo_reincidencias = ReincidenciaRepository()
gestor_reincidencias = GestorReincidencias(
    repo_reincidencias
)

# ----------------------------------------------------------------
# MODELO CORREGIDO: Coincide exactamente con el JSON del prototipo
# ----------------------------------------------------------------
class IncidentePayload(BaseModel):
    titulo: str
    descripcion: str
    fecha: str
    estudiantes: List[str]
    nombre_docente: str
    gravedad: str
    lugar: str
    categorias: List[str]

class ReincidenciaPayload(BaseModel):
    personas_foco: List[str]
    personas_involucradas: List[str]
    incidentes_asociados: List[int]
    encargado_seguimiento: str
    fecha_revision: str
    objetivos: List[str]
    analisis: str


@app.post("/incidentes")
async def crear_incidente(payload: IncidentePayload):
    try:
        # 1. Pasamos los datos del prototipo a tu función original de Python
        nuevo_incidente = gestor.reportar_incidente(
            titulo=payload.titulo,
            descripcion=payload.descripcion,
            estudiantes=payload.estudiantes,
            nombre_docente=payload.nombre_docente,
            gravedad=payload.gravedad,
            lugar=payload.lugar,
            categorias=payload.categorias
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

@app.post("/reincidencias")
async def crear_reincidencia(
    payload: ReincidenciaPayload
):
    try:

        if len(payload.personas_foco) == 0:
            raise ValueError("Debe confirmar al menos una persona foco.")

        if len(payload.incidentes_asociados) < 2:
            raise ValueError("Debe asociar al menos dos incidentes.")

        if not payload.encargado_seguimiento.strip():
            raise ValueError("Debe indicar el encargado de seguimiento.")

        if not payload.fecha_revision.strip():
            raise ValueError("Debe indicar la fecha de revisión.")

        if len(payload.objetivos) == 0:
            raise ValueError("Debe seleccionar al menos un objetivo.")

        if not payload.analisis.strip():
            raise ValueError("Debe registrar el análisis de la reincidencia.")

        nueva = gestor_reincidencias.crear_reincidencia(
            personas_foco=payload.personas_foco,
            personas_involucradas=payload.personas_involucradas,
            incidentes_asociados=payload.incidentes_asociados,
            encargado_seguimiento=payload.encargado_seguimiento,
            fecha_revision=payload.fecha_revision,
            objetivos=payload.objetivos,
            analisis=payload.analisis
        )

        return nueva.to_dict()
    
    except Exception as e:
        print(f"Error interno al crear reincidencia: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error interno al crear la reincidencia."
        )
    

class SolucionPayload(BaseModel):
    plan_accion: str
    solucion: str

class EdicionIncidentePayload(BaseModel):
    titulo: str
    descripcion: str
    estudiantes: List[str]
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
        raise HTTPException(
            status_code=400,
            detail=str(err)
        )
    
@app.get("/reincidencias/{id_reincidencia}")
async def obtener_reincidencia(id_reincidencia: int):
    reincidencia = gestor_reincidencias.buscar_por_id(id_reincidencia)

    if reincidencia is None:
        raise HTTPException(
            status_code=404,
            detail="Reincidencia no encontrada."
        )

    return reincidencia.to_dict()

@app.get("/incidentes/buscar")
async def buscar_incidentes(termino: str = None, fecha: str = None): 
    try:
        if not termino or not termino.strip():
            resultados = gestor.obtener_historial()
        else:
            resultados = gestor.filtrar_por_estudiante(termino)

        if fecha and fecha.strip():
            resultados = [inc for inc in resultados if inc.fecha_i and fecha in str(inc.fecha_i)]
            
        return [inc.to_dict() for inc in resultados]
    except Exception as e:
        print(f"Error en la búsqueda de la base de datos: {e}")
        raise HTTPException(status_code=500, detail="Error interno al procesar el filtro.")
    
@app.get("/reincidencias")
async def obtener_reincidencias():

    return [
        reincidencia.to_dict()
        for reincidencia in gestor_reincidencias.obtener_todas()
    ]

@app.get("/estudiantes")
async def obtener_estudiantes():
    try:
        estudiantes = repo_estudiantes.obtener_todos()
        return estudiantes
    except Exception as e:
        raise HTTPException(status_code=500, detail="No se pudo cargar la lista de alumnos.")
    
@app.put("/incidentes/{id_incidente}/editar")
async def editar_incidente_completo(id_incidente: int, payload: EdicionIncidentePayload):
    try:
        incidente = gestor.editar_incidente(
            id_incidente=id_incidente,
            nuevo_titulo=payload.titulo,
            nueva_descripcion=payload.descripcion,
            nuevos_estudiantes=payload.estudiantes,
            nueva_solucion=payload.solucion
        )
        
        incidente.plan_accion_i = payload.plan_accion
        gestor.repo.guardar_todos(gestor.incidentes)
        
        return incidente.to_dict()
    except ValueError as err:
        raise HTTPException(status_code=400, detail=str(err))
    except Exception as e:
        print(f"Error al editar: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")