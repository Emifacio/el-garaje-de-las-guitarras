import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkImages() {
    console.log('Checking product_images table...');
    const { data: images, error: imgError } = await supabase
        .from('product_images')
        .select('id, storage_path, product_id')
        .limit(5);

    if (imgError) {
        console.error('Error fetching images:', imgError);
    } else {
        console.log(`Found ${images.length} images (sample):`, images);
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
