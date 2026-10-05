import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { FolderOpen } from 'lucide-react';
import { Toaster } from 'sonner';
import { supabase } from './src/infrastructure/supabase';
import { AuthScreen } from './src/components/AuthScreen';
import { DocumentHub } from './src/components/DocumentHub';
import { errorMessage } from './src/documents/model';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(Boolean(supabase));
  const [error, setError] = useState('');

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    let receivedAuthEvent = false;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      receivedAuthEvent = true;
      if (active) { setSession(nextSession); setLoading(false); setError(''); }
    });
    void supabase.auth.getSession().then(({ data, error: authError }) => {
      if (!active || receivedAuthEvent) return;
      setSession(data.session);
      setError(authError ? errorMessage(authError) : '');
      setLoading(false);
    }).catch((reason) => {
      if (active) { setError(errorMessage(reason)); setLoading(false); }
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);

  if (!supabase) return (
    <div className="grid min-h-screen place-items-center p-6">
      <main className="w-full max-w-xl rounded-2xl border bg-white p-8 shadow-sm">
        <FolderOpen className="mb-6 text-cyan-700" size={32} />
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-cyan-700">SkillFlow / Markdown</p>
        <h1 className="text-2xl font-semibold">Conecta tu biblioteca</h1>
        <p className="mt-4 text-slate-600">Configura Supabase para consultar, crear y editar tus documentos desde cualquier dispositivo.</p>
        <ol className="mt-6 list-decimal space-y-3 pl-5 text-sm text-slate-600">
          <li>Crea un proyecto gratuito y ejecuta <code>supabase/migrations/001_document_library.sql</code>.</li>
          <li>Crea tu usuario en Authentication y desactiva los registros públicos.</li>
          <li>Define <code>VITE_SUPABASE_URL</code> y <code>VITE_SUPABASE_PUBLISHABLE_KEY</code> en <code>.env.local</code> o en Vercel.</li>
          <li>Reinicia la aplicación o vuelve a desplegarla.</li>
        </ol>
        <p className="mt-6 text-sm text-slate-500">La guía completa está en <code>docs/SUPABASE_SETUP.md</code>. Tus Markdown originales se conservan para importarlos al iniciar sesión.</p>
      </main>
    </div>
  );

  return <>
    {loading ? <p className="p-10 text-center" role="status">Comprobando sesión…</p>
      : session ? <DocumentHub key={session.user.id} session={session} />
      : <AuthScreen initialError={error} />}
    <Toaster position="top-center" richColors closeButton />
  </>;
}
