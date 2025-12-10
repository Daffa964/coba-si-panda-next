import { db } from '@/lib/db';
import { anak, pengukuran, users } from '@/lib/db/schema';
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import { generateQRToken, calculateAgeInMonths, 
  calculateZScoreBbU, calculateZScoreTbU, calculateZScoreBbTb, 
  classifyNutritionalStatus } from '@/utils';
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
    
    const [newAnak] = await db
      .insert(anak)
      .values({
        namaAnak,
        jenisKelamin,
        tanggalLahir,
        namaWali,
        teleponWali,
        posyanduId,
        qrToken,
      })
      .returning();
    
    return newAnak;
  }

  /**
   * Get all children for a specific posyandu
   */
  async getAnakByPosyandu(posyanduId: number): Promise<Anak[]> {
    return await db
      .select()
      .from(anak)
      .where(eq(anak.posyanduId, posyanduId));
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
    
    return result[0] || null;
  }

  /**
   * Update child information
   */
  async updateAnak(
    id: number,
    updates: Partial<Omit<Anak, 'id' | 'qrToken' | 'createdAt'>>
  ): Promise<Anak | null> {
    const result = await db
      .update(anak)
      .set(updates)
      .where(eq(anak.id, id))
      .returning();
    
    return result[0] || null;
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

  /**
   * Record a new measurement for a child
   */
  async recordPengukuran(
    anakId: number,
    beratBadanKg: number,
    tinggiBadanCm: number,
    dicatatOleh: number
  ): Promise<Pengukuran> {
    // Get child data to calculate age
    const anakData = await this.getAnakById(anakId);
    if (!anakData) {
      throw new Error('Anak tidak ditemukan');
    }

    // Calculate age in months
    const ageInMonths = calculateAgeInMonths(anakData.tanggalLahir);

    // Calculate Z-scores
    const zscoreBbU = calculateZScoreBbU(beratBadanKg, ageInMonths);
    const zscoreTbU = calculateZScoreTbU(tinggiBadanCm, ageInMonths);
    const zscoreBbTb = calculateZScoreBbTb(beratBadanKg, tinggiBadanCm);

    // Classify nutritional status
    const statusGizi = classifyNutritionalStatus(zscoreBbU, zscoreTbU, zscoreBbTb);

    // Insert the measurement record
    const [newPengukuran] = await db
      .insert(pengukuran)
      .values({
        anakId,
        tanggalPengukuran: new Date(),
        beratBadanKg,
        tinggiBadanCm,
        zscoreBbU,
        zscoreTbU,
        zscoreBbTb,
        statusGizi,
        dicatatOleh,
      })
      .returning();

    return newPengukuran;
  }

  /**
   * Get all measurements for a specific child
   */
  async getPengukuranByAnak(anakId: number): Promise<Pengukuran[]> {
    return await db
      .select()
      .from(pengukuran)
      .where(eq(pengukuran.anakId, anakId))
      .orderBy(desc(pengukuran.tanggalPengukuran));
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
    
    return results[0] || null;
  }

  /**
   * Get all measurements within a date range
   */
  async getPengukuranByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<Pengukuran[]> {
    return await db
      .select()
      .from(pengukuran)
      .where(
        and(
          gte(pengukuran.tanggalPengukuran, startDate),
          lte(pengukuran.tanggalPengukuran, endDate)
        )
      )
      .orderBy(desc(pengukuran.tanggalPengukuran));
  }
}