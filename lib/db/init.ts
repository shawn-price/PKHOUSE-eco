import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function initializeDatabase() {
  try {
    console.log('Initializing database...');

    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    const client = await pool.connect();
    try {
      // Execute the schema
      await client.query(schema);
      console.log('Database schema created successfully!');
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run if this is the main module
if (require.main === module) {
  initializeDatabase().catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });
}

export { initializeDatabase };
