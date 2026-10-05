import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const key = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY)?.trim();

// Missing configuration is a setup screen, not a crash or a public fallback.
function configuredClient() {
  if (!url || !key) return null;
  try {
    const parsed = new URL(url);
    if (!['https:', 'http:'].includes(parsed.protocol)) return null;
    // Never accept a privileged key as browser configuration.
    if (key.startsWith('sb_secret_')) return null;
    if (key.split('.').length === 3) {
      const payload = JSON.parse(atob(key.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      if (payload.role === 'service_role') return null;
    }
    return createClient(url, key);
  } catch { return null; }
}

export const supabase = configuredClient();
