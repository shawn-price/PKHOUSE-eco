#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function runMigrations() {
  const client = await pool.connect();
  
  try {
    console.log('[Migration] Starting database migrations...');
    
    // Read the full schema file
    const schemaPath = path.join(__dirname, '../lib/db/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    
    // Split by semicolon and execute each statement
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const statement of statements) {
      try {
        // Skip comments
        if (statement.startsWith('--')) continue;
        
        await client.query(statement);
        successCount++;
        console.log('[Migration] ✓ Executed statement');
      } catch (err) {
        // Ignore "already exists" errors
        if (err.message.includes('already exists') || err.message.includes('ERROR: relation')) {
          console.log('[Migration] ⊘ Skipped (already exists)');
        } else {
          console.error('[Migration] ✗ Error:', err.message);
          errorCount++;
        }
      }
    }
    
    console.log(`\n[Migration] Complete! Executed: ${successCount}, Errors: ${errorCount}`);
    
    // Verify tables were created
    const tableCheck = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema='public' 
      ORDER BY table_name
    `);
    
    console.log('\n[Migration] Created tables:');
    tableCheck.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
  } catch (err) {
    console.error('[Migration] Fatal error:', err);
    process.exit(1);
  } finally {
    client.release();
    pool.end();
  }
}

runMigrations();
