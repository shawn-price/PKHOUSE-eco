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

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('[Migration] Starting Phase 1 migration...\n');
    
    // Read migration file
    const migrationPath = path.join(__dirname, '../lib/db/migrations/001_add_phase1_tables.sql');
    const migrationSql = fs.readFileSync(migrationPath, 'utf-8');
    
    // Execute the entire migration as one statement to avoid ordering issues
    await client.query(migrationSql);
    
    console.log('[Migration] ✓ Phase 1 migration completed successfully!\n');
    
    // Verify tables
    const tableCheck = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema='public' 
      ORDER BY table_name
    `);
    
    console.log('[Migration] Database tables:');
    tableCheck.rows.forEach(row => {
      console.log(`  ✓ ${row.table_name}`);
    });
    
    // Show table counts
    console.log(`\n[Migration] Total tables: ${tableCheck.rows.length}`);
    
  } catch (err) {
    console.error('[Migration] ✗ Error:', err.message);
    if (err.detail) console.error('[Migration] Detail:', err.detail);
    process.exit(1);
  } finally {
    client.release();
    pool.end();
  }
}

runMigration();
