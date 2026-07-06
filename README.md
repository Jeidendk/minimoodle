# MiniMoodle Ineval

MiniMoodle es una app React 19 para practicar cuestionarios tipo Ineval con dos roles:

- **Estudiante:** revisa cursos, entra a cuestionarios, responde preguntas y ve resultados.
- **Docente:** crea cursos, cuestionarios y preguntas, y revisa intentos de estudiantes.

La app funciona en dos modos:

- **Demo local:** usa `localStorage` y datos de ejemplo. No necesita instalar nada.
- **Supabase:** al configurar URL y anon key, guarda datos en Postgres/Supabase.

## Probar rápido

Instala dependencias con pnpm y levanta Vite:

```bash
corepack enable
corepack prepare pnpm@10.11.0 --activate
pnpm install
pnpm dev
```

Si Windows no te deja activar el comando global `pnpm`, usa Corepack directo:

```bash
corepack pnpm install
corepack pnpm dev
```

Para generar la versión de producción:

```bash
pnpm build
```

## Usuarios demo

En modo demo puedes cambiar de rol desde la pantalla inicial:

- Docente: `docente@minimoodle.local`
- Estudiante: `estudiante@minimoodle.local`

## Banco de preguntas

El docente puede importar preguntas de forma masiva desde el panel docente. El formato usa una pregunta por fila:

```csv
pregunta|opcion_a|opcion_b|opcion_c|opcion_d|respuesta|retroalimentacion
Cual es la idea central de un texto?|El titulo|El mensaje principal|Un ejemplo|Una fecha|B|La idea central organiza todo el contenido.
```

La respuesta puede ser letra (`A`, `B`, `C`, `D`) o numero (`1`, `2`, `3`, `4`).

## Supabase

1. Crea un proyecto en Supabase.
2. Ejecuta `supabase/schema.sql` en el SQL Editor.
3. Copia `.env.example` como `.env` y coloca tus credenciales públicas:

```bash
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=TU_ANON_KEY
```

La anon key de Supabase es pública por diseño; nunca pongas service role keys en frontend.

## Render

La configuracion incluida en `render.yaml` publica el proyecto como sitio estatico:

- Build command: `corepack enable && pnpm install --frozen-lockfile && pnpm build`
- Publish directory: `dist`
- Rewrite: `/* -> /index.html`

## Estructura

```text
minimoodle/
├── index.html
├── render.yaml
├── package.json
├── src/
│   ├── main.jsx
│   ├── styles.css
└── supabase/
    └── schema.sql
```
