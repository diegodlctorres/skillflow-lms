import { useState } from 'react';
import type { FormEvent } from 'react';
import { FolderOpen, LogIn } from 'lucide-react';
import { supabase } from '../infrastructure/supabase';
import { errorMessage } from '../documents/model';

export function AuthScreen({ initialError }: { initialError: string }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(initialError);
  const [busy, setBusy] = useState(false);

  async function login(event: FormEvent) {
    event.preventDefault();
    if (!supabase) return;
    setBusy(true); setError('');
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
    } catch (reason) { setError(errorMessage(reason)); }
    finally { setBusy(false); }
  }

  return <div className="grid min-h-screen place-items-center bg-slate-100 p-5">
    <main className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="mb-7 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-cyan-300"><FolderOpen size={25} /></div>
      <p className="text-xs font-semibold uppercase tracking-widest text-cyan-700">SkillFlow / Markdown</p>
      <h1 className="mt-2 text-2xl font-semibold">Tu biblioteca, disponible</h1>
      <p className="mt-3 text-sm leading-6 text-slate-500">Consulta, copia y actualiza tus documentos desde cualquier dispositivo.</p>
      <form onSubmit={login} className="mt-7 space-y-4">
        <div><label htmlFor="email" className="mb-1 block text-sm font-medium">Correo</label>
          <input id="email" type="email" autoComplete="username" className="field" required value={email} onChange={e => setEmail(e.target.value)} disabled={busy} /></div>
        <div><label htmlFor="password" className="mb-1 block text-sm font-medium">Contraseña</label>
          <input id="password" type="password" autoComplete="current-password" className="field" required value={password} onChange={e => setPassword(e.target.value)} disabled={busy} /></div>
        {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <button type="submit" className="btn-primary w-full" disabled={busy}><LogIn size={16} />{busy ? 'Entrando…' : 'Iniciar sesión'}</button>
      </form>
      <p className="mt-6 text-xs leading-5 text-slate-500">Usa la cuenta creada por el administrador en Supabase. Si olvidaste tu contraseña, puedes cambiarla desde Authentication → Users.</p>
    </main>
  </div>;
}
