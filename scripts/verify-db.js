#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function verifyDatabase() {
  try {
    console.log('[v0] Verifying database tables...\n');

    const client = await pool.connect();
    try {
      // Get all tables
      const result = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
      `);

      console.log('[v0] Tables created:');
      if (result.rows.length === 0) {
        console.log('  ❌ No tables found!');
      } else {
        result.rows.forEach(row => {
          console.log(`  ✓ ${row.table_name}`);
        });
      }

      // Get column counts
      console.log('\n[v0] Table column counts:');
      const tables = result.rows.map(r => r.table_name);
      
      for (const table of tables) {
        const colResult = await client.query(`
          SELECT COUNT(*) as col_count 
          FROM information_schema.columns 
          WHERE table_name = $1
        `, [table]);
        
        console.log(`  ${table}: ${colResult.rows[0].col_count} columns`);
      }

      console.log('\n[v0] Database verification complete! ✓');
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('[v0] Error verifying database:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  verifyDatabase().catch((err) => {
    console.error('[v0] Failed to verify database:', err.message);
    process.exit(1);
  });
}

module.exports = { verifyDatabase };
