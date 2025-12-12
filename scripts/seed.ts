// scripts/seed.ts
import 'dotenv/config';
import { db } from '../src/lib/db';
import { posyandu, users, anak, pengukuran } from '../src/lib/db/schema';
import * as bcrypt from 'bcrypt';
import { calculateStatusBBU, calculateStatusTBU, calculateStatusBBTB, calculateAgeInMonths } from '../src/utils';

// Helper untuk membuat string acak (QR Token)
const generateRandomString = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Helper untuk nama acak
const firstNames = ['Ahmad', 'Budi', 'Citra', 'Dewi', 'Eko', 'Fajar', 'Gita', 'Hana', 'Indra', 'Joko', 'Kartika', 'Lina', 'Muhammad', 'Nur', 'Putri', 'Rizky', 'Siti', 'Tono', 'Utami', 'Vina', 'Wahyu', 'Yulia', 'Zainal'];
const lastNames = ['Santoso', 'Wijaya', 'Saputra', 'Hidayat', 'Kusuma', 'Pratama', 'Utama', 'Wibowo', 'Yuliana', 'Rahmawati', 'Setiawan', 'Kurniawan', 'Permata', 'Sari', 'Lestari', 'Mulyani', 'Hasanah', 'Putra', 'Ramadhan', 'Hidayah'];

const getRandomName = (gender: 'LAKI-LAKI' | 'PEREMPUAN') => {
  const first = firstNames[Math.floor(Math.random() * firstNames.length)];
  const last = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${first} ${last}`;
};

// Helper untuk tanggal lahir acak (0-5 tahun ke belakang)
const getRandomBirthDate = () => {
  const end = new Date();
  const start = new Date();
  start.setFullYear(end.getFullYear() - 4); // Max 4 tahun
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const seedData = async () => {
  console.log('🌱 Memulai proses seeding...');
  
  try {
    // 1. BERSIHKAN DATA LAMA
    console.log('🧹 Membersihkan data lama...');
    await db.delete(pengukuran);
    await db.delete(anak);
    await db.delete(users);
    await db.delete(posyandu);

    // 2. BUAT POSYANDU (RW 01 - RW 04)
    console.log('🏥 Membuat data Posyandu...');
    const posyanduData = [
      { namaPosyandu: 'Posyandu Mawar (RW 01)', lokasi: 'RW 01, Desa Kramat' },
      { namaPosyandu: 'Posyandu Melati (RW 02)', lokasi: 'RW 02, Desa Kramat' },
      { namaPosyandu: 'Posyandu Anggrek (RW 03)', lokasi: 'RW 03, Desa Kramat' },
      { namaPosyandu: 'Posyandu Tulip (RW 04)', lokasi: 'RW 04, Desa Kramat' },
    ];
    
    // Insert dan ambil ID-nya
    const createdPosyanduIds = [];
    for (const p of posyanduData) {
      const [res] = await db.insert(posyandu).values(p).returning({ id: posyandu.id });
      createdPosyanduIds.push(res.id);
    }

    // 3. BUAT USER BIDAN
    console.log('👩‍⚕️ Membuat akun Bidan...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    await db.insert(users).values({
      nama: 'Bidan Admin',
      email: 'bidan@posyandukramat.id',
      password: hashedPassword,
      role: 'BIDAN',
      posyanduId: null,
    });

    // 4. BUAT USER KADER (5 per Posyandu)
    console.log('👥 Membuat akun Kader...');
    const kaders = [];
    for (let i = 0; i < createdPosyanduIds.length; i++) {
      const posId = createdPosyanduIds[i];
      const rw = i + 1;
      
      for (let k = 1; k <= 5; k++) {
        kaders.push({
          nama: `Kader RW 0${rw} - ${k}`,
          email: `kader.rw0${rw}.${k}@posyandukramat.id`,
          password: hashedPassword,
          role: 'KADER' as const,
          posyanduId: posId,
        });
      }
    }
    
    // Insert Kaders dan ambil ID untuk dicatat sebagai pencatat pengukuran
    const createdKaders = await db.insert(users).values(kaders).returning({ id: users.id, posyanduId: users.posyanduId });

    // 5. BUAT DATA ANAK (20 per Posyandu)
    console.log('👶 Membuat data Anak & Pengukuran...');
    
    for (let i = 0; i < createdPosyanduIds.length; i++) {
      const posId = createdPosyanduIds[i];
      // Cari ID kader yang bertugas di posyandu ini untuk data pengukuran
      const kaderId = createdKaders.find(k => k.posyanduId === posId)?.id || createdKaders[0].id;

      for (let j = 0; j < 20; j++) {
        const gender = Math.random() > 0.5 ? 'LAKI-LAKI' : 'PEREMPUAN';
        const birthDate = getRandomBirthDate();
        
        // Insert Anak
        const [newAnak] = await db.insert(anak).values({
          namaAnak: getRandomName(gender),
          jenisKelamin: gender,
          tanggalLahir: birthDate.toISOString().split('T')[0] as any, // Format YYYY-MM-DD
          namaWali: `Wali ${j + 1}`,
          teleponWali: `0812${Math.floor(Math.random() * 100000000)}`,
          posyanduId: posId,
          qrToken: generateRandomString(),
        }).returning();

        // 6. BUAT PENGUKURAN UNTUK SETIAP ANAK
        // Buat 3-5 data pengukuran mundur ke belakang agar ada grafik
        const numMeasurements = Math.floor(Math.random() * 3) + 3; // 3 sampai 5 pengukuran
        
        for (let m = 0; m < numMeasurements; m++) {
          // Tanggal pengukuran (mundur m bulan dari sekarang)
          const measureDate = new Date();
          measureDate.setMonth(measureDate.getMonth() - m);
          
          // Jangan buat pengukuran sebelum lahir
          if (measureDate < birthDate) continue;

          // Hitung umur saat pengukuran
          const ageMonths = calculateAgeInMonths(birthDate); // Ini umur skrg, kita sesuaikan dikit
          // Aproksimasi umur saat pengukuran
          const ageAtMeasure = Math.max(0, calculateAgeInMonths(birthDate) - m);

          // Generate Berat & Tinggi realistis berdasarkan umur (Random dengan sedikit variasi biar ada kasus stunting/gemuk)
          // Rumus kasar untuk simulasi data: 
          // Berat ~ 3kg + (umur * 0.5) 
          // Tinggi ~ 50cm + (umur * 1.5)
          const variance = (Math.random() * 2) - 1; // -1 to 1 variance
          const berat = 3.2 + (ageAtMeasure * 0.4) + variance;
          const tinggi = 50 + (ageAtMeasure * 1.8) + (variance * 2);

          // Hitung status gizi (menggunakan fungsi util yang sudah kita buat)
          const statusBBU = calculateStatusBBU(ageAtMeasure, berat, gender);
          const statusTBU = calculateStatusTBU(ageAtMeasure, tinggi, gender);
          const statusBBTB = calculateStatusBBTB(tinggi, berat, gender);

          let statusGiziUtama = 'Normal';
          if (statusTBU.color === 'danger') statusGiziUtama = statusTBU.status;
          else if (statusBBTB.color === 'danger') statusGiziUtama = statusBBTB.status;
          else if (statusBBU.color === 'danger') statusGiziUtama = statusBBU.status;
          else if (statusTBU.color === 'warning') statusGiziUtama = statusTBU.status;
          else if (statusBBTB.color === 'warning') statusGiziUtama = statusBBTB.status;
          else if (statusBBU.color === 'warning') statusGiziUtama = statusBBU.status;
          else if (statusBBTB.color === 'primary') statusGiziUtama = statusBBTB.status;
          else statusGiziUtama = "Gizi Baik (Normal)";

          await db.insert(pengukuran).values({
            anakId: newAnak.id,
            tanggalPengukuran: measureDate.toISOString().split('T')[0] as any,
            beratBadanKg: parseFloat(berat.toFixed(2)),
            tinggiBadanCm: parseFloat(tinggi.toFixed(2)),
            zscoreBbU: statusBBU.zScoreApprox,
            zscoreTbU: statusTBU.zScoreApprox,
            zscoreBbTb: statusBBTB.zScoreApprox,
            statusGizi: statusGiziUtama,
            dicatatOleh: kaderId,
          });
        }
      }
    }

    console.log('✅ Database seeded successfully!');
    console.log(`📊 Summary:`);
    console.log(`- 4 Posyandu`);
    console.log(`- 1 Bidan`);
    console.log(`- ${kaders.length} Kader`);
    console.log(`- ${createdPosyanduIds.length * 20} Anak`);
    console.log(`- Ratusan data pengukuran historis`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedData();