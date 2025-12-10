// scripts/migrate.js
const { migrate } = require('drizzle-orm/node-postgres/migrator');
const { db } = require('../src/lib/db');

const runMigrations = async () => {
  console.log('Starting migrations...');
  try {
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('Migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  }
};

runMigrations();