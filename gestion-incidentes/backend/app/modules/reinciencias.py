import json
import os

ARCHIVO_REINCIDENCIAS = os.path.join(
    os.path.dirname(__file__),
    'reincidencias.json'
)

class Reincidencia:
    def __init__(
        self,
        id_r,
        persona_foco,
        personas_involucradas,
        incidentes_asociados,
        encargado_seguimiento,
        fecha_revision,
        objetivos,
        analisis
    ):
        self.id_r = id_r
        self.persona_foco = persona_foco
        self.personas_involucradas = personas_involucradas
        self.incidentes_asociados = incidentes_asociados
        self.encargado_seguimiento = encargado_seguimiento
        self.fecha_revision = fecha_revision
        self.objetivos = objetivos
        self.analisis = analisis

    def to_dict(self):
        return {
            "id_r": self.id_r,
            "persona_foco": self.persona_foco,
            "personas_involucradas": self.personas_involucradas,
            "incidentes_asociados": self.incidentes_asociados,
            "encargado_seguimiento": self.encargado_seguimiento,
            "fecha_revision": self.fecha_revision,
            "objetivos": self.objetivos,
            "analisis": self.analisis
        }

    @classmethod
    def from_dict(cls, data):
        return cls(
            data["id_r"],
            data["persona_foco"],
            data.get("personas_involucradas", []),
            data.get("incidentes_asociados", []),
            data.get("encargado_seguimiento", ""),
            data.get("fecha_revision", ""),
            data.get("objetivos", []),
            data.get("analisis", "")
        )

    def imprimir_informacion(self):
        print("\n===== REINCIDENCIA =====")
        print(f"ID: {self.id_r}")
        print(f"Persona foco: {self.persona_foco}")

        if self.personas_involucradas:
            print(
                "Personas involucradas: "
                + ", ".join(self.personas_involucradas)
            )

        print(
            f"Incidentes asociados: "
            f"{', '.join(map(str, self.incidentes_asociados))}"
        )

        print(
            f"Encargado seguimiento: "
            f"{self.encargado_seguimiento}"
        )

        print(
            f"Fecha revisión: "
            f"{self.fecha_revision}"
        )

        print(
            "Objetivos: "
            + ", ".join(self.objetivos)
        )

        print(f"Análisis:\n{self.analisis}")

class ReincidenciaRepository:

    def cargar_todas(self):
        if not os.path.exists(ARCHIVO_REINCIDENCIAS):
            return []

        try:
            with open(
                ARCHIVO_REINCIDENCIAS,
                'r',
                encoding='utf-8'
            ) as archivo:

                datos = json.load(archivo)

                return [
                    Reincidencia.from_dict(d)
                    for d in datos
                ]

        except json.JSONDecodeError:
            return []

    def guardar_todas(self, reincidencias):

        with open(
            ARCHIVO_REINCIDENCIAS,
            'w',
            encoding='utf-8'
        ) as archivo:

            json.dump(
                [r.to_dict() for r in reincidencias],
                archivo,
                indent=4,
                ensure_ascii=False
            )

class GestorReincidencias:

    def __init__(self, repo):
        self.repo = repo
        self.reincidencias = repo.cargar_todas()

def crear_reincidencia(
    self,
    persona_foco,
    personas_involucradas,
    incidentes,
    encargado,
    fecha_revision,
    objetivos,
    analisis
):

    nuevo_id = (
        max(
            [r.id_r for r in self.reincidencias],
            default=0
        ) + 1
    )

    nueva = Reincidencia(
        nuevo_id,
        persona_foco,
        personas_involucradas,
        incidentes,
        encargado,
        fecha_revision,
        objetivos,
        analisis
    )

    self.reincidencias.append(nueva)

    self.repo.guardar_todas(
        self.reincidencias
    )

    return nueva

def buscar_por_id(self, id_r):

    for r in self.reincidencias:
        if r.id_r == id_r:
            return r

    return None

def obtener_todas(self):
    return self.reincidencias

