import { supabase } from '../../infrastructure/supabase/client';

export interface InteractionLogInput {
    product_id: string | null;
    interaction_type: string;
    metadata: Record<string, any>;
}

export async function logInteraction(input: InteractionLogInput): Promise<void> {
    const { error } = await supabase
        .from('interaction_logs')
        .insert({
            product_id: input.product_id,
            interaction_type: input.interaction_type,
            metadata: input.metadata
        });

    if (error) {
        throw new Error(`Failed to log interaction: ${error.message}`);
    }
}
