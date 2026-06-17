# Query Lab — MVP

Plataforma educativa de SQL estilo Coursera (Universidad de Lima), construida sobre la
plantilla Astro **Lonetrail**. Sprint 1: **DDL**.

## Qué incluye

- **Landing** (`/`) con la ruta del curso (Sprint 1 disponible, 2 y 3 "próximamente").
- **Curso `/sprint-1/`** estilo Coursera: encuesta pre → video 1 → video 2 → formulario post,
  con progreso guardado en el navegador (localStorage) y correo **@ulima.edu.pe** como
  llave de finalización.
- **2 temas de DDL** en formato blog con SQL resaltado y diagramas ER (Mermaid):
  `/posts/tema-1-fundamentos-ddl/` y `/posts/tema-2-ddl-en-la-practica/`.
- **Formularios nativos** (no Google Forms) que envían las respuestas a una **Google Sheet**
  (vía Apps Script). Esa hoja es el ERP centralizado para analizar la data.

## Correr en local

```bash
# (pnpm via corepack o npx pnpm)
npx pnpm install
npx pnpm dev        # http://localhost:4321
npx pnpm build      # genera /dist (estático)
```

> Nota Windows: si `pnpm install` avisa sobre `esbuild`/`sharp`, ya está resuelto en
> `pnpm-workspace.yaml` (`allowBuilds`). Si hace falta: `npx pnpm rebuild esbuild sharp`.

## Conectar el backend (Google Sheet)

1. Sigue [`apps-script/README.md`](./apps-script/README.md) para crear la hoja y desplegar
   el Web App.
2. Pega la URL `/exec` en `.env`:
   ```
   PUBLIC_FORM_ENDPOINT="https://script.google.com/macros/s/XXXX/exec"
   ```
3. Reinicia `pnpm dev`. Mientras esté vacío, los formularios funcionan en **modo demo**
   (validan y avanzan, pero no guardan).

## Personalización rápida

- **Marca / nav / idioma:** `src/site.yml`
- **Color de acento:** `src/styles/tokens.css` (`--ce-accent`) y `tailwind.config.cjs` (`lt.accent`)
- **Pasos / videos del curso:** `src/components/querylab/Sprint1Course.tsx`
- **Preguntas pre/post:** `src/components/querylab/surveyData.ts`
- **Lecciones:** `src/content/posts/ddl/*.md`

## Desplegar

Salida estática (`output: static`): sirve `dist/` en Vercel, Netlify o Cloudflare Pages.
Recuerda configurar `PUBLIC_FORM_ENDPOINT` como variable de entorno en el hosting.
