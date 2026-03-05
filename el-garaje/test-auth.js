import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://xfurxkqqyoaerisuizdm.supabase.co',
    'sb_publishable_FPq_OkOgtny-JqRnTzte0A_k5AEAcpK'
);

async function testAuth() {
    const { data, error } = await supabase.auth.signInWithPassword({
        email: 'admin@elgaraje.com', // Replace with actual email
        password: 'OW8SlYkwOePA2mVu', // Replace with intended password
    });

    if (error) {
        console.error('Auth Error:', error.message);
    } else {
        console.log('Auth Success! Session token:', data.session.access_token.substring(0, 20) + '...');
    }
}

testAuth();
