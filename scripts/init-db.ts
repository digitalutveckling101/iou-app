import { config } from 'dotenv';
import { createTables } from '../lib/db';

// Ladda miljövariabler från .env.local
config({ path: '.env.local' });

async function main() {
  console.log('Initierar databas...');

  try {
    await createTables();
    console.log('✅ Databastabeller skapade!');
  } catch (error) {
    console.error('❌ Fel vid skapande av tabeller:', error);
    process.exit(1);
  }
}

main();
