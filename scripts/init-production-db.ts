#!/usr/bin/env tsx

/**
 * Initialize production database tables
 *
 * This script creates the transactions and payments tables
 * in your Vercel Postgres database using the connection
 * string from your .env.local file.
 */

import { config } from 'dotenv';
import { sql } from '@vercel/postgres';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

// Verify that POSTGRES_URL is available
if (!process.env.POSTGRES_URL) {
  console.error('❌ Error: POSTGRES_URL environment variable not found!');
  console.error('\nPlease make sure your .env.local file contains:');
  console.error('POSTGRES_URL=your_connection_string_here\n');
  console.error('You can find this in your Vercel Dashboard:');
  console.error('1. Go to your project');
  console.error('2. Click Storage → your database');
  console.error('3. Click ".env.local" tab');
  console.error('4. Copy the POSTGRES_URL value\n');
  process.exit(1);
}

async function createTables() {
  console.log('🚀 Starting database initialization...');
  console.log('📡 Connecting to:', process.env.POSTGRES_URL?.split('@')[1]?.split('?')[0] || 'database');
  console.log('');

  try {
    // Create transactions table
    console.log('Creating transactions table...');
    await sql`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        person_name VARCHAR(255) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        type VARCHAR(20) NOT NULL CHECK (type IN ('lent_out', 'borrowed')),
        description TEXT,
        transaction_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        due_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('✅ Transactions table created\n');

    // Create payments table
    console.log('Creating payments table...');
    await sql`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        transaction_id INTEGER NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
        amount DECIMAL(10, 2) NOT NULL,
        payment_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('✅ Payments table created\n');

    // Create indexes
    console.log('Creating indexes...');
    await sql`
      CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
    `;
    console.log('✅ Index on user_id created');

    await sql`
      CREATE INDEX IF NOT EXISTS idx_transactions_person_name ON transactions(user_id, person_name);
    `;
    console.log('✅ Index on user_id, person_name created');

    await sql`
      CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON payments(transaction_id);
    `;
    console.log('✅ Index on transaction_id created\n');

    console.log('🎉 Database initialization completed successfully!');
    console.log('\nYour database is now ready to use.');
    console.log('You can start using your IOU app at https://iou.birgir.se\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    if (error instanceof Error) {
      console.error('Details:', error.message);
    }
    process.exit(1);
  }
}

// Run the script
createTables();
