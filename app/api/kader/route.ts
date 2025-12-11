// app/api/kader/route.ts
import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { users, posyandu } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

// GET: Ambil daftar semua kader
export async function GET(req: NextRequest) {
  const sessionId = req.cookies.get(auth.sessionCookieName)?.value;
  if (!sessionId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { session, user } = await auth.validateSession(sessionId);
  if (!session || user.role !== 'BIDAN') {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    // Join users dengan posyandu untuk menampilkan nama posyandu
    const kaderList = await db
      .select({
        id: users.id,
        nama: users.nama,
        email: users.email,
        posyandu: posyandu.namaPosyandu,
        createdAt: users.createdAt,
      })
      .from(users)
      .leftJoin(posyandu, eq(users.posyanduId, posyandu.id))
      .where(eq(users.role, 'KADER'));

    return Response.json({ success: true, data: kaderList });
  } catch (error) {
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Tambah Kader Baru
export async function POST(req: NextRequest) {
  const sessionId = req.cookies.get(auth.sessionCookieName)?.value;
  if (!sessionId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { session, user } = await auth.validateSession(sessionId);
  if (!session || user.role !== 'BIDAN') {
    return Response.json({ error: 'Hanya Bidan yang bisa menambah kader' }, { status: 403 });
  }

  try {
    const { nama, email, password, posyanduId } = await req.json();

    if (!nama || !email || !password || !posyanduId) {
      return Response.json({ error: 'Semua field wajib diisi' }, { status: 400 });
    }

    // Cek email duplikat
    const existingUser = await db.select().from(users).where(eq(users.email, email));
    if (existingUser.length > 0) {
      return Response.json({ error: 'Email sudah terdaftar' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan ke DB
    await db.insert(users).values({
      nama,
      email,
      password: hashedPassword,
      role: 'KADER',
      posyanduId: parseInt(posyanduId),
    });

    return Response.json({ success: true, message: 'Kader berhasil ditambahkan' });
  } catch (error) {
    console.error('Add kader error:', error);
    return Response.json({ error: 'Gagal menambah kader' }, { status: 500 });
  }
}