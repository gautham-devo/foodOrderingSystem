import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ahnbeuvntpxqocukfdte.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFobmJldXZudHB4cW9jdWtmZHRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4ODk0NjQsImV4cCI6MjA4ODQ2NTQ2NH0.PEyyxust6jl2kpoojIfF9u7Ucm8otIm2OKYkeKNhiKQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);