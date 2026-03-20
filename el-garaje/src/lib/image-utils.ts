import { supabase } from '../infrastructure/supabase/client';

export function getPublicImageUrl(path: string | undefined): string {
    if (!path) return '';
    const { data } = supabase.storage.from('product-images').getPublicUrl(path);
    return data.publicUrl;
}
