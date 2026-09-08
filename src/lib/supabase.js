import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://apjwptavagbrxwsxoxei.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwandwdGF2YWdicnh3c3hveGVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3NjEzNTYsImV4cCI6MjEwNDMzNzM1Nn0.ClSSVPhpfu4VVzpY5SU3pigNLou_58F25fRCZLk64Qk';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = () => {
  return Boolean(
    supabaseUrl && 
    supabaseAnonKey &&
    !supabaseUrl.includes('your-project-id') &&
    !supabaseUrl.includes('placeholder')
  );
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

