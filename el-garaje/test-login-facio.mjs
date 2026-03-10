import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xfurxkqqyoaerisuizdm.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_FPq_OkOgtny-JqRnTzte0A_k5AEAcpK';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkLogin() {
    const email = 'facio.gabrielemiliano@gmail.com';
    const password = 'lpc';

    console.log(`Testing login for ${email}...`);

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        console.error('Login Error:', error.message, error.name, error.status);

        // Check if the user exists at all by trying to sign up
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password: 'some_long_password_12345!',
        });

        if (signUpError) {
            console.log('SignUp test error:', signUpError.message);
        } else {
            if (signUpData.user && signUpData.user.identities && signUpData.user.identities.length === 0) {
                console.log('USER EXISTS in the system (empty identities). The password might be wrong or email is unconfirmed.');
            } else {
                console.log('USER DID NOT EXIST. An account was just created for testing (oops, but good to know).');
            }
        }
    } else {
        console.log('Login Success! User is authenticated successfully.');
        console.log('User ID:', data.user.id);
    }
}

checkLogin();
