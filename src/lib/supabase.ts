import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://unjgllyuuvgcyezkcrpt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuamdsbHl1dXZnY3llemtjcnB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3NzM3MjksImV4cCI6MjA3ODM0OTcyOX0.qCObMG6uW4wvMMyjbItCEvx4lO2VdRwbeaz6HjszRr8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
