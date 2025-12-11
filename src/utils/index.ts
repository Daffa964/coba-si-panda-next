import QRCode from 'qrcode';
import { differenceInMonths } from 'date-fns';
import { standarTBU, standarBBU, standarBBTB } from './who-standards';

// --- QR Code Utilities ---

export function generateQRToken(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

export async function generateQRCode(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text);
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

// --- Date & Age Utilities ---

export function calculateAgeInMonths(birthDate: Date | string): number {
  const birth = new Date(birthDate);
  const today = new Date();
  return differenceInMonths(today, birth);
}

export function formatDateToIndonesian(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

// --- Nutritional Calculation Utilities ---

interface NutritionalResult {
  status: string;
  color: 'success' | 'warning' | 'danger' | 'primary';
  zScoreApprox: number;
}

/**
 * Hitung Status TB/U (Stunting) berdasarkan Standar WHO
 */
export function calculateStatusTBU(
  ageInMonths: number, 
  height: number, 
  gender: 'LAKI-LAKI' | 'PEREMPUAN'
): NutritionalResult {
  // 1. Validasi umur (data WHO kita 0-60 bulan)
  let age = ageInMonths;
  if (age > 60) age = 60;
  if (age < 0) age = 0;

  // 2. Ambil data referensi
  const standards = standarTBU[gender];
  const standard = standards.find(d => d.bulan === age);

  if (!standard) {
    return { status: 'Data Tidak Ada', color: 'primary', zScoreApprox: 0 };
  }

  // 3. Klasifikasi
  if (height < standard.min3sd) {
    return { status: 'Sangat Pendek (Severely Stunted)', color: 'danger', zScoreApprox: -3.1 };
  } else if (height < standard.min2sd) {
    return { status: 'Pendek (Stunted)', color: 'warning', zScoreApprox: -2.1 };
  } else if (height <= standard.plus2sd) {
    return { status: 'Normal', color: 'success', zScoreApprox: 0 };
  } else {
    return { status: 'Tinggi', color: 'primary', zScoreApprox: 2.1 };
  }
}

/**
 * Hitung Status BB/U (Underweight) berdasarkan Standar WHO
 */
export function calculateStatusBBU(
  ageInMonths: number, 
  weight: number, 
  gender: 'LAKI-LAKI' | 'PEREMPUAN'
): NutritionalResult {
  let age = ageInMonths;
  if (age > 60) age = 60;
  if (age < 0) age = 0;

  const standards = standarBBU[gender];
  const standard = standards.find(d => d.bulan === age);

  if (!standard) {
    return { status: 'Data Tidak Ada', color: 'primary', zScoreApprox: 0 };
  }

  if (weight < standard.min3sd) {
    return { status: 'Berat Badan Sangat Kurang', color: 'danger', zScoreApprox: -3.1 };
  } else if (weight < standard.min2sd) {
    return { status: 'Berat Badan Kurang', color: 'warning', zScoreApprox: -2.1 };
  } else if (weight <= standard.plus2sd) {
    return { status: 'Berat Badan Normal', color: 'success', zScoreApprox: 0 };
  } else {
    return { status: 'Risiko Berat Badan Lebih', color: 'primary', zScoreApprox: 2.1 };
  }
}

/**
 * Hitung Status BB/TB (Wasting) berdasarkan Standar WHO
 */
export function calculateStatusBBTB(
  height: number, 
  weight: number, 
  gender: 'LAKI-LAKI' | 'PEREMPUAN'
): NutritionalResult {
  const standards = standarBBTB[gender];
  
  // Cari data referensi dengan tinggi badan terdekat
  // Karena data array terurut, kita bisa pakai reduce untuk mencari selisih terkecil
  const standard = standards.reduce((prev, curr) => {
    return (Math.abs(curr.tinggi - height) < Math.abs(prev.tinggi - height) ? curr : prev);
  });

  if (!standard) {
    return { status: 'Data Tidak Ada', color: 'primary', zScoreApprox: 0 };
  }

  if (weight < standard.min3sd) {
    return { status: 'Gizi Buruk (Severely Wasted)', color: 'danger', zScoreApprox: -3.1 };
  } else if (weight < standard.min2sd) {
    return { status: 'Gizi Kurang (Wasted)', color: 'warning', zScoreApprox: -2.1 };
  } else if (weight <= standard.plus1sd) {
    return { status: 'Gizi Baik (Normal)', color: 'success', zScoreApprox: 0 };
  } else if (weight <= standard.plus2sd) {
    return { status: 'Berisiko Gizi Lebih', color: 'primary', zScoreApprox: 1.1 };
  } else {
    return { status: 'Gizi Lebih (Overweight)', color: 'primary', zScoreApprox: 2.1 };
  }
}

/**
 * Helper untuk kompatibilitas (jika masih ada kode lama yang memanggil)
 */
export function calculateZScoreBbU(weight: number, age: number): number { return 0; }
export function calculateZScoreTbU(height: number, age: number): number { return 0; }
export function calculateZScoreBbTb(weight: number, height: number): number { return 0; }
export function classifyNutritionalStatus(bbU: number, tbU: number, bbTb: number): string { return 'Lihat Detail'; }