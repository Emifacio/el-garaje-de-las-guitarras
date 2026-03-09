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

async function scanStorage() {
    console.log('--- Direct Storage Scan ---');
    console.log('Listing folders in "product-images" bucket...');

    const { data: folders, error: listErr } = await supabase.storage
        .from('product-images')
        .list('', { limit: 100 });

    if (listErr) {
        console.error('List Error:', listErr.message);
        return;
    }

    if (!folders || folders.length === 0) {
        console.log('No folders/files found in repo root of "product-images".');
        return;
    }

    console.log(`Found ${folders.length} items in root.`);

    for (const item of folders) {
        if (item.id === undefined) { // It's a folder in Supabase list if id is undefined or it has no metadata
            console.log(`\nFolder: ${item.name}`);
            const { data: subFiles } = await supabase.storage.from('product-images').list(item.name, { limit: 5 });
            console.log(`  Sample files:`, subFiles?.map(f => f.name));
        } else {
            console.log(`File: ${item.name}`);
        }
    }
}

scanStorage();
