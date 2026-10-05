import { useEffect, useState } from 'react';
import { History, RotateCcw } from 'lucide-react';
import type { DocumentVersion, MarkdownDocument } from '../documents/model';
import { errorMessage } from '../documents/model';
import { getVersion, listVersions } from '../documents/repository';
import { downloadMarkdown } from '../documents/files';

export function HistoryPanel({ document, busy, onRestore }: {
  document: MarkdownDocument;
  busy: boolean;
  onRestore: (version: DocumentVersion) => Promise<void>;
}) {
  const [versions, setVersions] = useState<Omit<DocumentVersion, 'content'>[]>([]);
  const [selected, setSelected] = useState<DocumentVersion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState('');

  useEffect(() => {
    let active = true;
    void listVersions(document.id).then(data => { if (active) setVersions(data); })
      .catch(reason => { if (active) setError(errorMessage(reason)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [document.id]);

  useEffect(() => {
    if (!selectedId) return;
    let active = true;
    setSelected(null); setLoading(true); setError('');
    void getVersion(selectedId).then(data => { if (active) setSelected(data); })
      .catch(reason => { if (active) setError(errorMessage(reason)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [selectedId]);

  return <section aria-label="Historial de versiones" className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
    <h3 className="flex items-center gap-2 font-semibold"><History size={18} />Historial de versiones</h3>
    <p className="mt-2 text-xs text-slate-500">Se conservan las últimas 20 versiones. Restaurar crea una nueva versión.</p>
    {error && <p className="mt-3 text-sm text-red-700" role="alert">{error}</p>}
    <label htmlFor="version" className="mt-4 block text-sm font-medium">Versión</label>
    <select id="version" className="field mt-1" value={selectedId} onChange={e => setSelectedId(e.target.value)} disabled={busy}>
      <option value="">Seleccionar versión…</option>
      {versions.map(version => <option key={version.id} value={version.id}>
        v{version.revision} · {new Date(version.created_at).toLocaleString('es-PE')} · {version.name}
      </option>)}
    </select>
    {loading && <p role="status" className="mt-3 text-sm text-slate-500">Cargando historial…</p>}
    {selected && <>
      <div className="my-3 flex flex-wrap gap-2">
        <button className="btn" onClick={() => downloadMarkdown(selected.name, selected.content)}>Descargar esta versión</button>
        <button className="btn" disabled={busy || selected.revision === document.revision}
          onClick={() => { if (window.confirm(`¿Restaurar la versión ${selected.revision}? Se guardará como una versión nueva.`)) void onRestore(selected); }}>
          <RotateCcw size={14} />Restaurar versión
        </button>
      </div>
      <pre className="max-h-72 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-slate-50 p-4 font-mono text-xs leading-6">{selected.content}</pre>
    </>}
  </section>;
}
