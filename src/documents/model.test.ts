import { describe, expect, it } from 'vitest';
import { errorMessage, MAX_DOCUMENT_BYTES, normalizeName, validateDocument } from './model';
import { readMarkdownFiles } from './files';

describe('Markdown portable', () => {
  it('normaliza la extensión sin alterar nombres válidos', () => {
    expect(normalizeName('  Informe  ')).toBe('Informe.md');
    expect(normalizeName('INFORME.MD')).toBe('INFORME.MD');
  });
  it('rechaza rutas, nombres vacíos y caracteres de control', () => {
    for (const name of ['.md', '../file.md', 'a\\b.md', 'file\n.md', 'x.txt']) {
      expect(validateDocument(name, '')).not.toBeNull();
    }
    expect(validateDocument('Referencia técnica.md', '# Título\r\n\r\nTexto')).toBeNull();
  });
  it('mide el límite en bytes UTF-8', () => {
    expect(validateDocument('a.md', 'x'.repeat(MAX_DOCUMENT_BYTES))).toBeNull();
    expect(validateDocument('a.md', 'á'.repeat(MAX_DOCUMENT_BYTES / 2 + 1))).not.toBeNull();
  });
  it('preserva BOM, CRLF y contenido Unicode al importar', async () => {
    const content = '\ufeff# Título\r\n\r\nCódigo: `ñ`\r\n';
    const result = await readMarkdownFiles([new File([content], 'original.md')]);
    expect(result).toEqual([{ name: 'original.md', content }]);
  });
  it('rechaza UTF-8 inválido antes de enviar datos', async () => {
    await expect(readMarkdownFiles([new File([new Uint8Array([0xff])], 'bad.md')])).rejects.toThrow('UTF-8');
  });
  it('rechaza más de 50 archivos por importación', async () => {
    await expect(readMarkdownFiles(Array.from({ length: 51 }, () => new File([''], 'a.md')))).rejects.toThrow('50');
  });
  it('explica conflictos y nombres duplicados', () => {
    expect(errorMessage({ code: 'PT409' })).toContain('más reciente');
    expect(errorMessage({ code: '23505' })).toContain('nombre');
  });
});
