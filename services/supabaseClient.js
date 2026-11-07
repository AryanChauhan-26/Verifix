import { createClient } from '@supabase/supabase-js';

// Retrieve credentials from environment variables (never hardcoded)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-project')
);

// If configured, initialize Supabase client; otherwise provide safe fallback object
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

console.info(
  `[Verifix Core] Supabase backend: ${isSupabaseConfigured ? 'CONNECTED' : 'RUNNING LOCAL MOCK STORAGE'}`
);
