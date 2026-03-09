import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Manual .env parsing
const envContent = fs.readFileSync(path.resolve(process.cwd(), '.env'), 'utf8');
const env: Record<string, string> = {};
envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim();
    }
});

const supabaseUrl = env.PUBLIC_SUPABASE_URL;
const supabaseKey = env.PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAll() {
    console.log('--- Database Check ---');
    const { count: prodCount, error: prodErr } = await supabase.from('products').select('*', { count: 'exact', head: true });
    console.log(`Total Products: ${prodCount} (Error: ${prodErr?.message || 'none'})`);

    const { count: imgCount, error: imgErr } = await supabase.from('product_images').select('*', { count: 'exact', head: true });
    console.log(`Total Product Images: ${imgCount} (Error: ${imgErr?.message || 'none'})`);

    console.log('\n--- Storage Check ---');
    const { data: buckets } = await supabase.storage.listBuckets();
    console.log('Buckets:', buckets?.map(b => ({ name: b.name, public: b.public })));

    if (buckets?.find(b => b.name === 'product-images')) {
        console.log('\nListing files in "product-images" root:');
        const { data: files, error: listErr } = await supabase.storage.from('product-images').list('', { limit: 10 });
        if (listErr) console.error('List Error:', listErr.message);
        else console.log('Files:', files?.map(f => f.name));
    }
}

checkAll();
