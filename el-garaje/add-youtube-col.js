import { Client } from 'pg';

// Supabase Postgres Connection String format:
// postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
const connectionString = 'postgresql://postgres.xfurxkqqyoaerisuizdm:OW8SlYkwOePA2mVu@aws-0-sa-east-1.pooler.supabase.com:6543/postgres';

async function updateSchema() {
    const client = new Client({
        connectionString,
    });

    try {
        await client.connect();
        console.log('Connected to Supabase PostgreSQL database.');

        // Add the youtube_url column if it doesn't already exist
        const addColumnQuery = `
      ALTER TABLE public.products 
      ADD COLUMN IF NOT EXISTS youtube_url TEXT;
    `;

        await client.query(addColumnQuery);
        console.log('Successfully added `youtube_url` column to `public.products` table.');

    } catch (err) {
        console.error('Error updating schema:', err);
    } finally {
        await client.end();
        console.log('Database connection closed.');
    }
}

updateSchema();
