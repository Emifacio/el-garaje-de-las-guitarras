import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xfurxkqqyoaerisuizdm.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_FPq_OkOgtny-JqRnTzte0A_k5AEAcpK';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkLogin() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'lucianobelloto@hotmail.com',
    password: 'wrong_password_test',
  });
  
  if (error) {
    console.error('Login Error:', error.message, error.name, error.status);
  } else {
    console.log('Login Success (Wait, with a wrong password? That means no block?)');
  }
}

checkLogin();
