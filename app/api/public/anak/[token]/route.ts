// app/api/public/anak/[token]/route.ts
import { NextRequest } from 'next/server';
import { AnakService } from '@/services/anakService';

const anakService = new AnakService();

export async function GET(
  req: NextRequest,
  // Mengakses dynamic route params di Next.js 15
  { params }: { params: Promise<{ token: string }> } 
) {
  try {
    // Await params di Next.js 15
    const { token } = await params;

    if (!token) {
      return Response.json({ error: 'Token diperlukan' }, { status: 400 });
    }

    // 1. Cari Anak by Token
    const dataAnak = await anakService.getAnakByToken(token);

    if (!dataAnak) {
      return Response.json({ error: 'Data tidak ditemukan atau QR Token tidak valid' }, { status: 404 });
    }

    // 2. Cari Riwayat Pengukuran Anak
    // Kita gunakan method yang sudah ada
    const resultPengukuran = await anakService.getPengukuranByAnak(dataAnak.id);

    // 3. Return Data (Hanya data yang aman untuk publik)
    return Response.json({
      success: true,
      anak: {
        namaAnak: dataAnak.namaAnak,
        jenisKelamin: dataAnak.jenisKelamin,
        tanggalLahir: dataAnak.tanggalLahir,
        namaWali: dataAnak.namaWali,
        // Kita sembunyikan ID internal dan data sensitif lain jika perlu
      },
      pengukuran: resultPengukuran
    });

  } catch (error) {
    console.error('Public QR API Error:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}