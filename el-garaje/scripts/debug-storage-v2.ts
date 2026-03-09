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

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkImages() {
    console.log('Checking product_images table...');
    const { data: images, error: imgError } = await supabase
        .from('product_images')
        .select('id, storage_path, product_id')
        .limit(3);

    if (imgError) {
        console.error('Error fetching images:', imgError);
    } else {
        console.log(`Found ${images?.length || 0} images (sample):`, images);

        if (images && images.length > 0) {
            const testPath = images[0].storage_path;
            console.log(`\nTesting public URL for: ${testPath}`);
            const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(testPath);
            console.log(`Public URL: ${publicUrl}`);
        }
    }

    console.log('\nChecking buckets...');
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    if (bucketError) {
        console.error('Error fetching buckets:', bucketError);
    } else {
        console.log('Buckets:', buckets.map(b => ({ name: b.name, public: b.public })));
    }
}

checkImages();
