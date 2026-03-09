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

async function testUpload() {
    console.log('--- Testing Storage Upload ---');
    const dummyContent = 'test file content ' + new Date().toISOString();
    const fileName = 'test-upload-' + Date.now() + '.txt';

    console.log(`Attempting to upload ${fileName} to "product-images" bucket...`);

    const { data, error } = await supabase.storage
        .from('product-images')
        .upload(fileName, Buffer.from(dummyContent), {
            contentType: 'text/plain'
        });

    if (error) {
        console.error('Upload Failed:', error.message);
        console.log('Error Details:', error);
    } else {
        console.log('Upload Success!', data);

        console.log('Testing retrieval...');
        const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(fileName);
        console.log('Public URL:', publicUrl);

        // Clean up
        await supabase.storage.from('product-images').remove([fileName]);
        console.log('Cleanup: Test file removed.');
    }
}

testUpload();
