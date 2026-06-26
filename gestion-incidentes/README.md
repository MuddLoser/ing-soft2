# Instalación y ejecución

## Requisitos previos

Antes de ejecutar el proyecto, asegúrate de tener instalado:

- Node.js
- npm

Puedes verificarlo con:

```bash
node -v
npm -v
```

## Instalación

Desde la raíz del repositorio, entra a la carpeta del frontend:

```bash
cd frontend
```

Instala las dependencias:

```bash
npm install
```


## Ejecutar el backend 

### Desde: `gestion-incidentes/backend/app`

```bash
# Instalar dependencias
pip install -r requirements.txt

# Ejecutar el servidor
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

El backend estará disponible en `http://localhost:8000`. Para detener, presiona:

```bash
Ctrl + C
```

**Datos guardados en:** `gestion-incidentes/backend/app/modules/incidentes/incidentes.json`


## Notas Importantes

- El archivo `incidentes.json` se genera automáticamente cuando se registra el primer incidente
- Los datos persisten entre sesiones (guardados en JSON)


## Ejecutar el frontend

En una consola aparte, inicia el servidor de desarrollo:

```bash
npm run dev
```

Luego abre en el navegador la URL que indique la terminal. Normalmente será:

```txt
http://localhost:5173
```

## Credenciales para programa

Para acceder a las funciones del programa se usan dos cuentas de prueba:
- La cuenta de profesor: rsalazar2504 / Contraseña: 1234
- La cuenta de inspector o encargado de convivencia: psoto3467 / Contraseña: admin123

## Detener el servidor

Para detener el servidor de desarrollo, presiona:

```bash
Ctrl + C
```
