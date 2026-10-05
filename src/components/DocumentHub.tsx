import { useDeferredValue, useEffect, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import type { Session } from '@supabase/supabase-js';
import { Copy, Download, FileText, FolderOpen, History, LogOut, Menu, Pencil, Plus, RefreshCw, Save, Search, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../infrastructure/supabase';
import type { DocumentVersion, MarkdownDocument } from '../documents/model';
import { errorMessage, normalizeName, validateDocument } from '../documents/model';
import { createDocument, importDocuments, listDocuments, saveDocument } from '../documents/repository';
import { copyMarkdown, downloadMarkdown, readMarkdownFiles } from '../documents/files';
import { HistoryPanel } from './HistoryPanel';

export function DocumentHub({ session }: { session: Session }) {
  const [documents, setDocuments] = useState<MarkdownDocument[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query).toLocaleLowerCase();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [base, setBase] = useState<MarkdownDocument | null>(null);
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const selected = documents.find(document => document.id === selectedId);
  const dirty = editing && (!base || name !== base.name || content !== base.content);
  const displayedName = editing ? normalizeName(name) : selected?.name || '';
  const displayedContent = editing ? content : selected?.content || '';
  const filtered = documents.filter(document => document.name.toLocaleLowerCase().includes(deferredQuery) || document.content.toLocaleLowerCase().includes(deferredQuery));

  useEffect(() => {
    let active = true;
    void listDocuments().then(data => {
      if (active) { setDocuments(data); setSelectedId(data[0]?.id || ''); }
    }).catch(reason => { if (active) setError(errorMessage(reason)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!dirty) return;
    const preventLoss = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', preventLoss);
    return () => window.removeEventListener('beforeunload', preventLoss);
  }, [dirty]);

  function mayDiscard() {
    return !dirty || window.confirm('Hay cambios sin guardar. ¿Descartarlos? Puedes cancelar y descargar el borrador primero.');
  }

  function selectDocument(document: MarkdownDocument) {
    if (busy || !mayDiscard()) return;
    setSelectedId(document.id); setEditing(false); setHistoryOpen(false); setError(''); setSidebarOpen(false);
  }

  function newDocument() {
    if (!mayDiscard()) return;
    setBase(null); setName(''); setContent(''); setEditing(true); setHistoryOpen(false); setError(''); setSidebarOpen(false);
  }

  async function refresh() {
    if (!mayDiscard()) return;
    setBusy(true); setError('');
    try {
      const data = await listDocuments();
      setDocuments(data); setSelectedId(data.find(document => document.id === selectedId)?.id || data[0]?.id || '');
      setEditing(false); setHistoryOpen(false);
    } catch (reason) { setError(errorMessage(reason)); }
    finally { setBusy(false); }
  }

  function acceptSaved(document: MarkdownDocument) {
    setDocuments(current => [...current.filter(item => item.id !== document.id), document].sort((a, b) => a.name.localeCompare(b.name)));
    setSelectedId(document.id); setEditing(false); setHistoryOpen(false); setBase(null); setQuery('');
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    const finalName = normalizeName(name);
    const validation = validateDocument(finalName, content);
    if (validation) { setError(validation); return; }
    setBusy(true); setError('');
    try {
      const document = base ? await saveDocument(base, finalName, content) : await createDocument(finalName, content);
      acceptSaved(document); toast.success('Documento guardado en Supabase');
    } catch (reason) { setError(errorMessage(reason)); }
    finally { setBusy(false); }
  }

  async function restore(version: DocumentVersion) {
    if (!selected) return;
    setBusy(true); setError('');
    try {
      acceptSaved(await saveDocument(selected, version.name, version.content));
      toast.success('Versión restaurada');
    } catch (reason) { setError(errorMessage(reason)); }
    finally { setBusy(false); }
  }

  async function importFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (!files.length) return;
    setBusy(true); setError('');
    try {
      const input = await readMarkdownFiles(files);
      const result = await importDocuments(input);
      toast.success(`${result.imported} importados; ${result.skipped} omitidos por nombre existente.`);
      const data = await listDocuments();
      setDocuments(data); setSelectedId(current => current || data[0]?.id || ''); setQuery('');
    } catch (reason) { setError(errorMessage(reason)); }
    finally { setBusy(false); }
  }

  async function logout() {
    if (!supabase || !mayDiscard()) return;
    setBusy(true); setError('');
    try { const { error } = await supabase.auth.signOut({ scope: 'local' }); if (error) throw error; }
    catch (reason) { setError(errorMessage(reason)); }
    finally { setBusy(false); }
  }

  return <div className="min-h-screen bg-[#f4f6f8] selection:bg-cyan-100">
    <header className="bg-[#101923] text-white">
      <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-3 px-5 py-5 lg:px-10">
        <div className="flex items-center gap-3">
          <FolderOpen className="shrink-0 text-cyan-300" size={27} />
          <div><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-300">SkillFlow / Markdown</p>
            <h1 className="text-lg font-semibold">Biblioteca de documentos</h1></div>
        </div>
        <div className="flex min-w-0 items-center gap-3">
          <span className="max-w-48 truncate text-xs text-slate-400" title={session.user.email}>{session.user.email}</span>
          <button className="rounded-lg p-2 hover:bg-white/10" onClick={() => void logout()} disabled={busy} aria-label="Cerrar sesión"><LogOut size={19} /></button>
          <button className="rounded-lg p-2 hover:bg-white/10 lg:hidden" onClick={() => setSidebarOpen(true)} aria-label="Abrir biblioteca"><Menu size={21} /></button>
        </div>
      </div>
    </header>

    <div className="mx-auto flex max-w-[1500px] gap-8 px-5 lg:px-10">
      {sidebarOpen && <button className="fixed inset-0 z-30 bg-slate-950/50 lg:hidden" aria-label="Cerrar menú" onClick={() => setSidebarOpen(false)} />}
      <aside className={`${sidebarOpen ? 'visible translate-x-0' : 'invisible -translate-x-full'} fixed inset-y-0 left-0 z-40 w-[290px] overflow-y-auto border-r bg-white p-5 transition-transform lg:static lg:z-0 lg:visible lg:shrink-0 lg:translate-x-0 lg:border-0 lg:bg-transparent lg:px-0 lg:py-8`}>
        <div className="mb-5 flex items-center justify-between"><h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">Biblioteca · {documents.length}</h2>
          <button className="p-2 lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="Cerrar biblioteca"><X size={18} /></button></div>
        <label className="relative mb-5 block"><Search className="absolute left-3 top-3 text-slate-400" size={16} />
          <input className="field pl-9" aria-label="Buscar documentos" placeholder="Buscar nombre o contenido…" value={query} onChange={e => setQuery(e.target.value)} /></label>
        <div className="mb-4 grid grid-cols-2 gap-2">
          <button className="btn-primary" disabled={busy || loading} onClick={newDocument}><Plus size={15} />Nuevo</button>
          <button className="btn" disabled={busy || loading || editing} onClick={() => fileInput.current?.click()}><Upload size={15} />Importar .md</button>
          <input ref={fileInput} type="file" accept=".md,text/markdown" multiple hidden aria-label="Archivos Markdown para importar" onChange={event => void importFiles(event)} />
        </div>
        <p className="mb-4 text-xs leading-5 text-slate-500">Importar conserva el texto original y omite nombres existentes.</p>
        <nav aria-label="Documentos" className="space-y-1">
          {filtered.map(document => <button key={document.id} onClick={() => selectDocument(document)} disabled={busy}
            aria-current={!editing && selectedId === document.id ? 'page' : undefined}
            className={`flex w-full items-start gap-2 rounded-lg p-3 text-left text-[13px] ${!editing && selectedId === document.id ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-white'}`}>
            <FileText size={16} className="mt-0.5 shrink-0" /><span className="min-w-0 break-all">{document.name}</span>
          </button>)}
          {!loading && !filtered.length && <p className="p-3 text-sm text-slate-500">{documents.length ? 'Sin resultados.' : 'Tu biblioteca está vacía.'}</p>}
        </nav>
      </aside>

      <main className="min-w-0 flex-1 py-8 pb-16">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-medium text-cyan-700">Privada · Guardada en Supabase</span>
          <button className="btn" disabled={busy || loading} onClick={() => void refresh()}><RefreshCw size={15} />{busy ? 'Procesando…' : 'Actualizar biblioteca'}</button>
        </div>
        {error && <div role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>}
        {loading ? <p role="status" className="py-12 text-slate-500">Cargando documentos…</p>
          : !editing && !selected ? <section className="rounded-xl border border-dashed border-slate-300 bg-white p-8">
            <FolderOpen size={30} className="mb-4 text-cyan-700" /><h2 className="text-xl font-semibold">Empieza tu biblioteca</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">Importa tus archivos .md o crea tu primer documento. Luego podrás consultarlos y actualizarlos desde cualquier dispositivo.</p>
            <div className="mt-6 flex flex-wrap gap-3"><button className="btn-primary" disabled={busy} onClick={newDocument}><Plus size={16} />Crear documento</button>
              <button className="btn" disabled={busy} onClick={() => fileInput.current?.click()}><Upload size={16} />Importar archivos</button></div>
          </section>
          : <>
            <div className="mb-6 border-b border-slate-200 pb-6">
              <h2 className="break-words text-2xl font-semibold">{editing ? base ? 'Editar documento' : 'Nuevo documento' : selected?.name}</h2>
              <p className="mt-2 text-sm text-slate-500">{editing ? 'Guarda para sincronizar. El borrador todavía no está en la nube.'
                : `Versión ${selected?.revision} · Actualizado ${new Date(selected!.updated_at).toLocaleString('es-PE')}`}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <button className="btn" onClick={() => void copyMarkdown(displayedContent).then(() => toast.success('Markdown original copiado')).catch(reason => toast.error(errorMessage(reason)))}><Copy size={15} />Copiar Markdown</button>
                <button className="btn" onClick={() => downloadMarkdown(displayedName === '.md' ? 'borrador.md' : displayedName, displayedContent)}><Download size={15} />{editing ? 'Descargar borrador' : 'Descargar .md'}</button>
                {!editing && <>
                  <button className="btn" disabled={busy} onClick={() => { setBase(selected!); setName(selected!.name); setContent(selected!.content); setEditing(true); setHistoryOpen(false); setError(''); }}><Pencil size={15} />Editar</button>
                  <button className="btn" disabled={busy} aria-expanded={historyOpen} onClick={() => setHistoryOpen(open => !open)}><History size={15} />Historial</button>
                </>}
              </div>
            </div>
            {editing ? <form onSubmit={event => void save(event)} className="space-y-4">
              <div><label htmlFor="document-name" className="mb-1 block text-sm font-medium">Nombre del archivo</label>
                <input id="document-name" className="field" value={name} maxLength={180} required placeholder="mi-documento.md" disabled={busy} onChange={e => setName(e.target.value)} />
                <p className="mt-1 text-xs text-slate-500">Se añade .md si no escribes la extensión.</p></div>
              <div><label htmlFor="document-content" className="mb-1 block text-sm font-medium">Contenido Markdown</label>
                <textarea id="document-content" className="field min-h-[420px] font-mono text-[13px] leading-6" value={content} disabled={busy} spellCheck={false} onChange={e => setContent(e.target.value)} /></div>
              <div className="flex flex-wrap items-center gap-3">
                <button type="submit" className="btn-primary" disabled={busy || !dirty}><Save size={16} />{busy ? 'Guardando…' : 'Guardar documento'}</button>
                <button type="button" className="btn" disabled={busy} onClick={() => { if (mayDiscard()) { setEditing(false); setError(''); } }}>Cancelar</button>
                <span className="text-xs text-slate-500">{dirty ? 'Cambios sin guardar' : 'Sin cambios'} · {Math.ceil(new TextEncoder().encode(content).length / 1024)} KB / 2048 KB</span>
              </div>
            </form> : <>
              <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b bg-slate-50 px-5 py-3 text-xs font-medium text-slate-500">Contenido original · Markdown</div>
                <pre className="max-h-[calc(100vh-340px)] min-h-48 overflow-auto whitespace-pre-wrap break-words p-5 font-mono text-[13px] leading-6 text-slate-700 sm:p-8">{selected!.content}</pre>
              </article>
              {historyOpen && <HistoryPanel key={`${selected!.id}:${selected!.revision}`} document={selected!} busy={busy} onRestore={restore} />}
            </>}
          </>}
      </main>
    </div>
  </div>;
}
