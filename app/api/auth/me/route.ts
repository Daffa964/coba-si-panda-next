// app/api/auth/me/route.ts
import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    // Get the session ID from the cookie
    const sessionId = req.cookies.get(auth.sessionCookieName)?.value;

    if (!sessionId) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate the session
    const { session, user } = await auth.validateSession(sessionId);

    if (!session) {
      return Response.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    return Response.json({
      user: {
        id: user.userId,
        nama: user.nama,
        email: user.email,
        role: user.role,
        posyanduId: user.posyanduId,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}