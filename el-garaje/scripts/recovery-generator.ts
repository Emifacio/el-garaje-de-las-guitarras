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

async function recoverImages() {
    console.log('--- Image Recovery Script ---');

    // 1. Get all products to verify valid folders
    const { data: products } = await supabase.from('products').select('id, title');
    const productMap = new Map(products?.map(p => [p.id, p.title]));

    console.log(`Checking storage for ${products?.length || 0} products...`);

    // 2. List root of bucket
    const { data: items, error: listErr } = await supabase.storage.from('product-images').list('', { limit: 100 });
    if (listErr) {
        console.error('List Error:', listErr.message);
        return;
    }

    const recoveryEntries = [];

    for (const item of items || []) {
        // Check if item name is a product ID we know
        if (productMap.has(item.name)) {
            console.log(`\nFound folder for product: ${productMap.get(item.name)} (${item.name})`);

            // List files inside
            const { data: files } = await supabase.storage.from('product-images').list(item.name);

            if (files && files.length > 0) {
                console.log(`  Found ${files.length} images.`);
                files.forEach((file, index) => {
                    if (file.name !== '.emptyFolderPlaceholder') {
                        recoveryEntries.push({
                            product_id: item.name,
                            storage_path: `${item.name}/${file.name}`,
                            sort_order: index * 10
                        });
                    }
                });
            }
        }
    }

    if (recoveryEntries.length > 0) {
        console.log(`\n--- Summary ---`);
        console.log(`Proposed to restore ${recoveryEntries.length} image links.`);
        console.log(`Sample:`, recoveryEntries[0]);

        console.log(`\nWAIT! You (the assistant) cannot modify the DB with the anon key via script easily without a session.`);
        console.log(`I will provide a SQL script for the user to run in the Supabase SQL Editor if needed.`);

        let sql = `-- Recovery Script for Product Images\n`;
        sql += `INSERT INTO public.product_images (product_id, storage_path, sort_order)\nVALUES\n`;
        sql += recoveryEntries.map(e => `('${e.product_id}', '${e.storage_path}', ${e.sort_order})`).join(',\n');
        sql += `\nON CONFLICT DO NOTHING;`;

        fs.writeFileSync('recovery-queries.sql', sql);
        console.log(`\nSQL Recovery script written to recovery-queries.sql`);
    } else {
        console.log('No orphaned images found matching current product IDs.');
    }
}

recoverImages();
