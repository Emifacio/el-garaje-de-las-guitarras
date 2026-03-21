export const prerender = false;
import type { APIRoute } from 'astro';
import { createSupabaseServerClient } from '../../../../lib/supabase-server';
import { requireAdmin } from '../../../../services/auth/requireAdmin';

const BUCKET_NAME = 'product-images';

export const POST: APIRoute = async ({ cookies, request }) => {
    // 1. Authenticate Admin
    const supabase = createSupabaseServerClient(cookies, request, { admin: true });
    const authResult = await requireAdmin(supabase);
    
    if (!authResult.success) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    try {
        // 2. Parse Multipart Data
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const productId = formData.get('productId') as string || 'temp';

        if (!file || !(file instanceof File)) {
            return new Response(JSON.stringify({ error: 'No file provided' }), { status: 400 });
        }

        // 3. Generate storage path
        const fileExt = file.name.split('.').pop()?.toLowerCase() || 'webp';
        const fileName = `${productId}/${crypto.randomUUID()}.${fileExt}`;

        // 4. Upload to Supabase Storage
        const { data, error: uploadError } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(fileName, file, {
                contentType: file.type,
                cacheControl: '3600',
                upsert: false
            });

        if (uploadError) {
            console.error('[API Upload] Supabase Error:', uploadError);
            return new Response(JSON.stringify({ error: uploadError.message }), { status: 500 });
        }

        // 5. Return the storage path (the relative path in the bucket)
        return new Response(JSON.stringify({ 
            success: true, 
            storagePath: data.path 
        }), { 
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (err: any) {
        console.error('[API Upload] Unexpected error:', err);
        return new Response(JSON.stringify({ error: err.message || 'Internal Server Error' }), { status: 500 });
    }
};
