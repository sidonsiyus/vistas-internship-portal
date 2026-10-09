import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://apjwptavagbrxwsxoxei.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwandwdGF2YWdicnh3c3hveGVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3NjEzNTYsImV4cCI6MjEwNDMzNzM1Nn0.ClSSVPhpfu4VVzpY5SU3pigNLou_58F25fRCZLk64Qk';

// Primary Account (Database & Realtime)
const savedPrimaryUrl = typeof window !== 'undefined' ? localStorage.getItem('vistas_supabase_url') : null;
const savedPrimaryAnon = typeof window !== 'undefined' ? localStorage.getItem('vistas_supabase_anon_key') : null;

export const supabaseUrl = savedPrimaryUrl || import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
export const supabaseAnonKey = savedPrimaryAnon || import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

// Secondary / Storage Account (Secondary Failover / File Storage)
const savedSecondaryUrl = typeof window !== 'undefined' ? localStorage.getItem('vistas_supabase_secondary_url') : null;
const savedSecondaryAnon = typeof window !== 'undefined' ? localStorage.getItem('vistas_supabase_secondary_anon_key') : null;

export const secondarySupabaseUrl = savedSecondaryUrl || import.meta.env.VITE_SUPABASE_SECONDARY_URL || '';
export const secondarySupabaseAnonKey = savedSecondaryAnon || import.meta.env.VITE_SUPABASE_SECONDARY_ANON_KEY || '';

export const isSupabaseConfigured = () => {
  return Boolean(
    supabaseUrl && 
    supabaseAnonKey &&
    !supabaseUrl.includes('your-project-id') &&
    !supabaseUrl.includes('placeholder')
  );
};

export const isSecondarySupabaseConfigured = () => {
  return Boolean(
    secondarySupabaseUrl &&
    secondarySupabaseAnonKey &&
    !secondarySupabaseUrl.includes('your-project-id') &&
    !secondarySupabaseUrl.includes('placeholder')
  );
};

// Primary Supabase Client (handles Appointments, Queue, Announcements, Live Realtime)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Secondary Supabase Client (handles Dedicated Storage / Failover if configured, else defaults to Primary)
export const secondarySupabase = isSecondarySupabaseConfigured()
  ? createClient(secondarySupabaseUrl, secondarySupabaseAnonKey)
  : supabase;

/**
 * Returns the client designated for storage/file operations.
 * If a secondary Supabase project is provided, uploads go there to keep the primary egress free.
 */
export const getStorageClient = () => {
  return isSecondarySupabaseConfigured() ? secondarySupabase : supabase;
};

