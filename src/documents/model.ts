export interface MarkdownDocument {
  id: string;
  owner_id: string;
  name: string;
  content: string;
  revision: number;
  created_at: string;
  updated_at: string;
}

export interface DocumentVersion {
  id: string;
  document_id: string;
  name: string;
  content: string;
  revision: number;
  created_at: string;
}

export const MAX_DOCUMENT_BYTES = 2 * 1024 * 1024;
export const MAX_IMPORT_FILES = 50;

export function normalizeName(value: string): string {
  const name = value.trim();
  return /\.md$/i.test(name) ? name : `${name}.md`;
}

export function validateDocument(name: string, content: string): string | null {
  if (!name.trim() || name.toLowerCase() === '.md') return 'Escribe un nombre para el documento.';
  if (name !== name.trim() || name.length > 180 || /[\\/\x00-\x1f\x7f]/.test(name)) {
    return 'El nombre debe tener hasta 180 caracteres, sin rutas ni caracteres de control.';
  }
  if (!/\.md$/i.test(name)) return 'El archivo debe tener extensión .md.';
  if (content.includes('\0')) return 'El contenido contiene caracteres nulos no admitidos.';
  if (new TextEncoder().encode(content).length > MAX_DOCUMENT_BYTES) return 'El documento supera el límite de 2 MB.';
  return null;
}

export function errorMessage(error: unknown): string {
  const value = error as { code?: string; message?: string } | null;
  if (value?.code === 'PT409') return 'Hay una versión más reciente. Descarga tu borrador y recarga el documento antes de guardar.';
  if (value?.code === '23505') return 'Ya existe un documento con ese nombre en tu biblioteca.';
  if (value?.code === '42P01' || value?.code === 'PGRST202' || value?.code === 'PGRST205') return 'Falta configurar la base de datos. Ejecuta el SQL indicado en la guía de Supabase.';
  if (value?.code === 'PT403' || value?.code === '42501') return 'No tienes acceso a este documento. Comprueba tu sesión.';
  return value?.message || 'No se pudo completar la operación. Comprueba tu conexión e inténtalo de nuevo.';
}
