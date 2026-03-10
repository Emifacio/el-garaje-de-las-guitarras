import { Client } from 'pg';

// For supabase direct connection, it might be better to connect direct to the db rather than the pooler
// Pooler format (usually port 6543): postgresql://[user].[project]:[password]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
// Direct format (usually port 5432): postgresql://postgres:[password]@db.xfurxkqqyoaerisuizdm.supabase.co:5432/postgres

const connectionString = 'postgresql://postgres:OW8SlYkwOePA2mVu@db.xfurxkqqyoaerisuizdm.supabase.co:5432/postgres';

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
