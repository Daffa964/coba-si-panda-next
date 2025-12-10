// app/api/auth/logout/route.ts
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { auth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    // Get the session ID from the cookie
    const sessionId = cookies().get(auth.sessionCookieName)?.value;

    if (sessionId) {
      // Invalidate the session
      await auth.invalidateSession(sessionId);
    }

    // Delete the session cookie
    cookies().delete(auth.sessionCookieName);

    return Response.json({
      success: true,
      message: 'Logout berhasil',
    });
  } catch (error) {
    console.error('Logout error:', error);
    return Response.json(
      { success: false, message: 'Terjadi kesalahan saat logout' },
      { status: 500 }
    );
  }
}