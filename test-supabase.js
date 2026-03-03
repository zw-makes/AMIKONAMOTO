import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ptueakygbjohifkscplk.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0dWVha3lnYmpvaGlma3NjcGxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NDQ0NjgsImV4cCI6MjA4ODEyMDQ2OH0.6x5_QVjhP6wYXVTBEpQ-eil2U5w0A0Qd0gncxrD53Zk'

const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
    console.log('Testing Supabase connection...')
    try {
        const { data, error } = await supabase.from('subscriptions').select('*').limit(1)
        if (error) {
            console.error('Supabase Error:', error.message)
        } else {
            console.log('Connection Successful! Data:', data)
        }
    } catch (err) {
        console.error('Fetch Error:', err.message)
    }
}

test()
