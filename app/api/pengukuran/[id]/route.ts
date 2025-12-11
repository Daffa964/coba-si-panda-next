// app/api/pengukuran/[id]/route.ts
import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { AnakService } from '@/services/anakService';

const anakService = new AnakService();

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const sessionId = req.cookies.get(auth.sessionCookieName)?.value;
  if (!sessionId) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  
  const { session, user } = await auth.validateSession(sessionId);
  if (!session) return Response.json({ error: 'Invalid session' }, { status: 401 });

  // Hanya BIDAN yang boleh menghapus history pengukuran (untuk keamanan data)
  if (user.role !== 'BIDAN') {
    return Response.json({ error: 'Hanya Bidan yang dapat menghapus riwayat pengukuran' }, { status: 403 });
  }

  const { id } = await params;

  try {
    const success = await anakService.deletePengukuran(parseInt(id));
    if (success) {
      return Response.json({ success: true, message: 'Pengukuran berhasil dihapus' });
    } else {
      return Response.json({ error: 'Data tidak ditemukan' }, { status: 404 });
    }
  } catch (error) {
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}