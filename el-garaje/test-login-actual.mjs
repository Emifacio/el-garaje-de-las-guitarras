import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xfurxkqqyoaerisuizdm.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_FPq_OkOgtny-JqRnTzte0A_k5AEAcpK';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkLogin() {
    const { data, error } = await supabase.auth.signInWithPassword({
        email: 'lucianobelloto@hotmail.com',
        password: 'lpc',
    });

    if (error) {
        console.error('Login Error:', error.message);
    } else {
        console.log('Login Success! User is authenticated successfully.');
    }
}

checkLogin();
