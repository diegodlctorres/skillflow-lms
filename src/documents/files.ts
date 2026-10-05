import { MAX_IMPORT_FILES, validateDocument } from './model';

export async function readMarkdownFiles(files: File[]): Promise<{ name: string; content: string }[]> {
  if (files.length > MAX_IMPORT_FILES) throw new Error(`Importa hasta ${MAX_IMPORT_FILES} archivos por vez.`);
  const documents = [];
  for (const file of files) {
    if (file.size > 2 * 1024 * 1024) throw new Error(`${file.name}: el documento supera 2 MB.`);
    const bytes = await file.arrayBuffer();
    let content: string;
    try { content = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes); }
    catch { throw new Error(`${file.name}: guarda el archivo como UTF-8 antes de importarlo.`); }
    const error = validateDocument(file.name, content);
    if (error) throw new Error(`${file.name}: ${error}`);
    documents.push({ name: file.name, content });
  }
  return documents;
}

export function downloadMarkdown(name: string, content: string): void {
  const url = URL.createObjectURL(new Blob([content], { type: 'text/markdown;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function copyMarkdown(content: string): Promise<void> {
  try { await navigator.clipboard.writeText(content); return; }
  catch {
    const input = document.createElement('textarea');
    const focused = document.activeElement as HTMLElement | null;
    input.value = content;
    input.style.cssText = 'position:fixed;opacity:0;left:0;top:0';
    document.body.appendChild(input);
    input.select();
    const success = document.execCommand('copy');
    input.remove();
    focused?.focus();
    if (!success) throw new Error('El navegador bloqueó la copia. Selecciona el texto o descarga el archivo.');
  }
}
