import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xfurxkqqyoaerisuizdm.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_FPq_OkOgtny-JqRnTzte0A_k5AEAcpK';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkUser() {
    const { data, error } = await supabase.auth.signUp({
        email: 'lucianobelloto@hotmail.com',
        password: 'some_long_password_12345!',
    });

    if (error) {
        console.error('SignUp Error (Checking existence):', error.message, error.name, error.status);
    } else {
        console.log('SignUp Success (Wait, if it succeeded, user did not exist before?)');
    }
}

checkUser();
