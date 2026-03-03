import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ptueakygbjohifkscplk.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0dWVha3lnYmpvaGlma3NjcGxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NDQ0NjgsImV4cCI6MjA4ODEyMDQ2OH0.6x5_QVjhP6wYXVTBEpQ-eil2U5w0A0Qd0gncxrD53Zk'
export const supabase = createClient(supabaseUrl, supabaseKey)
