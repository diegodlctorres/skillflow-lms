# Configurar la biblioteca Markdown

La web se aloja en Vercel; Supabase guarda los documentos y gestiona el acceso. No necesitas un servidor propio, Prisma, una URL de conexión PostgreSQL ni un bucket de Storage. Cada cuenta tiene su biblioteca privada. Los registros públicos se desactivan para esta primera versión personal.

## 1. Crear el proyecto gratuito

1. Entra en [Supabase Dashboard](https://supabase.com/dashboard) y crea una organización **Free**, si aún no tienes una.
2. Crea un proyecto, por ejemplo `skillflow-markdown`. Elige una región cercana a tus usuarios y guarda la contraseña de la base de datos en tu gestor de contraseñas. Esa contraseña no se utiliza en esta aplicación.
3. Espera a que el proyecto esté disponible. Mantén el plan **Free**; no necesitas activar servicios de pago.
4. En **SQL Editor**, abre una consulta nueva y ejecuta íntegramente [001_document_library.sql](../supabase/migrations/001_document_library.sql).

Este script se ejecuta **una vez en un proyecto nuevo**. Crea tablas, políticas RLS, historial y funciones. No borra ni migra el antiguo LMS. Si ya existen tablas `documents` o `document_versions`, revisa el proyecto antes de ejecutarlo; la transacción falla sin reemplazarlas.

## 2. Crear tu cuenta

1. Ve a **Authentication → Sign In / Providers** (el nombre puede variar en el Dashboard).
2. Mantén habilitado el proveedor **Email** y desactiva **Allow new users to sign up**. La aplicación no ofrece registro abierto.
3. En **Authentication → Users → Add user → Create new user**, crea tu correo y una contraseña segura. Marca **Auto Confirm User** para poder entrar sin depender del envío de correo.
4. Esta contraseña es la de tu usuario, distinta de la contraseña de la base de datos.

Para esta versión el acceso usa correo y contraseña. No requiere magic links ni configurar SMTP. Si necesitas cambiar una contraseña, un administrador puede actualizar el usuario desde Authentication → Users; la aplicación todavía no tiene recuperación por correo.

Cada usuario adicional creado por el administrador tendrá **su propia biblioteca**. No comparte tus documentos. No hay roles de colaboración ni biblioteca común.

## 3. Obtener la URL y la clave pública

En el diálogo **Connect**, o en **Project Settings → API / API Keys**, copia:

- **Project URL**, similar a `https://xxxxxxxx.supabase.co`.
- **Publishable key**, que comienza por `sb_publishable_`.

Se admite también la antigua clave **anon** mediante `VITE_SUPABASE_ANON_KEY`, si tu proyecto aún la utiliza. Prefiere `VITE_SUPABASE_PUBLISHABLE_KEY` en proyectos nuevos.

La clave pública se incorpora al navegador; los permisos dependen de la sesión y de las políticas RLS. **No uses `service_role`, `sb_secret_…`, contraseña de PostgreSQL ni ninguna clave privada en variables `VITE_*`.** Esas variables son públicas en una aplicación Vite.

Referencia oficial: [API keys](https://supabase.com/docs/guides/getting-started/api-keys) y [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security).

## 4. Probar localmente

Usa Node.js 22.12 o posterior; en Vercel selecciona Node 22 en la configuración del proyecto.

Copia `.env.example` como `.env.local` en la raíz y sustituye los valores:

```dotenv
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxx
```

Ejecuta:

```sh
npm install
npm run dev
```

En PowerShell, si la política de ejecución bloquea `npm.ps1`, utiliza `npm.cmd install` y `npm.cmd run dev`.

Abre `http://localhost:3000` e inicia sesión con la cuenta del paso 2. Sin variables de entorno aparece una pantalla de configuración y no se exponen archivos locales.

## 5. Importar los archivos existentes

1. Pulsa **Importar .md**.
2. Selecciona los 13 archivos de `sq-regulatorios-contabilidad` (puedes seleccionar varios a la vez).
3. La aplicación lee los archivos UTF-8 y los guarda en tu cuenta. Conserva el texto, incluyendo saltos de línea y BOM.
4. Comprueba el resultado indicado por el aviso: cantidad importada y cantidad omitida.

Límites propios de la aplicación: **50 archivos por importación**, **2 MB UTF-8 por documento** y nombres de hasta **180 caracteres**, con extensión `.md`, sin rutas ni caracteres de control. Una importación inválida revierte todo el lote. Los nombres existentes se omiten sin sobrescribir, incluso si difieren únicamente en mayúsculas.

Los originales locales permanecen intactos. No hay sincronización automática con esa carpeta. Después de importar, **Supabase es la fuente oficial**; las ediciones se hacen en la web y la descarga `.md` permite conservar copias portables. El frontend no incluye la carpeta original en sus assets.

## 6. Configurar Vercel

En el proyecto de Vercel:

1. Mantén **Framework Preset: Vite**, **Build Command: `npm run build`**, **Output Directory: `dist`**. El archivo `vercel.json` ya contiene estos ajustes.
2. En **Settings → Environment Variables**, añade `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY`. Marca **Production** y los entornos de Preview/Development que quieras conectar. Si apuntas Preview al mismo Supabase, sus cambios afectan a los mismos documentos.
3. Publica esta versión y vuelve a desplegar después de cambiar las variables: Vite las incorpora durante la compilación.
4. Entra desde la URL publicada con la misma cuenta. Tus documentos importados localmente ya estarán allí, sin importarlos de nuevo.

No se ha publicado automáticamente esta modificación ni se ha creado un proyecto Supabase desde este repositorio. Tampoco se han cambiado variables remotas.

## 7. Comprobar que funciona

- Crea `prueba.md`, guarda un título y consulta el documento desde otro dispositivo.
- Edita su contenido; guarda y comprueba el aumento de versión.
- Copia y descarga; verifica que obtienes Markdown original.
- Abre **Historial**, selecciona una versión y restáurala: se crea una nueva versión.
- Abre el mismo documento en dos pestañas, edita y guarda en la primera. Intenta guardar desde la segunda: debe aparecer un conflicto. Descarga el borrador y usa **Actualizar biblioteca** para recargar.
- Importa el mismo archivo dos veces: la segunda importación debe omitirlo.
- Cierra sesión: no debe verse el contenido. Si creas otra cuenta, no debe poder consultar la biblioteca de la primera.

Los borradores no se guardan automáticamente. Se advierte antes de cerrar la página o descartarlos, pero eso no reemplaza el guardado explícito ni garantiza recuperación ante cierre del navegador o caducidad de sesión.

## 8. Mantener el costo gratuito

Según la documentación consultada el 4 de octubre de 2026, [Supabase Free](https://supabase.com/pricing) incluye **500 MB de base de datos**. Los archivos iniciales ocupan aproximadamente 1,23 MB de texto; los índices, tablas, otros datos y el historial también consumen espacio. Se conservan las últimas **20 versiones por documento** para limitar el crecimiento, pero no hay garantía de capacidad ilimitada. Monitoriza **Database / Usage** en el Dashboard.

Supabase puede [pausar proyectos gratuitos con poca actividad durante siete días](https://supabase.com/docs/guides/platform/free-project-pausing). Si sucede, restáuralo desde el Dashboard. No se añade tráfico artificial para evitar la pausa. El historial no reemplaza un respaldo: descarga los documentos importantes y conserva los originales de la importación.

[Vercel Hobby](https://vercel.com/docs/plans/hobby) está limitado a uso personal y no comercial, con cuotas de recursos. Si este contenido se utiliza como herramienta de trabajo comercial, verifica la elegibilidad antes de contar con Hobby como alojamiento gratuito. Elige el dominio gratuito de Vercel si no quieres comprar uno propio.

## Solución de problemas

| Síntoma | Qué revisar |
| --- | --- |
| Aparece “Conecta tu biblioteca” | Faltan variables; reinicia Vite o redespliega Vercel. |
| Error de configuración | Comprueba la URL de proyecto y usa una clave pública. |
| Credenciales inválidas | Correo, contraseña y usuario confirmado en Authentication. |
| Falta configurar la base de datos | Ejecuta la migración completa en el mismo proyecto indicado por la URL. |
| Biblioteca vacía | Cada cuenta tiene sus documentos; importa los originales en esa cuenta. |
| Nombre duplicado | Cambia el nombre o edita el documento existente. Importar omite duplicados. |
| Conflicto al guardar | Descarga tu borrador, recarga y aplica los cambios sobre la última versión. |
| Error de conexión | Comprueba red, URL, clave y estado del proyecto en Supabase. |
| Se supera el límite de base de datos | Revisa Usage e historial; no cambies de plan sin evaluar el crecimiento. |

## Arquitectura y comprobaciones locales

- `App.tsx`: configuración y sesión; nunca muestra los Markdown sin autenticación.
- `src/components/`: acceso, biblioteca, editor e historial.
- `src/documents/`: validación, archivos y operaciones de Supabase.
- `supabase/migrations/001_document_library.sql`: tablas, RLS y RPCs.
- Escrituras mediante RPC con propietario obtenido de `auth.uid()`. Las tablas permiten lectura propia y deniegan escritura directa.
- `save_document` bloquea la fila y exige la revisión cargada antes de guardar. La nueva versión y el historial se guardan en la misma transacción.
- Importación transaccional y sin sobrescritura.
- El navegador solicita todas las páginas de la biblioteca; el historial carga el contenido de una versión solo al seleccionarla.

```sh
npm run typecheck
npm test
npm run test:database
npm run build
```

La prueba de base de datos usa PostgreSQL en memoria mediante PGlite: ejecuta la migración real y comprueba RPCs, constraints, RLS, historial, conflictos e importación de los originales. Simula el esquema/roles de Auth; **no valida el servicio remoto de Supabase ni el login real**. La comprobación del paso 7 completa esa validación después de configurar el proyecto.
