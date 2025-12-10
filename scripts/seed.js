// scripts/seed.js
const { db } = require('../src/lib/db');
const { posyandu, users } = require('../src/lib/db/schema');
const bcrypt = require('bcrypt');

const seedData = async () => {
  console.log('Seeding database...');
  
  try {
    // Create initial posyandu
    const posyanduList = [
      { namaPosyandu: 'Posyandu RW 01', lokasi: 'RW 01, Desa Kramat' },
      { namaPosyandu: 'Posyandu RW 02', lokasi: 'RW 02, Desa Kramat' },
      { namaPosyandu: 'Posyandu RW 03', lokasi: 'RW 03, Desa Kramat' },
    ];
    
    for (const pos of posyanduList) {
      await db.insert(posyandu).values(pos).onConflictDoNothing();
    }
    
    // Get the created posyandus
    const posyandus = await db.select().from(posyandu);
    
    // Create initial admin/bidan user
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const adminUser = {
      nama: 'Bidan Admin',
      email: 'admin@posyandukramat.id',
      password: hashedPassword,
      role: 'BIDAN',
      posyanduId: null, // Admin can access all posyandus
    };
    
    await db.insert(users).values(adminUser).onConflictDoNothing();
    
    // Create a kader user
    const kaderUser = {
      nama: 'Kader Posyandu',
      email: 'kader@posyandukramat.id',
      password: hashedPassword,
      role: 'KADER',
      posyanduId: posyandus[0]?.id || 1, // Assign to first posyandu
    };
    
    await db.insert(users).values(kaderUser).onConflictDoNothing();
    
    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();