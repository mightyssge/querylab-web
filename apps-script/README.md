# Backend de Query Lab en Google Sheets (Apps Script)

Esta carpeta contiene el código del backend que recibe las respuestas de los
formularios de la plataforma y las guarda en una **Google Sheet**. Esa hoja es
tu **ERP**: ahí ves cuántas personas participan, quién terminó (por su correo
`@ulima.edu.pe`) y puedes comparar pre vs post para medir el aprendizaje.

No necesitas servidor: la web es estática y los formularios envían las respuestas
directamente a este Web App desde el navegador.

## 1. Crear la hoja y el script

1. Crea una **Google Sheet** nueva (en la cuenta del equipo). Ej: "Query Lab — Respuestas".
2. Menú **Extensiones → Apps Script**.
3. Borra el contenido por defecto y pega **todo** el contenido de [`Code.gs`](./Code.gs).
4. Guarda (💾).

## 2. Desplegar como aplicación web

1. Botón **Implementar → Nueva implementación**.
2. Tipo (engranaje) → **Aplicación web**.
3. Configura:
   - **Ejecutar como:** Yo (tu cuenta).
   - **Quién tiene acceso:** **Cualquier usuario**.
4. **Implementar** y autoriza los permisos cuando lo pida.
5. Copia la **URL de la aplicación web** (termina en `/exec`).

## 3. Conectar la web con el backend

En la raíz del proyecto `querylab-web`, edita el archivo `.env`:

```
PUBLIC_FORM_ENDPOINT="https://script.google.com/macros/s/XXXXXXXX/exec"
```

Reinicia el servidor de desarrollo (`pnpm dev`). Listo: cada envío crea una fila.

> Mientras `PUBLIC_FORM_ENDPOINT` esté vacío, los formularios funcionan en
> **modo demo** (validan y muestran éxito, pero no guardan nada).

## 4. Estructura de los datos

El script crea automáticamente dos pestañas:

- **Pre** → respuestas de la encuesta pre.
- **Post** → respuestas del formulario post (= alumno que terminó el sprint).

Columnas: `timestamp · sprint · nombre · correo · puntaje · q1..q5 · comentarios · recomienda · satisfaccion`.

## 5. Cómo analizar (el ERP)

- **Cuántos terminaron:** número de correos distintos en la pestaña **Post**.
- **Recorrido completo:** correos que aparecen en **Pre** *y* **Post**.
- **Mejora de aprendizaje:** compara la columna `puntaje` (0–5) de un mismo
  correo en Pre vs Post.
- **Satisfacción / recomendación:** columnas `satisfaccion` y `recomienda` del Post.

> Todos los correos deberían terminar en `@ulima.edu.pe` (la web lo valida antes de enviar).

## Nota sobre CORS

El Web App de Apps Script no devuelve cabeceras CORS. La plataforma envía **un único**
POST en modo `no-cors` con `Content-Type: text/plain` (petición "simple", sin preflight).
No se lee la respuesta (es opaca), pero la fila se escribe **una sola vez** y asumimos
éxito. Esto evita el doble registro que ocurriría si intentáramos leer la respuesta y
reintentar. Para el MVP es suficiente.

> El **puntaje (0–5) se calcula en este script** (no en el navegador), comparando el
> índice de la opción elegida contra la clave `CLAVE` de `Code.gs`. Mantén `CLAVE` en
> sincronía con el orden de las opciones en `src/components/querylab/surveyData.ts`.
