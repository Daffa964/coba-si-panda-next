// app/api/posyandu/route.ts
import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { posyandu } from '@/lib/db/schema';

export async function GET(req: NextRequest) {
  const sessionId = req.cookies.get(auth.sessionCookieName)?.value;
  if (!sessionId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { session } = await auth.validateSession(sessionId);
  if (!session) return Response.json({ error: 'Invalid session' }, { status: 401 });

  try {
    // Ambil semua data posyandu
    const data = await db.select().from(posyandu);
    return Response.json({ success: true, data });
  } catch (error) {
    return Response.json({ error: 'Gagal mengambil data posyandu' }, { status: 500 });
  }
}