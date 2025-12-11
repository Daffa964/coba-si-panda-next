import { db } from '@/lib/db';
import { anak, pengukuran } from '@/lib/db/schema';
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import { 
  generateQRToken, 
  calculateAgeInMonths, 
  calculateStatusBBU,
  calculateStatusTBU,
  calculateStatusBBTB
} from '@/utils';
import { Anak, Pengukuran } from '@/types';

/**
 * Service for managing child records in the SI-PANDA system
 */
export class AnakService {
  /**
   * Create a new child record
   */
  async createAnak(
    namaAnak: string,
    jenisKelamin: 'LAKI-LAKI' | 'PEREMPUAN',
    tanggalLahir: Date,
    namaWali: string,
    teleponWali: string | null,
    posyanduId: number
  ): Promise<Anak> {
    const qrToken = generateQRToken();
    
    // FIX: Konversi Date ke String 'YYYY-MM-DD' untuk Drizzle
    const tanggalLahirStr = tanggalLahir.toISOString().split('T')[0];

    const [newAnak] = await db
      .insert(anak)
      .values({
        namaAnak,
        jenisKelamin,
        tanggalLahir: tanggalLahirStr as any, // Cast ke any/string agar tipe Drizzle tidak error
        namaWali,
        teleponWali,
        posyanduId,
        qrToken,
      })
      .returning();
    
    // Kita harus mengembalikan object yang sesuai dengan interface Anak (Date)
    // Drizzle biasanya mengembalikan string untuk kolom date, jadi kita perlu memastikan tipenya
    return {
      ...newAnak,
      tanggalLahir: new Date(newAnak.tanggalLahir)
    } as unknown as Anak;
  }

  /**
   * Get all children for a specific posyandu
   */
  async getAnakByPosyandu(posyanduId: number): Promise<Anak[]> {
    const results = await db
      .select()
      .from(anak)
      .where(eq(anak.posyanduId, posyanduId));
      
    // Konversi string date dari DB kembali ke Object Date untuk frontend
    return results.map(a => ({
      ...a,
      tanggalLahir: new Date(a.tanggalLahir)
    })) as unknown as Anak[];
  }

  /**
   * Get child by ID
   */
  async getAnakById(id: number): Promise<Anak | null> {
    const result = await db
      .select()
      .from(anak)
      .where(eq(anak.id, id))
      .limit(1);
    
    if (!result[0]) return null;

    return {
      ...result[0],
      tanggalLahir: new Date(result[0].tanggalLahir)
    } as unknown as Anak;
  }

  /**
   * Update child information
   */
  async updateAnak(
    id: number,
    updates: Partial<Omit<Anak, 'id' | 'qrToken' | 'createdAt'>>
  ): Promise<Anak | null> {
    // Persiapkan object updates yang bersih
    const cleanUpdates: any = { ...updates };
    
    // FIX: Jika ada update tanggal lahir, konversi ke string
    if (updates.tanggalLahir instanceof Date) {
      cleanUpdates.tanggalLahir = updates.tanggalLahir.toISOString().split('T')[0];
    }

    const result = await db
      .update(anak)
      .set(cleanUpdates)
      .where(eq(anak.id, id))
      .returning();
    
    if (!result[0]) return null;

    return {
      ...result[0],
      tanggalLahir: new Date(result[0].tanggalLahir)
    } as unknown as Anak;
  }

  /**
   * Delete a child record
   */
  async deleteAnak(id: number): Promise<boolean> {
    const result = await db
      .delete(anak)
      .where(eq(anak.id, id))
      .returning();
    
    return result.length > 0;
  }

  async getAllAnak(): Promise<Anak[]> {
    const results = await db
      .select()
      .from(anak);
      
    // Konversi string date dari DB kembali ke Object Date
    return results.map(a => ({
      ...a,
      tanggalLahir: new Date(a.tanggalLahir)
    })) as unknown as Anak[];
  }

  /**
   * Record a new measurement for a child
   * UPDATED: Menggunakan Standar WHO Baru & Fix Date Error
   */
  async recordPengukuran(
    anakId: number,
    beratBadanKg: number,
    tinggiBadanCm: number,
    dicatatOleh: number
  ): Promise<Pengukuran> {
    // 1. Ambil data anak untuk menghitung umur
    const anakData = await this.getAnakById(anakId);
    if (!anakData) {
      throw new Error('Anak tidak ditemukan');
    }

    // 2. Hitung umur dalam bulan
    const ageInMonths = calculateAgeInMonths(anakData.tanggalLahir);

    // 3. Hitung Status Gizi Lengkap (BB/U, TB/U, BB/TB)
    const statusBBU = calculateStatusBBU(ageInMonths, beratBadanKg, anakData.jenisKelamin);
    const statusTBU = calculateStatusTBU(ageInMonths, tinggiBadanCm, anakData.jenisKelamin);
    const statusBBTB = calculateStatusBBTB(tinggiBadanCm, beratBadanKg, anakData.jenisKelamin);

    // 4. Tentukan Status Utama
    let statusGiziUtama = 'Normal';
    if (statusTBU.color === 'danger') statusGiziUtama = statusTBU.status;
    else if (statusBBTB.color === 'danger') statusGiziUtama = statusBBTB.status;
    else if (statusBBU.color === 'danger') statusGiziUtama = statusBBU.status;
    else if (statusTBU.color === 'warning') statusGiziUtama = statusTBU.status;
    else if (statusBBTB.color === 'warning') statusGiziUtama = statusBBTB.status;
    else if (statusBBU.color === 'warning') statusGiziUtama = statusBBU.status;
    else if (statusBBTB.color === 'primary') statusGiziUtama = statusBBTB.status;
    else statusGiziUtama = "Gizi Baik (Normal)";

    // FIX: Generate tanggal hari ini sebagai string
    const todayStr = new Date().toISOString().split('T')[0];

    // 5. Simpan ke database
    const [newPengukuran] = await db
      .insert(pengukuran)
      .values({
        anakId,
        tanggalPengukuran: todayStr as any, // FIX: Pass string, bukan Date object
        beratBadanKg,
        tinggiBadanCm,
        zscoreBbU: statusBBU.zScoreApprox,
        zscoreTbU: statusTBU.zScoreApprox,
        zscoreBbTb: statusBBTB.zScoreApprox,
        statusGizi: statusGiziUtama,
        dicatatOleh,
      })
      .returning();

    // Kembalikan dengan konversi tanggal yang benar agar sesuai tipe TypeScript
    return {
      ...newPengukuran,
      tanggalPengukuran: new Date(newPengukuran.tanggalPengukuran)
    } as unknown as Pengukuran;
  }

  /**
   * Get all measurements for a specific child
   */
  async getPengukuranByAnak(anakId: number): Promise<Pengukuran[]> {
    const results = await db
      .select()
      .from(pengukuran)
      .where(eq(pengukuran.anakId, anakId))
      .orderBy(desc(pengukuran.tanggalPengukuran));

    return results.map(p => ({
      ...p,
      tanggalPengukuran: new Date(p.tanggalPengukuran)
    })) as unknown as Pengukuran[];
  }

  /**
   * Get the latest measurement for a child
   */
  async getLatestPengukuran(anakId: number): Promise<Pengukuran | null> {
    const results = await db
      .select()
      .from(pengukuran)
      .where(eq(pengukuran.anakId, anakId))
      .orderBy(desc(pengukuran.tanggalPengukuran))
      .limit(1);
    
    if (!results[0]) return null;

    return {
      ...results[0],
      tanggalPengukuran: new Date(results[0].tanggalPengukuran)
    } as unknown as Pengukuran;
  }

  /**
   * Get all measurements within a date range
   */
  async getPengukuranByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<Pengukuran[]> {
    // FIX: Konversi Date ke string 'YYYY-MM-DD' untuk filter Drizzle
    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];

    const results = await db
      .select()
      .from(pengukuran)
      .where(
        and(
          gte(pengukuran.tanggalPengukuran, startStr), // FIX: Gunakan string
          lte(pengukuran.tanggalPengukuran, endStr)    // FIX: Gunakan string
        )
      )
      .orderBy(desc(pengukuran.tanggalPengukuran));

    return results.map(p => ({
      ...p,
      tanggalPengukuran: new Date(p.tanggalPengukuran)
    })) as unknown as Pengukuran[];
  }

  async getAnakByToken(token: string): Promise<Anak | null> {
    const result = await db
      .select()
      .from(anak)
      .where(eq(anak.qrToken, token))
      .limit(1);
    
    if (!result[0]) return null;

    return {
      ...result[0],
      tanggalLahir: new Date(result[0].tanggalLahir)
    } as unknown as Anak;
  }
}