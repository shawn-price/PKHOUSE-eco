#!/usr/bin/env node

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function initializeDatabase() {
  try {
    console.log('[v0] Initializing database...');

    const schemaPath = path.join(__dirname, '..', 'lib', 'db', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    const client = await pool.connect();
    try {
      // Split the schema into individual statements and execute them
      const statements = schema.split(';').filter(stmt => stmt.trim().length > 0);
      
      for (const statement of statements) {
        try {
          await client.query(statement);
        } catch (err) {
          // Ignore "already exists" errors
          if (!err.message.includes('already exists')) {
            throw err;
          }
          console.log('[v0] Skipping existing object:', statement.substring(0, 50) + '...');
        }
      }
      
      console.log('[v0] Database schema created successfully!');
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('[v0] Error initializing database:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run if this is the main module
if (require.main === module) {
  initializeDatabase().catch((err) => {
    console.error('[v0] Failed to initialize database:', err.message);
    process.exit(1);
  });
}

module.exports = { initializeDatabase };
