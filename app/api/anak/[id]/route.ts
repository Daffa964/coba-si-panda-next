// app/api/anak/[id]/route.ts
import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { AnakService } from '@/services/anakService';

const anakService = new AnakService();

// Helper untuk validasi session
async function validateUser(req: NextRequest) {
  const sessionId = req.cookies.get(auth.sessionCookieName)?.value;
  if (!sessionId) return null;
  const { session, user } = await auth.validateSession(sessionId);
  if (!session) return null;
  return user;
}

// GET: Ambil detail satu anak
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await validateUser(req);
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const anak = await anakService.getAnakById(parseInt(id));

  if (!anak) {
    return Response.json({ error: 'Anak tidak ditemukan' }, { status: 404 });
  }

  // Cek akses Kader (hanya boleh lihat anak di posyandunya)
  if (user.role === 'KADER' && user.posyanduId !== anak.posyanduId) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  return Response.json({ success: true, anak });
}

// PUT: Update data anak
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await validateUser(req);
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  // Hanya ambil field yang boleh diupdate
  const updates = {
    namaAnak: body.namaAnak,
    jenisKelamin: body.jenisKelamin,
    tanggalLahir: body.tanggalLahir ? new Date(body.tanggalLahir) : undefined,
    namaWali: body.namaWali,
    teleponWali: body.teleponWali,
    posyanduId: body.posyanduId ? parseInt(body.posyanduId) : undefined,
  };

  // Hapus field undefined
  Object.keys(updates).forEach(key => (updates as any)[key] === undefined && delete (updates as any)[key]);

  try {
    const updatedAnak = await anakService.updateAnak(parseInt(id), updates);
    return Response.json({ success: true, message: 'Data berhasil diupdate', anak: updatedAnak });
  } catch (error) {
    return Response.json({ error: 'Gagal update data' }, { status: 500 });
  }
}

// DELETE: Hapus data anak
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await validateUser(req);
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  // Hanya BIDAN yang boleh menghapus data anak
  if (user.role !== 'BIDAN') {
    return Response.json({ error: 'Hanya Bidan yang dapat menghapus data' }, { status: 403 });
  }

  const { id } = await params;
  
  try {
    // Note: Ini akan error jika ada data pengukuran (Foreign Key constraint).
    // Idealnya hapus pengukuran dulu, tapi untuk sekarang kita coba hapus anak langsung.
    // Jika Drizzle schema pakai `onDelete: cascade`, pengukuran akan otomatis terhapus.
    const success = await anakService.deleteAnak(parseInt(id));
    if (success) {
      return Response.json({ success: true, message: 'Data anak berhasil dihapus' });
    } else {
      return Response.json({ error: 'Data tidak ditemukan' }, { status: 404 });
    }
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Gagal menghapus data. Pastikan riwayat pengukuran sudah kosong.' }, { status: 500 });
  }
}