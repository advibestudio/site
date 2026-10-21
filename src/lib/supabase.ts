import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * SUPABASE CONNECTION
 * -------------------
 * The two values below come from the file `.env` (on your computer) or from
 * GitHub "Secrets" (when GitHub builds the site). See README.md, Part 4.
 *
 * - If BOTH are filled in  -> the site runs in LIVE mode (real database, real login).
 * - If either is empty     -> the site runs in DEMO mode (data stays in this browser only).
 *
 * The "anon" key is designed to be public — it is safe in a website. What
 * protects your data is the Row Level Security rules in supabase/schema.sql.
 * NEVER put the "service_role" key anywhere in this project.
 */
const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
const key = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim();

export const isLive = Boolean(url && key);

export const supabase: SupabaseClient | null = isLive
  ? createClient(url!, key!, { auth: { persistSession: true, autoRefreshToken: true } })
  : null;
