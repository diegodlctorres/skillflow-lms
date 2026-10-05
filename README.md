# SkillFlow · Biblioteca Markdown

Biblioteca privada para consultar, copiar, descargar, crear y editar documentos Markdown desde cualquier dispositivo. Vercel aloja el frontend; Supabase proporciona autenticación y persistencia.

## Configuración

Requiere Node.js 22 LTS, versión 22.12 o posterior dentro de la rama 22.x.

Sigue [la guía de Supabase y Vercel](docs/SUPABASE_SETUP.md): crear el proyecto Free, ejecutar [la migración SQL](supabase/migrations/001_document_library.sql), crear una cuenta e importar los originales.

```sh
npm install
```

Copia `.env.example` como `.env.local`, configura la URL y la clave pública de Supabase y ejecuta:

```sh
npm run dev
```

Abre `http://localhost:3000`. En PowerShell puedes usar `npm.cmd` si `npm.ps1` está bloqueado.

## Funcionalidades

- Acceso con correo y contraseña; biblioteca privada por cuenta con RLS.
- Búsqueda por nombre y contenido, lectura del Markdown original, copia y descarga `.md`.
- Creación, edición y cambio de nombre con guardado explícito en Supabase.
- Importación múltiple UTF-8, sin sobrescribir nombres existentes.
- Últimas 20 versiones por documento, descarga de versiones y restauración.
- Detección de conflictos entre dispositivos y aviso de cambios sin guardar.
- Interfaz adaptable a móvil y pantalla de configuración sin credenciales.

Los originales de `sq-regulatorios-contabilidad/` se conservan para la importación inicial y no se incluyen en el frontend compilado. Después de importar, Supabase es la fuente oficial. No hay sincronización automática con archivos locales ni registro público desde la aplicación.

## Comprobaciones

```sh
npm run typecheck
npm test
npm run test:database
npm run build
```

`test:database` ejecuta las tablas, funciones, políticas y triggers reales sobre PostgreSQL en memoria (PGlite), con Auth simulado. La prueba remota de login y persistencia requiere configurar tu proyecto; sigue el checklist de la guía.

## Organización

| Ruta | Propósito |
| --- | --- |
| `App.tsx`, `index.tsx` | Sesión y entrada de la aplicación |
| `src/components/` | Acceso, biblioteca, editor e historial |
| `src/documents/` | Modelo, validación, archivos y repositorio Supabase |
| `src/infrastructure/supabase.ts` | Cliente público de Supabase |
| `supabase/migrations/` | Esquema y permisos de la biblioteca |
| `docs/SUPABASE_SETUP.md` | Instalación, publicación y solución de problemas |
| `scripts/test-database.mjs` | Validación independiente de la base de datos |
| `sq-regulatorios-contabilidad/` | Originales preservados para importar |

Se retiraron los módulos de cursos, vídeos, matrículas y certificados, el backend Express y Prisma. La aplicación funciona sin API propia ni variables de Gemini. Tailwind se compila localmente; no depende de scripts de estilos o import maps de CDN.
