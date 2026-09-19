// Run repair tracking migration
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'besmindo_inspection',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function runMigration() {
  const client = await pool.connect();
  try {
    console.log('Running repair tracking migration...');
    
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'migrations', 'add_repair_tracking.sql'),
      'utf8'
    );
    
    await client.query(migrationSQL);
    console.log('✅ Migration completed successfully!');
    
    // Verify new columns
    const result = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'inspection_results' 
      AND column_name IN ('repair_status', 'repaired_at', 'repaired_by', 'repair_notes')
      ORDER BY column_name;
    `);
    
    console.log('\n✅ New columns added:');
    result.rows.forEach(row => {
      console.log(`   - ${row.column_name}: ${row.data_type}`);
    });
    
    // Check repair_history table
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'repair_history'
      );
    `);
    
    if (tableCheck.rows[0].exists) {
      console.log('\n✅ repair_history table created successfully');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
