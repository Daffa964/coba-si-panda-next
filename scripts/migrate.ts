// scripts/migrate.ts
import 'dotenv/config';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db } from '../src/lib/db';

const runMigrations = async () => {
  console.log('Starting migrations...');
  try {
    // Folder output migrasi Anda (sesuai drizzle.config.ts)
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('Migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  }
};

runMigrations();