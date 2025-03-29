
import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// Check for environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.');
}

// Create Supabase client with mock values for development if environment variables are missing
// This allows the app to at least load instead of crashing immediately
export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder-supabase-url.com',
  supabaseAnonKey || 'placeholder-anon-key'
);

// Helper types for Supabase tables
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Workspace = Database['public']['Tables']['workspaces']['Row'];
export type Slot = Database['public']['Tables']['slots']['Row'];
export type Booking = Database['public']['Tables']['bookings']['Row'];

// Mock flag to let components know if they should try to make real API calls
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
