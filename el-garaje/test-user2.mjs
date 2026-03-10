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
        console.error('SignUp Error:', error.message);
    } else {
        console.log('SignUp Data:', JSON.stringify(data, null, 2));
        if (data.user && data.user.identities && data.user.identities.length === 0) {
            console.log('USER ALREADY EXISTS. (Empty identities means email already in use)');
        }
    }
}

checkUser();
