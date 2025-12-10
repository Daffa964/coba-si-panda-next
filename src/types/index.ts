// Type definitions for SI-PANDA application

export type UserRole = 'BIDAN' | 'KADER';

export type Gender = 'LAKI-LAKI' | 'PEREMPUAN';

export interface User {
  id: number;
  nama: string;
  email: string;
  role: UserRole;
  posyanduId: number | null;
  createdAt: Date;
}

export interface Posyandu {
  id: number;
  namaPosyandu: string;
  lokasi: string;
}

export interface Anak {
  id: number;
  namaAnak: string;
  jenisKelamin: Gender;
  tanggalLahir: Date;
  namaWali: string;
  teleponWali: string | null;
  posyanduId: number;
  qrToken: string;
  createdAt: Date;
}

export interface Pengukuran {
  id: number;
  anakId: number;
  tanggalPengukuran: Date;
  beratBadanKg: number;
  tinggiBadanCm: number;
  zscoreBbU: number | null;
  zscoreTbU: number | null;
  zscoreBbTb: number | null;
  statusGizi: string;
  dicatatOleh: number;
  createdAt: Date;
}

export interface Session {
  user: User;
  session: {
    id: string;
    expiresAt: Date;
  };
}

// Nutritional status types
export type NutritionalStatus = 
  | 'Normal' 
  | 'Risiko Stunting' 
  | 'Stunting' 
  | 'Underweight' 
  | 'Overweight' 
  | 'Obese';

// Z-score ranges
export interface ZScore {
  bb_u: number | null; // Weight for Age
  tb_u: number | null; // Height for Age
  bb_tb: number | null; // Weight for Height
}