import { Client } from 'pg';

// For supabase pooler connection
// Pooler format (usually port 6543): postgresql://[user].[project]:[password]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres

// The project id is xfurxkqqyoaerisuizdm
const connectionString = 'postgresql://postgres.xfurxkqqyoaerisuizdm:OW8SlYkwOePA2mVu@aws-0-sa-east-1.pooler.supabase.com:5432/postgres';

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

        -- Create a test table to verify we have permissions
        CREATE TABLE IF NOT EXISTS public._test_conn (id integer);
        DROP TABLE public._test_conn;
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
